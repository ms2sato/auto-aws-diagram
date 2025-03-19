"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.AwsClient = void 0;
var client_ec2_1 = require("@aws-sdk/client-ec2");
var client_s3_1 = require("@aws-sdk/client-s3");
var client_rds_1 = require("@aws-sdk/client-rds");
var client_lambda_1 = require("@aws-sdk/client-lambda");
var client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
var client_elastic_load_balancing_v2_1 = require("@aws-sdk/client-elastic-load-balancing-v2");
var credential_providers_1 = require("@aws-sdk/credential-providers");
var AwsClient = /** @class */ (function () {
    function AwsClient(config) {
        var clientConfig = __assign({ region: config.region }, (config.profile ? { credentials: (0, credential_providers_1.fromIni)({ profile: config.profile }) } : {}));
        this.ec2Client = new client_ec2_1.EC2Client(clientConfig);
        this.s3Client = new client_s3_1.S3Client(clientConfig);
        this.rdsClient = new client_rds_1.RDSClient(clientConfig);
        this.lambdaClient = new client_lambda_1.LambdaClient(clientConfig);
        this.dynamodbClient = new client_dynamodb_1.DynamoDBClient(clientConfig);
        this.elbClient = new client_elastic_load_balancing_v2_1.ElasticLoadBalancingV2Client(clientConfig);
    }
    AwsClient.prototype.getEc2Instances = function () {
        return __awaiter(this, void 0, void 0, function () {
            var command;
            return __generator(this, function (_a) {
                command = new client_ec2_1.DescribeInstancesCommand({});
                return [2 /*return*/, this.ec2Client.send(command)];
            });
        });
    };
    AwsClient.prototype.getVpcs = function () {
        return __awaiter(this, void 0, void 0, function () {
            var command;
            return __generator(this, function (_a) {
                command = new client_ec2_1.DescribeVpcsCommand({});
                return [2 /*return*/, this.ec2Client.send(command)];
            });
        });
    };
    AwsClient.prototype.getSubnets = function () {
        return __awaiter(this, void 0, void 0, function () {
            var command;
            return __generator(this, function (_a) {
                command = new client_ec2_1.DescribeSubnetsCommand({});
                return [2 /*return*/, this.ec2Client.send(command)];
            });
        });
    };
    AwsClient.prototype.getSecurityGroups = function () {
        return __awaiter(this, void 0, void 0, function () {
            var command;
            return __generator(this, function (_a) {
                command = new client_ec2_1.DescribeSecurityGroupsCommand({});
                return [2 /*return*/, this.ec2Client.send(command)];
            });
        });
    };
    AwsClient.prototype.getInternetGateways = function () {
        return __awaiter(this, void 0, void 0, function () {
            var command;
            return __generator(this, function (_a) {
                command = new client_ec2_1.DescribeInternetGatewaysCommand({});
                return [2 /*return*/, this.ec2Client.send(command)];
            });
        });
    };
    AwsClient.prototype.getNatGateways = function () {
        return __awaiter(this, void 0, void 0, function () {
            var command;
            return __generator(this, function (_a) {
                command = new client_ec2_1.DescribeNatGatewaysCommand({});
                return [2 /*return*/, this.ec2Client.send(command)];
            });
        });
    };
    AwsClient.prototype.getS3Buckets = function () {
        return __awaiter(this, void 0, void 0, function () {
            var command;
            return __generator(this, function (_a) {
                command = new client_s3_1.ListBucketsCommand({});
                return [2 /*return*/, this.s3Client.send(command)];
            });
        });
    };
    AwsClient.prototype.getRdsInstances = function () {
        return __awaiter(this, void 0, void 0, function () {
            var command;
            return __generator(this, function (_a) {
                command = new client_rds_1.DescribeDBInstancesCommand({});
                return [2 /*return*/, this.rdsClient.send(command)];
            });
        });
    };
    AwsClient.prototype.getLambdaFunctions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var command;
            return __generator(this, function (_a) {
                command = new client_lambda_1.ListFunctionsCommand({});
                return [2 /*return*/, this.lambdaClient.send(command)];
            });
        });
    };
    AwsClient.prototype.getDynamoDbTables = function () {
        return __awaiter(this, void 0, void 0, function () {
            var command;
            return __generator(this, function (_a) {
                command = new client_dynamodb_1.ListTablesCommand({});
                return [2 /*return*/, this.dynamodbClient.send(command)];
            });
        });
    };
    AwsClient.prototype.getLoadBalancers = function () {
        return __awaiter(this, void 0, void 0, function () {
            var command;
            return __generator(this, function (_a) {
                command = new client_elastic_load_balancing_v2_1.DescribeLoadBalancersCommand({});
                return [2 /*return*/, this.elbClient.send(command)];
            });
        });
    };
    // 特定のDynamoDBテーブルの詳細を取得
    AwsClient.prototype.getDynamoDbTableDetails = function (tableName) {
        return __awaiter(this, void 0, void 0, function () {
            var command;
            return __generator(this, function (_a) {
                command = new client_dynamodb_1.DescribeTableCommand({ TableName: tableName });
                return [2 /*return*/, this.dynamodbClient.send(command)];
            });
        });
    };
    return AwsClient;
}());
exports.AwsClient = AwsClient;
