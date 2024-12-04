#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { ExpenseTrackerAwsCodeDeploymenTStack } from "../lib/expense-tracker-aws-code-deployment-stack";
import { ExpenseTrackerServices } from "../lib/expense-service-track";
import { ExpenseBackensServices } from "../lib/expense-backend-services";

const app = new cdk.App();

// AWS Environment
const env = { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION };
console.log(process.env.CDK_DEFAULT_ACCOUNT);
console.log(process.env.CDK_DEFAULT_REGION);

// Vpc Stack
const vpcStack = new ExpenseTrackerAwsCodeDeploymenTStack(app, "ExpenseTrackerAwsCodeDeploymenTStack", { env });

// Mysql & Kafa Service Stack
const mysqlAndKafkaStack = new ExpenseTrackerServices(app, "ExpenseTrackerServices", { env });

// Backend Services
const backendServicesStack = new ExpenseBackensServices(app, "ExpenseBackensServicesStack", { env });

backendServicesStack.addDependency(mysqlAndKafkaStack);
