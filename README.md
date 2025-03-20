# Auto AWS Diagram

AWS のアーキテクチャ図を自動生成する CLI ツールです。AWS アカウント内のリソースを検出し、SVG 形式の図を生成します。
このプロジェクトのコードは人間が手をつけずに、Cursor と Claude 3.7 Sonnet で作成されました。初期のプロンプトは巻末に入れています。

## 機能

- EC2、VPC、Subnet、Security Group、Internet Gateway、NAT Gateway など多数の AWS リソースをサポート
- S3、RDS、Lambda、DynamoDB、Load Balancer などのマネージドサービスも対応
- リソース間の関係性を自動検出して図に反映
- SVG 形式で出力（任意の SVG エディタで編集可能）
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

### 実際の AWS 環境からの図生成

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

- `-p, --profile <profile>` - 使用する AWS プロファイル名
- `-r, --region <region>` - スキャンする AWS リージョン（デフォルト: us-east-1）
- `-o, --output <file>` - 出力する SVG ファイルのパス
- `-t, --resource-types <types>` - 含めるリソースタイプのカンマ区切りリスト
- `-w, --width <width>` - SVG の幅（ピクセル）
- `-h, --height <height>` - SVG の高さ（ピクセル）

## サポートしているリソースタイプ

- `ec2` - EC2 インスタンス
- `vpc` - VPC
- `subnet` - サブネット
- `securityGroup` - セキュリティグループ
- `internetGateway` - インターネットゲートウェイ
- `natGateway` - NAT ゲートウェイ
- `s3` - S3 バケット
- `rds` - RDS インスタンス
- `lambda` - Lambda 関数
- `dynamodb` - DynamoDB テーブル
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

- このツールは AWS の API を使用してリソースを検出するため、適切な IAM アクセス権が必要です
- 大規模な環境では、リソース収集に時間がかかる場合があります
- 100%のリソースカバレッジを保証するものではありません

# 最初に動くまでの履歴

```
Create a CLI tool that generates an AWS architecture diagram in SVG format.
```

```
TypeScript で作れますか
```

（途中でタイムアウト）

```
続きをお願いします
```

（ここまでで一度動かせないところをデモとして完成した報告。コマンドが説明される）


```
ツールを実行するまでの手順をやってみて
```

（うまく動かずにデモ用のデータを用意して動かされるが、データ以外はエラーなく概ね動作。画像作成も成功）

```
demo で動いても価値がないので、ちゃんと動くようにして
```

（AWS からのデータ取得を実際に動かそうとして色々修正）

```
改めて続きをお願いします（実はここでこれまでのファイルを私のミスで消失）
```

（過去の内容を復元したかどうかはわからないが同様の動作まで復帰し、README まで作成）

```
git にしてコミットよろ
```

ここまでで最初のバージョンができて、最初のコミットまで。

