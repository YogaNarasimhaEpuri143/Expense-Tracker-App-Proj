import * as cdk from "aws-cdk-lib";
import { Peer, Port, SecurityGroup, Subnet, Vpc } from "aws-cdk-lib/aws-ec2";
import { AwsLogDriverMode, Cluster, ContainerImage, FargateService, FargateTaskDefinition, LogDrivers } from "aws-cdk-lib/aws-ecs";
import { NetworkLoadBalancer, NetworkTargetGroup, Protocol, TargetType } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { Construct } from "constructs";

export class ExpenseTrackerServices extends cdk.Stack {
  constructor(scope: Construct, id: string, params: cdk.StackProps) {
    super(scope, id, { ...params, description: "This is a deploying self managed Mysql Kafka." });

    // Get the VpcId and VPC
    const vpcId = cdk.aws_ssm.StringParameter.valueFromLookup(this, "VpcId");
    const vpc = Vpc.fromLookup(this, "VpcImported", { vpcId: vpcId });

    // Get Private subnets
    const privateSubnet1Imported = cdk.aws_ssm.StringParameter.valueFromLookup(this, "PrivateSubnet-0");
    const privateSubnet2Imported = cdk.aws_ssm.StringParameter.valueFromLookup(this, "PrivateSubnet-1");
    const privateSubnet1 = Subnet.fromSubnetId(this, "PrivateSubnet1", privateSubnet1Imported);
    const privateSubnet2 = Subnet.fromSubnetId(this, "PrivateSubnet2", privateSubnet2Imported);

    // Security Group
    const dbSecurityGroup = new SecurityGroup(this, "DBSecurityGroup", {
      vpc: vpc,
      allowAllOutbound: true,
    });

    dbSecurityGroup.addIngressRule(Peer.ipv4(vpc.vpcCidrBlock), Port.tcp(3306), "Allow MySQL Traffic");
    dbSecurityGroup.addIngressRule(Peer.ipv4(vpc.vpcCidrBlock), Port.tcp(9092), "Allow Kafka Traffic");
    dbSecurityGroup.addIngressRule(Peer.ipv4(vpc.vpcCidrBlock), Port.tcp(2181), "Allow Kafka to access Zookeeper");

    const cluster = new Cluster(this, "DatabaseKafkaCluster", { vpc, defaultCloudMapNamespace: { name: "local" } });

    const nlb = new NetworkLoadBalancer(this, "DBNetworkLoadBalancer", { vpc, internetFacing: false, vpcSubnets: { subnets: [privateSubnet1, privateSubnet2] } });

    // Task Up (Task Definition)
    // 1. using EC2
    // 2. using Fargate

    // blueprint for your containerized application.
    const mysqlTaskDefinition = new FargateTaskDefinition(this, "MysqlTaskDefintion", { cpu: 256, memoryLimitMiB: 512 }); // Resources
    mysqlTaskDefinition.addContainer("MySQLContainer", {
      image: ContainerImage.fromRegistry("mysql:8.3.0"),
      environment: { MYSQL_ROOT_PASSWORD: "password", MYSQL_USER: "user", MYSQL_PASSWORD: "password", MYSQL_ROOT_USER: "root" },
      logging: LogDrivers.awsLogs({ streamPrefix: "MySql", mode: AwsLogDriverMode.NON_BLOCKING, maxBufferSize: cdk.Size.mebibytes(25) }),
      portMappings: [{ containerPort: 3306 }],
    }); // What to run

    const zookeeperTaskDefinition = new FargateTaskDefinition(this, "ZookeeperTaskDefintion", { cpu: 256, memoryLimitMiB: 512 }); // Resources
    zookeeperTaskDefinition.addContainer("ZookeeperContainer", {
      image: ContainerImage.fromRegistry("confluentinc/cp-zookeeper:7.4.4"),
      environment: { ZOOKEEPER_CLIENT_PORT: "2181", ZOOKEEPER_TICK_TIME: "2000" },
      logging: LogDrivers.awsLogs({ streamPrefix: "Zookeeper", mode: AwsLogDriverMode.NON_BLOCKING, maxBufferSize: cdk.Size.mebibytes(25) }),
      portMappings: [{ containerPort: 2181 }],
    }); // What to run

    const KafkaTaskDefinition = new FargateTaskDefinition(this, "KafkaTaskDefintion", { cpu: 512, memoryLimitMiB: 1024 }); // Resources
    KafkaTaskDefinition.addContainer("KafkaContainer", {
      image: ContainerImage.fromRegistry("confluentinc/cp-kafka:7.4.4"),
      environment: {
        KAFKA_BROKER_ID: "1",
        KAFKA_ZOOKEEPER_CONNECT: "zookeeper-service.local:2181",
        KAFKA_ADVERTISED_LISTENERS: `PLAINTEXT://${nlb.loadBalancerDnsName}:9092`,
        KAFKA_LISTENERS: "PLAINTEXT://:9092",
        KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: "PLAINTEXT:PLAINTEXT",
        KAFKA_INTER_BROKER_LISTENER_NAME: "PLAINTEXT",
        KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: "3",
      },
      logging: LogDrivers.awsLogs({ streamPrefix: "Kafka", mode: AwsLogDriverMode.NON_BLOCKING, maxBufferSize: cdk.Size.mebibytes(25) }),
      portMappings: [{ containerPort: 9092 }],
    }); // What to run

    // Service
    const mysqlService = new FargateService(this, "MYSQLService", {
      cluster,
      taskDefinition: mysqlTaskDefinition,
      desiredCount: 3,
      securityGroups: [dbSecurityGroup],
      vpcSubnets: { subnets: [privateSubnet1, privateSubnet2] },
    });

    const zookeeperService = new FargateService(this, "ZookeeperService", {
      cluster,
      taskDefinition: zookeeperTaskDefinition,
      desiredCount: 3,
      securityGroups: [dbSecurityGroup],
      vpcSubnets: { subnets: [privateSubnet1, privateSubnet2] },
      cloudMapOptions: { name: "zookeeper-service" },
    });

    const kafkaService = new FargateService(this, "KafkaService", {
      cluster,
      taskDefinition: KafkaTaskDefinition,
      desiredCount: 3,
      securityGroups: [dbSecurityGroup],
      vpcSubnets: { subnets: [privateSubnet1, privateSubnet2] },
    });

    // Target Groups
    const mysqlTargetGroup = new NetworkTargetGroup(this, "MySQLTargetGroup", { vpc, port: 3306, protocol: Protocol.TCP, targetType: TargetType.IP }); // Specifies how the load balancer communicates with targets
    const kafkaTargetGroup = new NetworkTargetGroup(this, "KafkaTargetGroup", { vpc, port: 9092, protocol: Protocol.TCP, targetType: TargetType.IP });

    mysqlTargetGroup.addTarget(mysqlService);
    kafkaTargetGroup.addTarget(kafkaService);

    nlb.addListener("MYSQLListener", { port: 3306, protocol: Protocol.TCP, defaultTargetGroups: [mysqlTargetGroup] });
    nlb.addListener("KafkaListener", { port: 9092, protocol: Protocol.TCP, defaultTargetGroups: [kafkaTargetGroup] });

    // Exports
    new cdk.aws_ssm.StringParameter(this, "ExpenseTrackerServiceNLB", { parameterName: "ExpenseTrackerServiceNLB", stringValue: nlb.loadBalancerDnsName });
  }
}
