"use strict";
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
exports.ResourceCollector = void 0;
var aws_client_1 = require("../utils/aws-client");
var ResourceCollector = /** @class */ (function () {
    function ResourceCollector(config) {
        this.config = config;
        this.awsClient = new aws_client_1.AwsClient(config.awsConfig);
    }
    ResourceCollector.prototype.collectResources = function () {
        return __awaiter(this, void 0, void 0, function () {
            var resources, connections, resourceTypes, _i, resourceTypes_1, resourceType, _a, error_1, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        resources = [];
                        connections = [];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 31, , 32]);
                        resourceTypes = this.config.resourceTypes || [
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
                        ];
                        _i = 0, resourceTypes_1 = resourceTypes;
                        _b.label = 2;
                    case 2:
                        if (!(_i < resourceTypes_1.length)) return [3 /*break*/, 30];
                        resourceType = resourceTypes_1[_i];
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 28, , 29]);
                        console.log("Collecting ".concat(resourceType, " resources..."));
                        _a = resourceType;
                        switch (_a) {
                            case 'ec2': return [3 /*break*/, 4];
                            case 'vpc': return [3 /*break*/, 6];
                            case 'subnet': return [3 /*break*/, 8];
                            case 'securityGroup': return [3 /*break*/, 10];
                            case 'internetGateway': return [3 /*break*/, 12];
                            case 'natGateway': return [3 /*break*/, 14];
                            case 's3': return [3 /*break*/, 16];
                            case 'rds': return [3 /*break*/, 18];
                            case 'lambda': return [3 /*break*/, 20];
                            case 'dynamodb': return [3 /*break*/, 22];
                            case 'loadBalancer': return [3 /*break*/, 24];
                        }
                        return [3 /*break*/, 26];
                    case 4: return [4 /*yield*/, this.collectEC2Instances(resources, connections)];
                    case 5:
                        _b.sent();
                        return [3 /*break*/, 27];
                    case 6: return [4 /*yield*/, this.collectVpcs(resources, connections)];
                    case 7:
                        _b.sent();
                        return [3 /*break*/, 27];
                    case 8: return [4 /*yield*/, this.collectSubnets(resources, connections)];
                    case 9:
                        _b.sent();
                        return [3 /*break*/, 27];
                    case 10: return [4 /*yield*/, this.collectSecurityGroups(resources, connections)];
                    case 11:
                        _b.sent();
                        return [3 /*break*/, 27];
                    case 12: return [4 /*yield*/, this.collectInternetGateways(resources, connections)];
                    case 13:
                        _b.sent();
                        return [3 /*break*/, 27];
                    case 14: return [4 /*yield*/, this.collectNatGateways(resources, connections)];
                    case 15:
                        _b.sent();
                        return [3 /*break*/, 27];
                    case 16: return [4 /*yield*/, this.collectS3Buckets(resources, connections)];
                    case 17:
                        _b.sent();
                        return [3 /*break*/, 27];
                    case 18: return [4 /*yield*/, this.collectRdsInstances(resources, connections)];
                    case 19:
                        _b.sent();
                        return [3 /*break*/, 27];
                    case 20: return [4 /*yield*/, this.collectLambdaFunctions(resources, connections)];
                    case 21:
                        _b.sent();
                        return [3 /*break*/, 27];
                    case 22: return [4 /*yield*/, this.collectDynamoDbTables(resources, connections)];
                    case 23:
                        _b.sent();
                        return [3 /*break*/, 27];
                    case 24: return [4 /*yield*/, this.collectLoadBalancers(resources, connections)];
                    case 25:
                        _b.sent();
                        return [3 /*break*/, 27];
                    case 26:
                        console.warn("Unknown resource type: ".concat(resourceType));
                        _b.label = 27;
                    case 27: return [3 /*break*/, 29];
                    case 28:
                        error_1 = _b.sent();
                        console.error("Error collecting ".concat(resourceType, " resources:"), error_1);
                        return [3 /*break*/, 29];
                    case 29:
                        _i++;
                        return [3 /*break*/, 2];
                    case 30: return [3 /*break*/, 32];
                    case 31:
                        error_2 = _b.sent();
                        console.error('Error collecting resources:', error_2);
                        return [3 /*break*/, 32];
                    case 32: return [2 /*return*/, { resources: resources, connections: connections }];
                }
            });
        });
    };
    ResourceCollector.prototype.collectEC2Instances = function (resources, connections) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var result, _i, _d, reservation, _e, _f, instance, resource, _g, _h, sg, error_3;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        _j.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.awsClient.getEc2Instances()];
                    case 1:
                        result = _j.sent();
                        if (result.Reservations) {
                            for (_i = 0, _d = result.Reservations; _i < _d.length; _i++) {
                                reservation = _d[_i];
                                if (reservation.Instances) {
                                    for (_e = 0, _f = reservation.Instances; _e < _f.length; _e++) {
                                        instance = _f[_e];
                                        if (instance.InstanceId) {
                                            resource = {
                                                id: instance.InstanceId,
                                                type: 'ec2',
                                                name: ((_b = (_a = instance.Tags) === null || _a === void 0 ? void 0 : _a.find(function (tag) { return tag.Key === 'Name'; })) === null || _b === void 0 ? void 0 : _b.Value) ||
                                                    instance.InstanceId,
                                                properties: {
                                                    state: (_c = instance.State) === null || _c === void 0 ? void 0 : _c.Name,
                                                    instanceType: instance.InstanceType,
                                                    privateIp: instance.PrivateIpAddress,
                                                    publicIp: instance.PublicIpAddress
                                                }
                                            };
                                            resources.push(resource);
                                            // EC2とVPCの接続
                                            if (instance.VpcId) {
                                                connections.push({
                                                    source: instance.InstanceId,
                                                    target: instance.VpcId,
                                                    type: 'belongs_to'
                                                });
                                            }
                                            // EC2とSubnetの接続
                                            if (instance.SubnetId) {
                                                connections.push({
                                                    source: instance.InstanceId,
                                                    target: instance.SubnetId,
                                                    type: 'belongs_to'
                                                });
                                            }
                                            // EC2とSecurityGroupの接続
                                            if (instance.SecurityGroups) {
                                                for (_g = 0, _h = instance.SecurityGroups; _g < _h.length; _g++) {
                                                    sg = _h[_g];
                                                    if (sg.GroupId) {
                                                        connections.push({
                                                            source: instance.InstanceId,
                                                            target: sg.GroupId,
                                                            type: 'uses'
                                                        });
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _j.sent();
                        console.error('Error collecting EC2 instances:', error_3);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ResourceCollector.prototype.collectVpcs = function (resources, connections) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var result, _i, _c, vpc, resource, error_4;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.awsClient.getVpcs()];
                    case 1:
                        result = _d.sent();
                        if (result.Vpcs) {
                            for (_i = 0, _c = result.Vpcs; _i < _c.length; _i++) {
                                vpc = _c[_i];
                                if (vpc.VpcId) {
                                    resource = {
                                        id: vpc.VpcId,
                                        type: 'vpc',
                                        name: ((_b = (_a = vpc.Tags) === null || _a === void 0 ? void 0 : _a.find(function (tag) { return tag.Key === 'Name'; })) === null || _b === void 0 ? void 0 : _b.Value) || vpc.VpcId,
                                        properties: {
                                            cidrBlock: vpc.CidrBlock,
                                            isDefault: vpc.IsDefault,
                                            state: vpc.State
                                        }
                                    };
                                    resources.push(resource);
                                }
                            }
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _d.sent();
                        console.error('Error collecting VPCs:', error_4);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ResourceCollector.prototype.collectSubnets = function (resources, connections) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var result, _i, _c, subnet, resource, error_5;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.awsClient.getSubnets()];
                    case 1:
                        result = _d.sent();
                        if (result.Subnets) {
                            for (_i = 0, _c = result.Subnets; _i < _c.length; _i++) {
                                subnet = _c[_i];
                                if (subnet.SubnetId) {
                                    resource = {
                                        id: subnet.SubnetId,
                                        type: 'subnet',
                                        name: ((_b = (_a = subnet.Tags) === null || _a === void 0 ? void 0 : _a.find(function (tag) { return tag.Key === 'Name'; })) === null || _b === void 0 ? void 0 : _b.Value) ||
                                            subnet.SubnetId,
                                        properties: {
                                            cidrBlock: subnet.CidrBlock,
                                            availabilityZone: subnet.AvailabilityZone,
                                            availableIpAddressCount: subnet.AvailableIpAddressCount,
                                            isPublic: subnet.MapPublicIpOnLaunch
                                        }
                                    };
                                    resources.push(resource);
                                    // SubnetとVPCの接続
                                    if (subnet.VpcId) {
                                        connections.push({
                                            source: subnet.SubnetId,
                                            target: subnet.VpcId,
                                            type: 'belongs_to'
                                        });
                                    }
                                }
                            }
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _d.sent();
                        console.error('Error collecting Subnets:', error_5);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ResourceCollector.prototype.collectSecurityGroups = function (resources, connections) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var result, _i, _c, sg, resource, error_6;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.awsClient.getSecurityGroups()];
                    case 1:
                        result = _d.sent();
                        if (result.SecurityGroups) {
                            for (_i = 0, _c = result.SecurityGroups; _i < _c.length; _i++) {
                                sg = _c[_i];
                                if (sg.GroupId) {
                                    resource = {
                                        id: sg.GroupId,
                                        type: 'securityGroup',
                                        name: sg.GroupName || sg.GroupId,
                                        properties: {
                                            description: sg.Description,
                                            inboundRules: (_a = sg.IpPermissions) === null || _a === void 0 ? void 0 : _a.map(function (rule) {
                                                var _a;
                                                return ({
                                                    protocol: rule.IpProtocol,
                                                    fromPort: rule.FromPort,
                                                    toPort: rule.ToPort,
                                                    ipRanges: (_a = rule.IpRanges) === null || _a === void 0 ? void 0 : _a.map(function (range) { return range.CidrIp; })
                                                });
                                            }),
                                            outboundRules: (_b = sg.IpPermissionsEgress) === null || _b === void 0 ? void 0 : _b.map(function (rule) {
                                                var _a;
                                                return ({
                                                    protocol: rule.IpProtocol,
                                                    fromPort: rule.FromPort,
                                                    toPort: rule.ToPort,
                                                    ipRanges: (_a = rule.IpRanges) === null || _a === void 0 ? void 0 : _a.map(function (range) { return range.CidrIp; })
                                                });
                                            })
                                        }
                                    };
                                    resources.push(resource);
                                    // SecurityGroupとVPCの接続
                                    if (sg.VpcId) {
                                        connections.push({
                                            source: sg.GroupId,
                                            target: sg.VpcId,
                                            type: 'belongs_to'
                                        });
                                    }
                                }
                            }
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _d.sent();
                        console.error('Error collecting Security Groups:', error_6);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ResourceCollector.prototype.collectInternetGateways = function (resources, connections) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var result, _i, _c, igw, resource, _d, _e, attachment, error_7;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.awsClient.getInternetGateways()];
                    case 1:
                        result = _f.sent();
                        if (result.InternetGateways) {
                            for (_i = 0, _c = result.InternetGateways; _i < _c.length; _i++) {
                                igw = _c[_i];
                                if (igw.InternetGatewayId) {
                                    resource = {
                                        id: igw.InternetGatewayId,
                                        type: 'internetGateway',
                                        name: ((_b = (_a = igw.Tags) === null || _a === void 0 ? void 0 : _a.find(function (tag) { return tag.Key === 'Name'; })) === null || _b === void 0 ? void 0 : _b.Value) ||
                                            igw.InternetGatewayId,
                                        properties: {}
                                    };
                                    resources.push(resource);
                                    // IGWとVPCの接続
                                    if (igw.Attachments) {
                                        for (_d = 0, _e = igw.Attachments; _d < _e.length; _d++) {
                                            attachment = _e[_d];
                                            if (attachment.VpcId) {
                                                connections.push({
                                                    source: igw.InternetGatewayId,
                                                    target: attachment.VpcId,
                                                    type: 'attached_to'
                                                });
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _f.sent();
                        console.error('Error collecting Internet Gateways:', error_7);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ResourceCollector.prototype.collectNatGateways = function (resources, connections) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var result, _i, _c, natgw, resource, error_8;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.awsClient.getNatGateways()];
                    case 1:
                        result = _d.sent();
                        if (result.NatGateways) {
                            for (_i = 0, _c = result.NatGateways; _i < _c.length; _i++) {
                                natgw = _c[_i];
                                if (natgw.NatGatewayId) {
                                    resource = {
                                        id: natgw.NatGatewayId,
                                        type: 'natGateway',
                                        name: ((_b = (_a = natgw.Tags) === null || _a === void 0 ? void 0 : _a.find(function (tag) { return tag.Key === 'Name'; })) === null || _b === void 0 ? void 0 : _b.Value) ||
                                            natgw.NatGatewayId,
                                        properties: {
                                            state: natgw.State,
                                            type: natgw.ConnectivityType
                                        }
                                    };
                                    resources.push(resource);
                                    // NATとVPCの接続
                                    if (natgw.VpcId) {
                                        connections.push({
                                            source: natgw.NatGatewayId,
                                            target: natgw.VpcId,
                                            type: 'belongs_to'
                                        });
                                    }
                                    // NATとSubnetの接続
                                    if (natgw.SubnetId) {
                                        connections.push({
                                            source: natgw.NatGatewayId,
                                            target: natgw.SubnetId,
                                            type: 'belongs_to'
                                        });
                                    }
                                }
                            }
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_8 = _d.sent();
                        console.error('Error collecting NAT Gateways:', error_8);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ResourceCollector.prototype.collectS3Buckets = function (resources, connections) {
        return __awaiter(this, void 0, void 0, function () {
            var result, _i, _a, bucket, resource, error_9;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.awsClient.getS3Buckets()];
                    case 1:
                        result = _b.sent();
                        if (result.Buckets) {
                            for (_i = 0, _a = result.Buckets; _i < _a.length; _i++) {
                                bucket = _a[_i];
                                if (bucket.Name) {
                                    resource = {
                                        id: bucket.Name,
                                        type: 's3',
                                        name: bucket.Name,
                                        properties: {
                                            creationDate: bucket.CreationDate
                                        }
                                    };
                                    resources.push(resource);
                                }
                            }
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_9 = _b.sent();
                        console.error('Error collecting S3 Buckets:', error_9);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ResourceCollector.prototype.collectRdsInstances = function (resources, connections) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var result, _i, _d, instance, resource, _e, _f, sg, _g, _h, subnet, error_10;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        _j.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.awsClient.getRdsInstances()];
                    case 1:
                        result = _j.sent();
                        if (result.DBInstances) {
                            for (_i = 0, _d = result.DBInstances; _i < _d.length; _i++) {
                                instance = _d[_i];
                                if (instance.DBInstanceIdentifier) {
                                    resource = {
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
                                            endpoint: (_a = instance.Endpoint) === null || _a === void 0 ? void 0 : _a.Address
                                        }
                                    };
                                    resources.push(resource);
                                    // RDSとVPCの接続
                                    if ((_b = instance.DBSubnetGroup) === null || _b === void 0 ? void 0 : _b.VpcId) {
                                        connections.push({
                                            source: instance.DBInstanceIdentifier,
                                            target: instance.DBSubnetGroup.VpcId,
                                            type: 'belongs_to'
                                        });
                                    }
                                    // RDSとSGの接続
                                    if (instance.VpcSecurityGroups) {
                                        for (_e = 0, _f = instance.VpcSecurityGroups; _e < _f.length; _e++) {
                                            sg = _f[_e];
                                            if (sg.VpcSecurityGroupId) {
                                                connections.push({
                                                    source: instance.DBInstanceIdentifier,
                                                    target: sg.VpcSecurityGroupId,
                                                    type: 'uses'
                                                });
                                            }
                                        }
                                    }
                                    // RDSとSubnetの接続
                                    if ((_c = instance.DBSubnetGroup) === null || _c === void 0 ? void 0 : _c.Subnets) {
                                        for (_g = 0, _h = instance.DBSubnetGroup.Subnets; _g < _h.length; _g++) {
                                            subnet = _h[_g];
                                            if (subnet.SubnetIdentifier) {
                                                connections.push({
                                                    source: instance.DBInstanceIdentifier,
                                                    target: subnet.SubnetIdentifier,
                                                    type: 'belongs_to'
                                                });
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_10 = _j.sent();
                        console.error('Error collecting RDS Instances:', error_10);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ResourceCollector.prototype.collectLambdaFunctions = function (resources, connections) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var result, _i, _d, func, resource, _e, _f, subnetId, _g, _h, sgId, error_11;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        _j.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.awsClient.getLambdaFunctions()];
                    case 1:
                        result = _j.sent();
                        if (result.Functions) {
                            for (_i = 0, _d = result.Functions; _i < _d.length; _i++) {
                                func = _d[_i];
                                if (func.FunctionName) {
                                    resource = {
                                        id: func.FunctionArn || func.FunctionName,
                                        type: 'lambda',
                                        name: func.FunctionName,
                                        properties: {
                                            runtime: func.Runtime,
                                            handler: func.Handler,
                                            codeSize: func.CodeSize,
                                            description: func.Description,
                                            timeout: func.Timeout,
                                            memory: func.MemorySize
                                        }
                                    };
                                    resources.push(resource);
                                    // Lambda関数とVPCの接続
                                    if ((_a = func.VpcConfig) === null || _a === void 0 ? void 0 : _a.VpcId) {
                                        connections.push({
                                            source: func.FunctionArn || func.FunctionName,
                                            target: func.VpcConfig.VpcId,
                                            type: 'belongs_to'
                                        });
                                    }
                                    // Lambda関数とSubnetの接続
                                    if ((_b = func.VpcConfig) === null || _b === void 0 ? void 0 : _b.SubnetIds) {
                                        for (_e = 0, _f = func.VpcConfig.SubnetIds; _e < _f.length; _e++) {
                                            subnetId = _f[_e];
                                            connections.push({
                                                source: func.FunctionArn || func.FunctionName,
                                                target: subnetId,
                                                type: 'belongs_to'
                                            });
                                        }
                                    }
                                    // Lambda関数とSGの接続
                                    if ((_c = func.VpcConfig) === null || _c === void 0 ? void 0 : _c.SecurityGroupIds) {
                                        for (_g = 0, _h = func.VpcConfig.SecurityGroupIds; _g < _h.length; _g++) {
                                            sgId = _h[_g];
                                            connections.push({
                                                source: func.FunctionArn || func.FunctionName,
                                                target: sgId,
                                                type: 'uses'
                                            });
                                        }
                                    }
                                }
                            }
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_11 = _j.sent();
                        console.error('Error collecting Lambda Functions:', error_11);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ResourceCollector.prototype.collectDynamoDbTables = function (resources, connections) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var result, _i, _c, tableName, tableDetails, table, resource, error_12, error_13;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 8, , 9]);
                        return [4 /*yield*/, this.awsClient.getDynamoDbTables()];
                    case 1:
                        result = _d.sent();
                        if (!result.TableNames) return [3 /*break*/, 7];
                        _i = 0, _c = result.TableNames;
                        _d.label = 2;
                    case 2:
                        if (!(_i < _c.length)) return [3 /*break*/, 7];
                        tableName = _c[_i];
                        _d.label = 3;
                    case 3:
                        _d.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.awsClient.getDynamoDbTableDetails(tableName)];
                    case 4:
                        tableDetails = _d.sent();
                        if (tableDetails.Table) {
                            table = tableDetails.Table;
                            resource = {
                                id: tableName,
                                type: 'dynamodb',
                                name: tableName,
                                properties: {
                                    status: table.TableStatus,
                                    itemCount: table.ItemCount,
                                    sizeBytes: table.TableSizeBytes,
                                    readCapacity: (_a = table.ProvisionedThroughput) === null || _a === void 0 ? void 0 : _a.ReadCapacityUnits,
                                    writeCapacity: (_b = table.ProvisionedThroughput) === null || _b === void 0 ? void 0 : _b.WriteCapacityUnits
                                }
                            };
                            resources.push(resource);
                        }
                        return [3 /*break*/, 6];
                    case 5:
                        error_12 = _d.sent();
                        console.error("Error getting details for DynamoDB table ".concat(tableName, ":"), error_12);
                        return [3 /*break*/, 6];
                    case 6:
                        _i++;
                        return [3 /*break*/, 2];
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        error_13 = _d.sent();
                        console.error('Error collecting DynamoDB Tables:', error_13);
                        return [3 /*break*/, 9];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    ResourceCollector.prototype.collectLoadBalancers = function (resources, connections) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var result, _i, _b, lb, resource, _c, _d, az, _e, _f, sgId, error_14;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _g.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.awsClient.getLoadBalancers()];
                    case 1:
                        result = _g.sent();
                        if (result.LoadBalancers) {
                            for (_i = 0, _b = result.LoadBalancers; _i < _b.length; _i++) {
                                lb = _b[_i];
                                if (lb.LoadBalancerArn) {
                                    resource = {
                                        id: lb.LoadBalancerArn,
                                        type: 'loadBalancer',
                                        name: lb.LoadBalancerName || lb.LoadBalancerArn,
                                        properties: {
                                            dnsName: lb.DNSName,
                                            type: lb.Type,
                                            scheme: lb.Scheme,
                                            state: (_a = lb.State) === null || _a === void 0 ? void 0 : _a.Code
                                        }
                                    };
                                    resources.push(resource);
                                    // LBとVPCの接続
                                    if (lb.VpcId) {
                                        connections.push({
                                            source: lb.LoadBalancerArn,
                                            target: lb.VpcId,
                                            type: 'belongs_to'
                                        });
                                    }
                                    // LBとSubnetの接続
                                    if (lb.AvailabilityZones) {
                                        for (_c = 0, _d = lb.AvailabilityZones; _c < _d.length; _c++) {
                                            az = _d[_c];
                                            if (az.SubnetId) {
                                                connections.push({
                                                    source: lb.LoadBalancerArn,
                                                    target: az.SubnetId,
                                                    type: 'belongs_to'
                                                });
                                            }
                                        }
                                    }
                                    // LBとSGの接続
                                    if (lb.SecurityGroups) {
                                        for (_e = 0, _f = lb.SecurityGroups; _e < _f.length; _e++) {
                                            sgId = _f[_e];
                                            connections.push({
                                                source: lb.LoadBalancerArn,
                                                target: sgId,
                                                type: 'uses'
                                            });
                                        }
                                    }
                                }
                            }
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_14 = _g.sent();
                        console.error('Error collecting Load Balancers:', error_14);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return ResourceCollector;
}());
exports.ResourceCollector = ResourceCollector;
