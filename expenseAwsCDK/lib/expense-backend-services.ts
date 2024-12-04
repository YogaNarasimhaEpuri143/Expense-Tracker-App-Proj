import * as cdk from "aws-cdk-lib";
import { SecurityGroup, Subnet, Vpc } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import path = require("path");
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as assets from "aws-cdk-lib/aws-ecr-assets";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as servicediscovery from "aws-cdk-lib/aws-servicediscovery";

export class ExpenseBackensServices extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, { ...props, description: "The stack is about deploying all the backend services and kong" });

    // Imports from the Parameter Store
    const vpcId = cdk.aws_ssm.StringParameter.valueFromLookup(this, "VpcId");
    const privateSubnet1Imported = cdk.aws_ssm.StringParameter.valueFromLookup(this, "PrivateSubnet-0");
    const privateSubnet2Imported = cdk.aws_ssm.StringParameter.valueFromLookup(this, "PrivateSubnet-1");

    const publicSubnet1Imported = cdk.aws_ssm.StringParameter.valueFromLookup(this, "PublicSubnet-0");
    const publicSubnet2Imported = cdk.aws_ssm.StringParameter.valueFromLookup(this, "PublicSubnet-0");

    const nlbDnsName = cdk.aws_ssm.StringParameter.valueFromLookup(this, "ExpenseTrackerServiceNLB");

    // Get access of the resources using Ids from parameter store
    const vpc = Vpc.fromLookup(this, "VpcImported", { vpcId: vpcId });
    const privateSubnet1 = Subnet.fromSubnetId(this, "PrivateSubnet1", privateSubnet1Imported);
    const privateSubnet2 = Subnet.fromSubnetId(this, "PrivateSubnet2", privateSubnet2Imported);
    const publicSubnet1 = Subnet.fromSubnetId(this, "PublicSubnet1", publicSubnet1Imported);
    const publicSubnet2 = Subnet.fromSubnetId(this, "PublicSubnet2", publicSubnet2Imported);

    // Namespace
    const namespace = new servicediscovery.PrivateDnsNamespace(this, "BackendNamespace", {
      name: "public",
      vpc,
      description: "namespace for expense backend services",
    });

    // ECS Cluster (For Services)
    const cluster = new ecs.Cluster(this, "ExpenseBackendCluster", { vpc });

    // Security Group for both AuthService
    const servicesSecurityGroup = new SecurityGroup(this, "BackendServicesSecurityGroup", { vpc, allowAllOutbound: true, description: "Security Group for all the Services" });
    const kongSecurityGroup = new SecurityGroup(this, "KongSecurityGroup", { vpc, allowAllOutbound: true, description: "Security Group for Kong" });

    servicesSecurityGroup.addIngressRule(kongSecurityGroup, ec2.Port.tcp(9898), "Allow traffic from Kong to Auth Service");

    // Images from Dockerfile
    const kongServiceImage = new assets.DockerImageAsset(this, "KongServiceImage", { directory: path.join(__dirname, "..", "..", "docker_infrastructure", "kong") });
    const authServiceImage = new assets.DockerImageAsset(this, "AuthServiceImage", { directory: path.join(__dirname, "..", "..", "backend_services", "authservice") });
    const userServiceImage = new assets.DockerImageAsset(this, "UserServiceImage", { directory: path.join(__dirname, "..", "..", "backend_services", "userservice") });
    const expenseServiceImage = new assets.DockerImageAsset(this, "ExpenseServiceImage", { directory: path.join(__dirname, "..", "..", "backend_services", "expenseservice") });
    const dsServiceImage = new assets.DockerImageAsset(this, "dsServiceImage", { directory: path.join(__dirname, "..", "..", "backend_services", "dsservice") });

    // Task Definitions
    const kongServiceTaskDef = new ecs.FargateTaskDefinition(this, "kongServiceTaskDef", { cpu: 256, memoryLimitMiB: 512 });
    const authServiceTaskDef = new ecs.FargateTaskDefinition(this, "AuthServiceTaskDef", { cpu: 512, memoryLimitMiB: 1024 });
    const userServiceTaskDef = new ecs.FargateTaskDefinition(this, "UserServiceTaskDef", { cpu: 512, memoryLimitMiB: 1024 });
    const expenseServiceTaskDef = new ecs.FargateTaskDefinition(this, "ExpenseServiceTaskDef", { cpu: 512, memoryLimitMiB: 1024 });
    const dsServiceTaskDef = new ecs.FargateTaskDefinition(this, "DsServiceTaskDef", { cpu: 256, memoryLimitMiB: 512 });

    // Adding Containers
    // Auth Service
    authServiceTaskDef.addContainer("AuthServiceContainer", {
      image: ecs.ContainerImage.fromDockerImageAsset(authServiceImage),
      portMappings: [{ containerPort: 9898 }],
      logging: ecs.LogDrivers.awsLogs({ streamPrefix: "AuthService", mode: ecs.AwsLogDriverMode.NON_BLOCKING, logRetention: RetentionDays.ONE_WEEK }),
      environment: {
        MYSQL_HOST: nlbDnsName,
        MYSQL_PORT: "3306",
        MYSQL_DB: "authservice",
        MYSQL_USER: "user",
        MYSQL_PASSWORD: "password",
        KAFKA_HOST: nlbDnsName,
        KAFKA_PORT: "9092",
      },
    });

    // Kong Service
    kongServiceTaskDef.addContainer("KongServiceContainer", {
      image: ecs.ContainerImage.fromDockerImageAsset(kongServiceImage),
      logging: ecs.LogDriver.awsLogs({
        streamPrefix: "KongService",
        logRetention: RetentionDays.ONE_WEEK,
      }),
      portMappings: [
        { containerPort: 8000 }, // Kong proxy port
        { containerPort: 8001 }, // Kong admin API port
      ],
    });

    // User Service
    userServiceTaskDef.addContainer("UserServiceContainer", {
      image: ecs.ContainerImage.fromDockerImageAsset(userServiceImage),
      logging: ecs.LogDriver.awsLogs({
        streamPrefix: "UserService",
        logRetention: RetentionDays.ONE_DAY,
      }),
      environment: {
        MYSQL_HOST: nlbDnsName,
        MYSQL_PORT: "3306",
        MYSQL_DB: "userservice",
        MYSQL_USER: "user",
        MYSQL_PASSWORD: "password",
        KAFKA_HOST: nlbDnsName,
        KAFKA_PORT: "9092",
      },
      portMappings: [{ containerPort: 9810 }],
    });

    // Expense Service
    expenseServiceTaskDef.addContainer("ExpenseServiceContainer", {
      image: ecs.ContainerImage.fromDockerImageAsset(expenseServiceImage),
      logging: ecs.LogDriver.awsLogs({
        streamPrefix: "ExpenseService",
        logRetention: RetentionDays.ONE_DAY,
      }),
      environment: {
        MYSQL_HOST: nlbDnsName,
        MYSQL_PORT: "3306",
        MYSQL_DB: "expenseservice",
        MYSQL_USER: "user",
        MYSQL_PASSWORD: "password",
        KAFKA_HOST: nlbDnsName,
        KAFKA_PORT: "9092",
      },
      portMappings: [{ containerPort: 9820 }],
    });

    // Data Science Service
    dsServiceTaskDef.addContainer("DsServiceContainer", {
      image: ecs.ContainerImage.fromDockerImageAsset(dsServiceImage),
      logging: ecs.LogDriver.awsLogs({
        streamPrefix: "DsService",
        logRetention: RetentionDays.ONE_DAY,
      }),
      environment: {
        KAFKA_HOST: nlbDnsName,
        KAFKA_PORT: "9092",
        OPENAI_API_KEY: "VKtb8V8Jjj974P1K4RS2vNAvcMaNo6xR",
      },
      portMappings: [{ containerPort: 8010 }],
    });

    // Containers Spin Up
    // Creating Services for Task Definitions
    const authFargateService = new ecs.FargateService(this, "AuthService", {
      cluster: cluster,
      taskDefinition: authServiceTaskDef,
      desiredCount: 1,
      securityGroups: [servicesSecurityGroup],
      vpcSubnets: { subnets: [privateSubnet1, privateSubnet2] },
      assignPublicIp: false,
      enableExecuteCommand: true,
      cloudMapOptions: {
        name: "auth-service",
        cloudMapNamespace: namespace,
        dnsRecordType: servicediscovery.DnsRecordType.A,
        dnsTtl: cdk.Duration.seconds(60),
      },
    });

    const userFargateService = new ecs.FargateService(this, "UserFargateService", {
      cluster: cluster,
      taskDefinition: userServiceTaskDef,
      desiredCount: 1,
      vpcSubnets: { subnets: [privateSubnet1, privateSubnet2] },
      securityGroups: [servicesSecurityGroup],
      assignPublicIp: false,
      enableExecuteCommand: true,
      cloudMapOptions: {
        name: "user-service",
        cloudMapNamespace: namespace,
        dnsRecordType: servicediscovery.DnsRecordType.A,
        dnsTtl: cdk.Duration.seconds(60),
      },
    });

    const expenseFargateService = new ecs.FargateService(this, "ExpenseFargateService", {
      cluster: cluster,
      taskDefinition: expenseServiceTaskDef,
      desiredCount: 1,
      vpcSubnets: { subnets: [privateSubnet1, privateSubnet2] },
      securityGroups: [servicesSecurityGroup],
      assignPublicIp: false,
      enableExecuteCommand: true,
      cloudMapOptions: {
        name: "expense-service",
        cloudMapNamespace: namespace,
        dnsRecordType: servicediscovery.DnsRecordType.A,
        dnsTtl: cdk.Duration.seconds(60),
      },
    });

    const dsFargateService = new ecs.FargateService(this, "DsFargateService", {
      cluster: cluster,
      taskDefinition: dsServiceTaskDef,
      desiredCount: 1,
      vpcSubnets: { subnets: [privateSubnet1, privateSubnet2] },
      securityGroups: [servicesSecurityGroup],
      assignPublicIp: false,
      enableExecuteCommand: true,
      cloudMapOptions: {
        name: "ds-service",
        cloudMapNamespace: namespace,
        dnsRecordType: servicediscovery.DnsRecordType.A,
        dnsTtl: cdk.Duration.seconds(60),
      },
    });

    const kongFargateService = new ecs.FargateService(this, "KongFargateService", {
      cluster: cluster,
      taskDefinition: kongServiceTaskDef,
      desiredCount: 1,
      securityGroups: [kongSecurityGroup],
      vpcSubnets: {
        subnets: [publicSubnet1, publicSubnet2],
      },
      assignPublicIp: true,
      cloudMapOptions: {
        name: "kong",
        cloudMapNamespace: namespace,
        dnsRecordType: servicediscovery.DnsRecordType.A,
        dnsTtl: cdk.Duration.seconds(60),
      },
    });

    // Application Load Balancers
    const authServiceAlb = new elbv2.ApplicationLoadBalancer(this, "AuthServiceELB", { vpc, internetFacing: false, vpcSubnets: { subnets: [privateSubnet1, privateSubnet2] } });

    // Target Groups
    const authServiceTargetGroup = new elbv2.ApplicationTargetGroup(this, "AuthServiceTargetGroup", {
      vpc,
      port: 9898,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.IP,
      healthCheck: { path: "/health", interval: cdk.Duration.seconds(60), timeout: cdk.Duration.seconds(30), healthyThresholdCount: 2, unhealthyThresholdCount: 3, healthyHttpCodes: "200-299" },
    });

    const userServiceTargetGroup = new elbv2.ApplicationTargetGroup(this, "UserServiceTargetGroup", {
      vpc,
      port: 9810,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.IP,
      healthCheck: {
        path: "/health",
        interval: cdk.Duration.seconds(60),
        timeout: cdk.Duration.seconds(30),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 3,
        healthyHttpCodes: "200-299",
      },
    });

    const expenseServiceTargetGroup = new elbv2.ApplicationTargetGroup(this, "ExpenseServiceTargetGroup", {
      vpc,
      port: 9820,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.IP,
      healthCheck: {
        path: "/expense/v1/health",
        interval: cdk.Duration.seconds(60),
        timeout: cdk.Duration.seconds(30),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 3,
        healthyHttpCodes: "200-299",
      },
    });

    const dsServiceTargetGroup = new elbv2.ApplicationTargetGroup(this, "DsServiceTargetGroup", {
      vpc,
      port: 8010,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.IP,
      healthCheck: {
        path: "/health",
        interval: cdk.Duration.seconds(60),
        timeout: cdk.Duration.seconds(30),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 3,
        healthyHttpCodes: "200-299",
      },
    });

    const kongTargetGroup = new elbv2.ApplicationTargetGroup(this, "KongTargetGroup", {
      vpc,
      port: 8000,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.IP,
      healthCheck: {
        path: "/status",
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 3,
        healthyHttpCodes: "200-299",
      },
    });

    // Target <- Services in ECS
    authServiceTargetGroup.addTarget(authFargateService);
    userServiceTargetGroup.addTarget(userFargateService);
    expenseServiceTargetGroup.addTarget(expenseFargateService);
    dsServiceTargetGroup.addTarget(dsFargateService);
    kongTargetGroup.addTarget(kongFargateService);

    // ALB
    const userServiceAlb = new elbv2.ApplicationLoadBalancer(this, "UserServiceALB", { vpc, internetFacing: false, vpcSubnets: { subnets: [privateSubnet1, privateSubnet2] } });
    const expenseServiceAlb = new elbv2.ApplicationLoadBalancer(this, "ExpenseServiceALB", { vpc, internetFacing: false, vpcSubnets: { subnets: [privateSubnet1, privateSubnet2] } });
    const dsServiceAlb = new elbv2.ApplicationLoadBalancer(this, "DsServiceALB", { vpc, internetFacing: false, vpcSubnets: { subnets: [privateSubnet1, privateSubnet2] } });
    const kongALB = new elbv2.ApplicationLoadBalancer(this, "KongALB", { vpc, internetFacing: true, vpcSubnets: { subnets: [publicSubnet1, publicSubnet2] } });

    // Listeners
    authServiceAlb.addListener("AuthServiceListener", { port: 80, defaultTargetGroups: [authServiceTargetGroup] });
    userServiceAlb.addListener("UserServiceAlbListener", { port: 80, defaultTargetGroups: [userServiceTargetGroup] });
    expenseServiceAlb.addListener("ExpenseServiceAlbListener", { port: 80, defaultTargetGroups: [expenseServiceTargetGroup] });
    dsServiceAlb.addListener("DsServiceAlbListener", { port: 80, defaultTargetGroups: [dsServiceTargetGroup] });
    kongALB.addListener("KongListener", { port: 80, defaultTargetGroups: [kongTargetGroup] });

    // Egress Rule to access Kong to ALB
    kongSecurityGroup.addEgressRule(ec2.Peer.ipv4(vpc.vpcCidrBlock), ec2.Port.tcp(80), "Allow Kong to access Auth Service ALB");

    // Add egress rules for direct service ports
    // No need of this after changing in the kong.yml
    kongSecurityGroup.addEgressRule(ec2.Peer.ipv4(vpc.vpcCidrBlock), ec2.Port.tcp(9898), "Allow Kong to access Auth Service directly");
    kongSecurityGroup.addEgressRule(ec2.Peer.ipv4(vpc.vpcCidrBlock), ec2.Port.tcp(9810), "Allow Kong to access User Service directly");
    kongSecurityGroup.addEgressRule(ec2.Peer.ipv4(vpc.vpcCidrBlock), ec2.Port.tcp(9820), "Allow Kong to access Expense Service directly");
    kongSecurityGroup.addEgressRule(ec2.Peer.ipv4(vpc.vpcCidrBlock), ec2.Port.tcp(8010), "Allow Kong to access DS Service directly");
    servicesSecurityGroup.addIngressRule(kongSecurityGroup, ec2.Port.tcp(9898), "Allow traffic from Kong to Auth Service");

    // ALB -> allowing traffic from kong
    authServiceAlb.connections.allowFrom(kongSecurityGroup, ec2.Port.tcp(80), "Allow traffic from Kong to Auth Service ALB");
    authServiceAlb.connections.allowFrom(kongSecurityGroup, ec2.Port.tcp(80), "Allow traffic from Kong to Auth Service ALB");
    userServiceAlb.connections.allowFrom(kongSecurityGroup, ec2.Port.tcp(80), "Allow traffic from Kong to User Service ALB");
    expenseServiceAlb.connections.allowFrom(kongSecurityGroup, ec2.Port.tcp(80), "Allow traffic from Kong to Expense Service ALB");
    dsServiceAlb.connections.allowFrom(kongSecurityGroup, ec2.Port.tcp(80), "Allow traffic from Kong to Ds Service ALB");

    // Exports
    new cdk.CfnOutput(this, "AuthServiceALBDNS", { value: authServiceAlb.loadBalancerDnsName, description: "Auth Service ALB DNS Name", key: "AuthServiceALBDNS" });
  }
}
