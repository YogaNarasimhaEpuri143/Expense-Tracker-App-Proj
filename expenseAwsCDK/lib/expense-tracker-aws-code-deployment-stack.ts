import * as cdk from "aws-cdk-lib";
import { CfnEIP, CfnInternetGateway, CfnNatGateway, CfnRoute, CfnVPC, CfnVPCGatewayAttachment, IpAddresses, SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

export class ExpenseTrackerAwsCodeDeploymenTStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // const vpc = new CfnVPC();

    // Create VPC in the whole region, create public & private subnets (auto) by dividing CIDR Range.
    // Network Routing for public subnets  (configured) - allow direct outbound access directly via IGW
    // Network Routing for private subnets (configured) - allow outbound access via NAT Gateway
    const vpc = new Vpc(this, "myVpc", {
      vpcName: "expenseTracker",
      ipAddresses: IpAddresses.cidr("10.0.0.0/16"),
      maxAzs: 2,
      natGateways: 2,
      createInternetGateway: false,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "public-subnet",
          subnetType: SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: "private-subnet",
          subnetType: SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
    });

    const internetGateway = new CfnInternetGateway(this, "InternetGateway");
    new CfnVPCGatewayAttachment(this, "MyUniqueInternetGatewayAttachment", {
      vpcId: vpc.vpcId,

      // refers to the logical ID of a resource in the AWS CloudFormation template.
      // equivalent to using the intrinsic Ref function in CloudFormation.
      internetGatewayId: internetGateway.ref,
    });

    // IGW to NAT, by AWS
    const natGatewayOne = new CfnNatGateway(this, "NatGatewayOne", {
      subnetId: vpc.publicSubnets[0].subnetId,
      allocationId: new CfnEIP(this, "ElasticIPForNatGatewayOne").attrAllocationId,
    });

    const natGatewayTwo = new CfnNatGateway(this, "NatGatewayTwo", {
      subnetId: vpc.publicSubnets[1].subnetId,
      allocationId: new CfnEIP(this, "ElasticIPForNatGatewayTwo").attrAllocationId,
    });

    vpc.privateSubnets.forEach((subnet, index) => {
      new CfnRoute(this, `PrivateRouteNatGateway-${index}`, {
        routeTableId: subnet.routeTable.routeTableId,
        destinationCidrBlock: "0.0.0.0/0",
        natGatewayId: index === 0 ? natGatewayOne.ref : natGatewayTwo.ref,
      });
    });

    // Public Subnet to IGW Route
    vpc.publicSubnets.forEach((subnet, index) => {
      new CfnRoute(this, `publicSubnetRouteToIGW-${index}`, {
        routeTableId: subnet.routeTable.routeTableId,
        destinationCidrBlock: "0.0.0.0/0",
        gatewayId: internetGateway.ref,
      });
    });

    // using ssm
    new cdk.aws_ssm.StringParameter(this, "VpcIdExport", { parameterName: "VpcId", stringValue: vpc.vpcId });
    vpc.publicSubnets.forEach((subnet, index) => new cdk.aws_ssm.StringParameter(this, `PublicSubnetOutput-${index}`, { stringValue: subnet.subnetId, parameterName: `PublicSubnet-${index}` }));
    vpc.privateSubnets.forEach((subnet, index) => new cdk.aws_ssm.StringParameter(this, `PrivateSubnetOutput-${index}`, { stringValue: subnet.subnetId, parameterName: `PrivateSubnet-${index}` }));

    // Exporting - using CfnOutput (Deprecated)
    // Can you in another Stacks
    // new cdk.CfnOutput(this, "VPCIdOutput", { value: vpc.vpcId, exportName: "VpcId" });
    // vpc.publicSubnets.forEach((subnet, index) => new cdk.CfnOutput(this, `PublicSubnetOutput-${index}`, { value: subnet.subnetId, exportName: `PublicSubnet-${index}` }));
    // vpc.privateSubnets.forEach((subnet, index) => new cdk.CfnOutput(this, `PrivateSubnetOutput-${index}`, { value: subnet.subnetId, exportName: `PrivateSubnet-${index}` }));
  }
}
