# Auto AWS Diagram

AWSのアーキテクチャ図を自動生成するCLIツールです。AWSアカウント内のリソースを検出し、SVG形式の図を生成します。

## 機能

- EC2、VPC、Subnet、Security Group、Internet Gateway、NAT Gatewayなど多数のAWSリソースをサポート
- S3、RDS、Lambda、DynamoDB、Load Balancerなどのマネージドサービスも対応
- リソース間の関係性を自動検出して図に反映
- SVG形式で出力（任意のSVGエディタで編集可能）
- カスタマイズ可能なオプション（サイズ、出力先など）

## インストール

```bash
npm install -g auto-aws-diagram
```

## 使用方法

### デモ図の生成

```bash
auto-aws-diagram demo
# または
auto-aws-diagram demo -o custom-output-filename.svg
```

### 実際のAWS環境からの図生成

```bash
# デフォルトのAWSプロファイルと us-east-1 リージョンを使用
auto-aws-diagram generate

# カスタムプロファイルとリージョンを指定
auto-aws-diagram generate -p my-profile -r ap-northeast-1

# 出力ファイル名を指定
auto-aws-diagram generate -o my-architecture.svg

# 特定のリソースタイプだけを含める
auto-aws-diagram generate -t ec2,vpc,subnet,rds
```

### オプション

- `-p, --profile <profile>` - 使用するAWSプロファイル名
- `-r, --region <region>` - スキャンするAWSリージョン（デフォルト: us-east-1）
- `-o, --output <file>` - 出力するSVGファイルのパス
- `-t, --resource-types <types>` - 含めるリソースタイプのカンマ区切りリスト
- `-w, --width <width>` - SVGの幅（ピクセル）
- `-h, --height <height>` - SVGの高さ（ピクセル）

## サポートしているリソースタイプ

- `ec2` - EC2インスタンス
- `vpc` - VPC
- `subnet` - サブネット
- `securityGroup` - セキュリティグループ
- `internetGateway` - インターネットゲートウェイ
- `natGateway` - NATゲートウェイ
- `s3` - S3バケット
- `rds` - RDSインスタンス
- `lambda` - Lambda関数
- `dynamodb` - DynamoDBテーブル
- `loadBalancer` - ロードバランサー

## 開発

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/auto-aws-diagram.git
cd auto-aws-diagram

# 依存パッケージをインストール
npm install

# ビルド
npm run build

# デモを実行
npm run demo
```

## ライセンス

MIT

## 注意事項

- このツールはAWSのAPIを使用してリソースを検出するため、適切なIAMアクセス権が必要です
- 大規模な環境では、リソース収集に時間がかかる場合があります
- 100%のリソースカバレッジを保証するものではありません 