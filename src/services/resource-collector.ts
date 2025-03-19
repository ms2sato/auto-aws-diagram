import { AwsClient, AwsConfig } from '../utils/aws-client'
import {
  DescribeInstancesCommandOutput,
  DescribeVpcsCommandOutput,
  DescribeSubnetsCommandOutput,
  DescribeSecurityGroupsCommandOutput,
  DescribeInternetGatewaysCommandOutput,
  DescribeNatGatewaysCommandOutput,
} from '@aws-sdk/client-ec2'
import { ListBucketsCommandOutput } from '@aws-sdk/client-s3'
import { DescribeDBInstancesCommandOutput } from '@aws-sdk/client-rds'
import { ListFunctionsCommandOutput } from '@aws-sdk/client-lambda'
import {
  ListTablesCommandOutput,
  DescribeTableCommandOutput,
} from '@aws-sdk/client-dynamodb'
import { DescribeLoadBalancersCommandOutput } from '@aws-sdk/client-elastic-load-balancing-v2'

export interface ResourceCollectorConfig {
  awsConfig: AwsConfig
  resourceTypes?: string[]
}

export interface Resource {
  id: string
  type: string
  name: string
  properties: Record<string, any>
}

export interface Connection {
  source: string
  target: string
  type: string
}

export interface CollectedResources {
  resources: Resource[]
  connections: Connection[]
}

export class ResourceCollector {
  private awsClient: AwsClient
  private config: ResourceCollectorConfig

  constructor(config: ResourceCollectorConfig) {
    this.config = config
    this.awsClient = new AwsClient(config.awsConfig)
  }

  async collectResources(): Promise<CollectedResources> {
    const resources: Resource[] = []
    const connections: Connection[] = []

    try {
      const resourceTypes = this.config.resourceTypes || [
        'ec2',
        'vpc',
        'subnet',
        'securityGroup',
        'internetGateway',
        'natGateway',
        's3',
        'rds',
        'lambda',
        'dynamodb',
        'loadBalancer',
      ]

      for (const resourceType of resourceTypes) {
        try {
          console.log(`Collecting ${resourceType} resources...`)
          switch (resourceType) {
            case 'ec2':
              await this.collectEC2Instances(resources, connections)
              break
            case 'vpc':
              await this.collectVpcs(resources, connections)
              break
            case 'subnet':
              await this.collectSubnets(resources, connections)
              break
            case 'securityGroup':
              await this.collectSecurityGroups(resources, connections)
              break
            case 'internetGateway':
              await this.collectInternetGateways(resources, connections)
              break
            case 'natGateway':
              await this.collectNatGateways(resources, connections)
              break
            case 's3':
              await this.collectS3Buckets(resources, connections)
              break
            case 'rds':
              await this.collectRdsInstances(resources, connections)
              break
            case 'lambda':
              await this.collectLambdaFunctions(resources, connections)
              break
            case 'dynamodb':
              await this.collectDynamoDbTables(resources, connections)
              break
            case 'loadBalancer':
              await this.collectLoadBalancers(resources, connections)
              break
            default:
              console.warn(`Unknown resource type: ${resourceType}`)
          }
        } catch (error) {
          console.error(`Error collecting ${resourceType} resources:`, error)
        }
      }
    } catch (error) {
      console.error('Error collecting resources:', error)
    }

    return { resources, connections }
  }

  private async collectEC2Instances(
    resources: Resource[],
    connections: Connection[]
  ): Promise<void> {
    try {
      const result: DescribeInstancesCommandOutput =
        await this.awsClient.getEc2Instances()

      if (result.Reservations) {
        for (const reservation of result.Reservations) {
          if (reservation.Instances) {
            for (const instance of reservation.Instances) {
              if (instance.InstanceId) {
                const resource: Resource = {
                  id: instance.InstanceId,
                  type: 'ec2',
                  name:
                    instance.Tags?.find((tag: any) => tag.Key === 'Name')?.Value ||
                    instance.InstanceId,
                  properties: {
                    state: instance.State?.Name,
                    instanceType: instance.InstanceType,
                    privateIp: instance.PrivateIpAddress,
                    publicIp: instance.PublicIpAddress,
                  },
                }

                resources.push(resource)

                // EC2とVPCの接続
                if (instance.VpcId) {
                  connections.push({
                    source: instance.InstanceId,
                    target: instance.VpcId,
                    type: 'belongs_to',
                  })
                }

                // EC2とSubnetの接続
                if (instance.SubnetId) {
                  connections.push({
                    source: instance.InstanceId,
                    target: instance.SubnetId,
                    type: 'belongs_to',
                  })
                }

                // EC2とSecurityGroupの接続
                if (instance.SecurityGroups) {
                  for (const sg of instance.SecurityGroups) {
                    if (sg.GroupId) {
                      connections.push({
                        source: instance.InstanceId,
                        target: sg.GroupId,
                        type: 'uses',
                      })
                    }
                  }
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error collecting EC2 instances:', error)
    }
  }

  private async collectVpcs(
    resources: Resource[],
    connections: Connection[]
  ): Promise<void> {
    try {
      const result: DescribeVpcsCommandOutput = await this.awsClient.getVpcs()

      if (result.Vpcs) {
        for (const vpc of result.Vpcs) {
          if (vpc.VpcId) {
            const resource: Resource = {
              id: vpc.VpcId,
              type: 'vpc',
              name:
                vpc.Tags?.find((tag: any) => tag.Key === 'Name')?.Value || vpc.VpcId,
              properties: {
                cidrBlock: vpc.CidrBlock,
                isDefault: vpc.IsDefault,
                state: vpc.State,
              },
            }

            resources.push(resource)
          }
        }
      }
    } catch (error) {
      console.error('Error collecting VPCs:', error)
    }
  }

  private async collectSubnets(
    resources: Resource[],
    connections: Connection[]
  ): Promise<void> {
    try {
      const result: DescribeSubnetsCommandOutput =
        await this.awsClient.getSubnets()

      if (result.Subnets) {
        for (const subnet of result.Subnets) {
          if (subnet.SubnetId) {
            const resource: Resource = {
              id: subnet.SubnetId,
              type: 'subnet',
              name:
                subnet.Tags?.find((tag: any) => tag.Key === 'Name')?.Value ||
                subnet.SubnetId,
              properties: {
                cidrBlock: subnet.CidrBlock,
                availabilityZone: subnet.AvailabilityZone,
                availableIpAddressCount: subnet.AvailableIpAddressCount,
                isPublic: subnet.MapPublicIpOnLaunch,
              },
            }

            resources.push(resource)

            // SubnetとVPCの接続
            if (subnet.VpcId) {
              connections.push({
                source: subnet.SubnetId,
                target: subnet.VpcId,
                type: 'belongs_to',
              })
            }
          }
        }
      }
    } catch (error) {
      console.error('Error collecting Subnets:', error)
    }
  }

  private async collectSecurityGroups(
    resources: Resource[],
    connections: Connection[]
  ): Promise<void> {
    try {
      const result: DescribeSecurityGroupsCommandOutput =
        await this.awsClient.getSecurityGroups()

      if (result.SecurityGroups) {
        for (const sg of result.SecurityGroups) {
          if (sg.GroupId) {
            const resource: Resource = {
              id: sg.GroupId,
              type: 'securityGroup',
              name: sg.GroupName || sg.GroupId,
              properties: {
                description: sg.Description,
                inboundRules: sg.IpPermissions?.map((rule: any) => ({
                  protocol: rule.IpProtocol,
                  fromPort: rule.FromPort,
                  toPort: rule.ToPort,
                  ipRanges: rule.IpRanges?.map((range: any) => range.CidrIp),
                })),
                outboundRules: sg.IpPermissionsEgress?.map((rule: any) => ({
                  protocol: rule.IpProtocol,
                  fromPort: rule.FromPort,
                  toPort: rule.ToPort,
                  ipRanges: rule.IpRanges?.map((range: any) => range.CidrIp),
                })),
              },
            }

            resources.push(resource)

            // SecurityGroupとVPCの接続
            if (sg.VpcId) {
              connections.push({
                source: sg.GroupId,
                target: sg.VpcId,
                type: 'belongs_to',
              })
            }
          }
        }
      }
    } catch (error) {
      console.error('Error collecting Security Groups:', error)
    }
  }

  private async collectInternetGateways(
    resources: Resource[],
    connections: Connection[]
  ): Promise<void> {
    try {
      const result: DescribeInternetGatewaysCommandOutput =
        await this.awsClient.getInternetGateways()

      if (result.InternetGateways) {
        for (const igw of result.InternetGateways) {
          if (igw.InternetGatewayId) {
            const resource: Resource = {
              id: igw.InternetGatewayId,
              type: 'internetGateway',
              name:
                igw.Tags?.find((tag: any) => tag.Key === 'Name')?.Value ||
                igw.InternetGatewayId,
              properties: {},
            }

            resources.push(resource)

            // IGWとVPCの接続
            if (igw.Attachments) {
              for (const attachment of igw.Attachments) {
                if (attachment.VpcId) {
                  connections.push({
                    source: igw.InternetGatewayId,
                    target: attachment.VpcId,
                    type: 'attached_to',
                  })
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error collecting Internet Gateways:', error)
    }
  }

  private async collectNatGateways(
    resources: Resource[],
    connections: Connection[]
  ): Promise<void> {
    try {
      const result: DescribeNatGatewaysCommandOutput =
        await this.awsClient.getNatGateways()

      if (result.NatGateways) {
        for (const natgw of result.NatGateways) {
          if (natgw.NatGatewayId) {
            const resource: Resource = {
              id: natgw.NatGatewayId,
              type: 'natGateway',
              name:
                natgw.Tags?.find((tag: any) => tag.Key === 'Name')?.Value ||
                natgw.NatGatewayId,
              properties: {
                state: natgw.State,
                type: natgw.ConnectivityType,
              },
            }

            resources.push(resource)

            // NATとVPCの接続
            if (natgw.VpcId) {
              connections.push({
                source: natgw.NatGatewayId,
                target: natgw.VpcId,
                type: 'belongs_to',
              })
            }

            // NATとSubnetの接続
            if (natgw.SubnetId) {
              connections.push({
                source: natgw.NatGatewayId,
                target: natgw.SubnetId,
                type: 'belongs_to',
              })
            }
          }
        }
      }
    } catch (error) {
      console.error('Error collecting NAT Gateways:', error)
    }
  }

  private async collectS3Buckets(
    resources: Resource[],
    connections: Connection[]
  ): Promise<void> {
    try {
      const result: ListBucketsCommandOutput =
        await this.awsClient.getS3Buckets()

      if (result.Buckets) {
        for (const bucket of result.Buckets) {
          if (bucket.Name) {
            const resource: Resource = {
              id: bucket.Name,
              type: 's3',
              name: bucket.Name,
              properties: {
                creationDate: bucket.CreationDate,
              },
            }

            resources.push(resource)
          }
        }
      }
    } catch (error) {
      console.error('Error collecting S3 Buckets:', error)
    }
  }

  private async collectRdsInstances(
    resources: Resource[],
    connections: Connection[]
  ): Promise<void> {
    try {
      const result: DescribeDBInstancesCommandOutput =
        await this.awsClient.getRdsInstances()

      if (result.DBInstances) {
        for (const instance of result.DBInstances) {
          if (instance.DBInstanceIdentifier) {
            const resource: Resource = {
              id: instance.DBInstanceIdentifier,
              type: 'rds',
              name: instance.DBName || instance.DBInstanceIdentifier,
              properties: {
                engine: instance.Engine,
                engineVersion: instance.EngineVersion,
                status: instance.DBInstanceStatus,
                instanceClass: instance.DBInstanceClass,
                multiAZ: instance.MultiAZ,
                storage: instance.AllocatedStorage,
                endpoint: instance.Endpoint?.Address,
              },
            }

            resources.push(resource)

            // RDSとVPCの接続
            if (instance.DBSubnetGroup?.VpcId) {
              connections.push({
                source: instance.DBInstanceIdentifier,
                target: instance.DBSubnetGroup.VpcId,
                type: 'belongs_to',
              })
            }

            // RDSとSGの接続
            if (instance.VpcSecurityGroups) {
              for (const sg of instance.VpcSecurityGroups) {
                if (sg.VpcSecurityGroupId) {
                  connections.push({
                    source: instance.DBInstanceIdentifier,
                    target: sg.VpcSecurityGroupId,
                    type: 'uses',
                  })
                }
              }
            }

            // RDSとSubnetの接続
            if (instance.DBSubnetGroup?.Subnets) {
              for (const subnet of instance.DBSubnetGroup.Subnets) {
                if (subnet.SubnetIdentifier) {
                  connections.push({
                    source: instance.DBInstanceIdentifier,
                    target: subnet.SubnetIdentifier,
                    type: 'belongs_to',
                  })
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error collecting RDS Instances:', error)
    }
  }

  private async collectLambdaFunctions(
    resources: Resource[],
    connections: Connection[]
  ): Promise<void> {
    try {
      const result: ListFunctionsCommandOutput =
        await this.awsClient.getLambdaFunctions()

      if (result.Functions) {
        for (const func of result.Functions) {
          if (func.FunctionName) {
            const resource: Resource = {
              id: func.FunctionArn || func.FunctionName,
              type: 'lambda',
              name: func.FunctionName,
              properties: {
                runtime: func.Runtime,
                handler: func.Handler,
                codeSize: func.CodeSize,
                description: func.Description,
                timeout: func.Timeout,
                memory: func.MemorySize,
              },
            }

            resources.push(resource)

            // Lambda関数とVPCの接続
            if (func.VpcConfig?.VpcId) {
              connections.push({
                source: func.FunctionArn || func.FunctionName,
                target: func.VpcConfig.VpcId,
                type: 'belongs_to',
              })
            }

            // Lambda関数とSubnetの接続
            if (func.VpcConfig?.SubnetIds) {
              for (const subnetId of func.VpcConfig.SubnetIds) {
                connections.push({
                  source: func.FunctionArn || func.FunctionName,
                  target: subnetId,
                  type: 'belongs_to',
                })
              }
            }

            // Lambda関数とSGの接続
            if (func.VpcConfig?.SecurityGroupIds) {
              for (const sgId of func.VpcConfig.SecurityGroupIds) {
                connections.push({
                  source: func.FunctionArn || func.FunctionName,
                  target: sgId,
                  type: 'uses',
                })
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error collecting Lambda Functions:', error)
    }
  }

  private async collectDynamoDbTables(
    resources: Resource[],
    connections: Connection[]
  ): Promise<void> {
    try {
      const result: ListTablesCommandOutput =
        await this.awsClient.getDynamoDbTables()

      if (result.TableNames) {
        for (const tableName of result.TableNames) {
          try {
            const tableDetails =
              await this.awsClient.getDynamoDbTableDetails(tableName)

            if (tableDetails.Table) {
              const table = tableDetails.Table
              const resource: Resource = {
                id: tableName,
                type: 'dynamodb',
                name: tableName,
                properties: {
                  status: table.TableStatus,
                  itemCount: table.ItemCount,
                  sizeBytes: table.TableSizeBytes,
                  readCapacity: table.ProvisionedThroughput?.ReadCapacityUnits,
                  writeCapacity:
                    table.ProvisionedThroughput?.WriteCapacityUnits,
                },
              }

              resources.push(resource)
            }
          } catch (error) {
            console.error(
              `Error getting details for DynamoDB table ${tableName}:`,
              error
            )
          }
        }
      }
    } catch (error) {
      console.error('Error collecting DynamoDB Tables:', error)
    }
  }

  private async collectLoadBalancers(
    resources: Resource[],
    connections: Connection[]
  ): Promise<void> {
    try {
      const result: DescribeLoadBalancersCommandOutput =
        await this.awsClient.getLoadBalancers()

      if (result.LoadBalancers) {
        for (const lb of result.LoadBalancers) {
          if (lb.LoadBalancerArn) {
            const resource: Resource = {
              id: lb.LoadBalancerArn,
              type: 'loadBalancer',
              name: lb.LoadBalancerName || lb.LoadBalancerArn,
              properties: {
                dnsName: lb.DNSName,
                type: lb.Type,
                scheme: lb.Scheme,
                state: lb.State?.Code,
              },
            }

            resources.push(resource)

            // LBとVPCの接続
            if (lb.VpcId) {
              connections.push({
                source: lb.LoadBalancerArn,
                target: lb.VpcId,
                type: 'belongs_to',
              })
            }

            // LBとSubnetの接続
            if (lb.AvailabilityZones) {
              for (const az of lb.AvailabilityZones) {
                if (az.SubnetId) {
                  connections.push({
                    source: lb.LoadBalancerArn,
                    target: az.SubnetId,
                    type: 'belongs_to',
                  })
                }
              }
            }

            // LBとSGの接続
            if (lb.SecurityGroups) {
              for (const sgId of lb.SecurityGroups) {
                connections.push({
                  source: lb.LoadBalancerArn,
                  target: sgId,
                  type: 'uses',
                })
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error collecting Load Balancers:', error)
    }
  }
}
