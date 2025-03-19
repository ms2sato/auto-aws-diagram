"use strict";
exports.__esModule = true;
exports.generateDemoSvg = void 0;
var svg_generator_1 = require("./services/svg-generator");
function generateDemoSvg(outputPath) {
    if (outputPath === void 0) { outputPath = 'aws-architecture-demo.svg'; }
    // デモ用のリソースを作成
    var resources = [
        // VPC
        {
            id: 'vpc-1234567890abcdef0',
            type: 'vpc',
            name: 'Main VPC',
            properties: {
                cidrBlock: '10.0.0.0/16',
                isDefault: false,
                state: 'available'
            }
        },
        // Subnets
        {
            id: 'subnet-public1',
            type: 'subnet',
            name: 'Public Subnet 1',
            properties: {
                cidrBlock: '10.0.1.0/24',
                availabilityZone: 'us-east-1a',
                isPublic: true
            }
        },
        {
            id: 'subnet-private1',
            type: 'subnet',
            name: 'Private Subnet 1',
            properties: {
                cidrBlock: '10.0.2.0/24',
                availabilityZone: 'us-east-1a',
                isPublic: false
            }
        },
        // Internet Gateway
        {
            id: 'igw-1234567890abcdef0',
            type: 'internetGateway',
            name: 'Main IGW',
            properties: {}
        },
        // NAT Gateway
        {
            id: 'nat-1234567890abcdef0',
            type: 'natGateway',
            name: 'NAT Gateway',
            properties: {
                state: 'available',
                type: 'public'
            }
        },
        // EC2 Instances
        {
            id: 'i-webserver1',
            type: 'ec2',
            name: 'Web Server 1',
            properties: {
                instanceType: 't3.micro',
                state: 'running',
                privateIp: '10.0.1.10',
                publicIp: '52.123.456.789'
            }
        },
        {
            id: 'i-appserver1',
            type: 'ec2',
            name: 'App Server 1',
            properties: {
                instanceType: 't3.small',
                state: 'running',
                privateIp: '10.0.2.10'
            }
        },
        // RDS
        {
            id: 'db-postgres',
            type: 'rds',
            name: 'PostgreSQL DB',
            properties: {
                engine: 'postgres',
                engineVersion: '13.4',
                status: 'available',
                instanceClass: 'db.t3.small',
                multiAZ: true,
                storage: 20
            }
        },
        // S3 Bucket
        {
            id: 'my-assets-bucket',
            type: 's3',
            name: 'Assets Bucket',
            properties: {
                creationDate: new Date('2022-01-01')
            }
        },
        // Lambda
        {
            id: 'lambda-processor',
            type: 'lambda',
            name: 'Data Processor',
            properties: {
                runtime: 'nodejs16.x',
                handler: 'index.handler',
                memory: 512,
                timeout: 30
            }
        },
        // DynamoDB
        {
            id: 'dynamodb-sessions',
            type: 'dynamodb',
            name: 'Sessions Table',
            properties: {
                status: 'ACTIVE',
                readCapacity: 5,
                writeCapacity: 5
            }
        },
        // Load Balancer
        {
            id: 'alb-main',
            type: 'loadBalancer',
            name: 'Main ALB',
            properties: {
                dnsName: 'main-alb-123456789.us-east-1.elb.amazonaws.com',
                type: 'application',
                scheme: 'internet-facing'
            }
        },
        // Security Groups
        {
            id: 'sg-web',
            type: 'securityGroup',
            name: 'Web SG',
            properties: {
                description: 'Web servers security group',
                inboundRules: [
                    {
                        protocol: 'tcp',
                        fromPort: 80,
                        toPort: 80,
                        ipRanges: ['0.0.0.0/0']
                    },
                    {
                        protocol: 'tcp',
                        fromPort: 443,
                        toPort: 443,
                        ipRanges: ['0.0.0.0/0']
                    }
                ]
            }
        },
        {
            id: 'sg-app',
            type: 'securityGroup',
            name: 'App SG',
            properties: {
                description: 'Application servers security group',
                inboundRules: [
                    {
                        protocol: 'tcp',
                        fromPort: 8080,
                        toPort: 8080,
                        ipRanges: ['10.0.1.0/24']
                    }
                ]
            }
        },
        {
            id: 'sg-db',
            type: 'securityGroup',
            name: 'DB SG',
            properties: {
                description: 'Database security group',
                inboundRules: [
                    {
                        protocol: 'tcp',
                        fromPort: 5432,
                        toPort: 5432,
                        ipRanges: ['10.0.2.0/24']
                    }
                ]
            }
        }
    ];
    // デモ用の接続を作成
    var connections = [
        // VPCとSubnetsの接続
        {
            source: 'subnet-public1',
            target: 'vpc-1234567890abcdef0',
            type: 'belongs_to'
        },
        {
            source: 'subnet-private1',
            target: 'vpc-1234567890abcdef0',
            type: 'belongs_to'
        },
        // IGWとVPCの接続
        {
            source: 'igw-1234567890abcdef0',
            target: 'vpc-1234567890abcdef0',
            type: 'attached_to'
        },
        // NATとSubnetの接続
        {
            source: 'nat-1234567890abcdef0',
            target: 'subnet-public1',
            type: 'belongs_to'
        },
        // EC2インスタンスとSubnetsの接続
        {
            source: 'i-webserver1',
            target: 'subnet-public1',
            type: 'belongs_to'
        },
        {
            source: 'i-appserver1',
            target: 'subnet-private1',
            type: 'belongs_to'
        },
        // EC2インスタンスとSGの接続
        {
            source: 'i-webserver1',
            target: 'sg-web',
            type: 'uses'
        },
        {
            source: 'i-appserver1',
            target: 'sg-app',
            type: 'uses'
        },
        // RDSとSubnetの接続
        {
            source: 'db-postgres',
            target: 'subnet-private1',
            type: 'belongs_to'
        },
        // RDSとSGの接続
        {
            source: 'db-postgres',
            target: 'sg-db',
            type: 'uses'
        },
        // Lambdaの接続
        {
            source: 'lambda-processor',
            target: 'subnet-private1',
            type: 'belongs_to'
        },
        // ALBの接続
        {
            source: 'alb-main',
            target: 'subnet-public1',
            type: 'belongs_to'
        },
        {
            source: 'alb-main',
            target: 'sg-web',
            type: 'uses'
        },
        // SG同士の関連性
        {
            source: 'sg-web',
            target: 'vpc-1234567890abcdef0',
            type: 'belongs_to'
        },
        {
            source: 'sg-app',
            target: 'vpc-1234567890abcdef0',
            type: 'belongs_to'
        },
        {
            source: 'sg-db',
            target: 'vpc-1234567890abcdef0',
            type: 'belongs_to'
        },
        // アプリケーションの流れ
        {
            source: 'alb-main',
            target: 'i-webserver1',
            type: 'routes_to'
        },
        {
            source: 'i-webserver1',
            target: 'i-appserver1',
            type: 'calls'
        },
        {
            source: 'i-appserver1',
            target: 'db-postgres',
            type: 'uses'
        },
        {
            source: 'i-appserver1',
            target: 'lambda-processor',
            type: 'invokes'
        },
        {
            source: 'i-appserver1',
            target: 'dynamodb-sessions',
            type: 'uses'
        },
        {
            source: 'i-webserver1',
            target: 'my-assets-bucket',
            type: 'uses'
        }
    ];
    // SVG生成
    var svgGenerator = new svg_generator_1.SvgGenerator({
        width: 1200,
        height: 800,
        resourceWidth: 100,
        resourceHeight: 100
    });
    svgGenerator.generateSvg(resources, connections, outputPath);
    console.log("Demo architecture diagram generated: ".concat(outputPath));
}
exports.generateDemoSvg = generateDemoSvg;
// コマンドラインから直接実行された場合のみ実行
if (require.main === module) {
    generateDemoSvg();
    console.log('Demo SVG file has been generated.');
}
