import {
  EC2Client,
  DescribeInstancesCommand,
  DescribeVpcsCommand,
  DescribeSubnetsCommand,
  DescribeSecurityGroupsCommand,
  DescribeInternetGatewaysCommand,
  DescribeNatGatewaysCommand,
} from '@aws-sdk/client-ec2'
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3'
import { RDSClient, DescribeDBInstancesCommand } from '@aws-sdk/client-rds'
import { LambdaClient, ListFunctionsCommand } from '@aws-sdk/client-lambda'
import {
  DynamoDBClient,
  ListTablesCommand,
  DescribeTableCommand,
} from '@aws-sdk/client-dynamodb'
import {
  ElasticLoadBalancingV2Client,
  DescribeLoadBalancersCommand,
} from '@aws-sdk/client-elastic-load-balancing-v2'
import { fromIni } from '@aws-sdk/credential-providers'

export interface AwsConfig {
  profile?: string
  region: string
}

export class AwsClient {
  private ec2Client: EC2Client
  private s3Client: S3Client
  private rdsClient: RDSClient
  private lambdaClient: LambdaClient
  private dynamodbClient: DynamoDBClient
  private elbClient: ElasticLoadBalancingV2Client

  constructor(config: AwsConfig) {
    const clientConfig = {
      region: config.region,
      ...(config.profile
        ? { credentials: fromIni({ profile: config.profile }) }
        : {}),
    }

    this.ec2Client = new EC2Client(clientConfig)
    this.s3Client = new S3Client(clientConfig)
    this.rdsClient = new RDSClient(clientConfig)
    this.lambdaClient = new LambdaClient(clientConfig)
    this.dynamodbClient = new DynamoDBClient(clientConfig)
    this.elbClient = new ElasticLoadBalancingV2Client(clientConfig)
  }

  async getEc2Instances() {
    const command = new DescribeInstancesCommand({})
    return this.ec2Client.send(command)
  }

  async getVpcs() {
    const command = new DescribeVpcsCommand({})
    return this.ec2Client.send(command)
  }

  async getSubnets() {
    const command = new DescribeSubnetsCommand({})
    return this.ec2Client.send(command)
  }

  async getSecurityGroups() {
    const command = new DescribeSecurityGroupsCommand({})
    return this.ec2Client.send(command)
  }

  async getInternetGateways() {
    const command = new DescribeInternetGatewaysCommand({})
    return this.ec2Client.send(command)
  }

  async getNatGateways() {
    const command = new DescribeNatGatewaysCommand({})
    return this.ec2Client.send(command)
  }

  async getS3Buckets() {
    const command = new ListBucketsCommand({})
    return this.s3Client.send(command)
  }

  async getRdsInstances() {
    const command = new DescribeDBInstancesCommand({})
    return this.rdsClient.send(command)
  }

  async getLambdaFunctions() {
    const command = new ListFunctionsCommand({})
    return this.lambdaClient.send(command)
  }

  async getDynamoDbTables() {
    const command = new ListTablesCommand({})
    return this.dynamodbClient.send(command)
  }

  async getLoadBalancers() {
    const command = new DescribeLoadBalancersCommand({})
    return this.elbClient.send(command)
  }

  // 特定のDynamoDBテーブルの詳細を取得
  async getDynamoDbTableDetails(tableName: string) {
    const command = new DescribeTableCommand({ TableName: tableName })
    return this.dynamodbClient.send(command)
  }
}
