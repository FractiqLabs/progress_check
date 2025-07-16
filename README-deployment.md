# Shinchoku デプロイメントガイド

## クラウドデータベース同期機能について

このプロジェクトは、異なるパソコンや異なるブラウザでデータが同期される仕様に更新されました。

### 主な変更点

1. **PostgreSQL対応**: クラウドデータベースとしてPostgreSQLを使用
2. **リアルタイム同期**: WebSocketを使用してリアルタイムでデータ同期
3. **環境設定**: 開発・本番環境の設定分離

## ローカル開発環境

### SQLiteでの開発（従来通り）
```bash
npm install
npm run dev
```

### PostgreSQLでの開発
```bash
# Docker ComposeでPostgreSQLを起動
docker-compose up postgres -d

# 環境変数を設定
cp .env.example .env
# .envファイルを編集してDB_TYPE=postgresに設定

# データベースセットアップ
npm run db:setup

# 開発サーバー起動
npm run dev
```

## 本番デプロイメント

### 1. Heroku
```bash
# Heroku CLI設定
heroku create your-app-name
heroku addons:create heroku-postgresql:hobby-dev

# 環境変数設定
heroku config:set DB_TYPE=postgres
heroku config:set JWT_SECRET=your-secret-key

# デプロイ
git push heroku main
```

### 2. Railway
```bash
# Railway CLI設定
railway login
railway init
railway add postgresql

# 環境変数設定（Railway Dashboard）
# DB_TYPE=postgres
# DATABASE_URL=自動設定される

# デプロイ
railway up
```

### 3. Docker Compose（自前サーバー）
```bash
# 本番用設定
cp .env.example .env
# .envファイルを本番用に編集

# 起動
docker-compose up -d
```

## 環境変数

### 必須設定
- `DB_TYPE`: "postgres" または "sqlite"
- `JWT_SECRET`: JWT暗号化キー
- `NODE_ENV`: "production" または "development"

### PostgreSQL使用時
- `DB_HOST`: データベースホスト
- `DB_PORT`: データベースポート（通常5432）
- `DB_NAME`: データベース名
- `DB_USER`: ユーザー名
- `DB_PASSWORD`: パスワード

または

- `DATABASE_URL`: PostgreSQL接続URL

## リアルタイム同期機能

### 同期されるイベント
1. 新規申込者の追加
2. 申込者情報の更新
3. タイムライン投稿の追加
4. ステータスの変更

### 使用方法
- ログイン後、自動的にWebSocket接続が確立
- 他のユーザーの操作がリアルタイムで反映される
- ネットワーク切断時は自動再接続

## トラブルシューティング

### データベース接続エラー
```bash
# PostgreSQL接続確認
npm run db:setup
```

### WebSocket接続エラー
- ファイアウォール設定の確認
- プロキシ設定の確認
- ブラウザのWebSocket対応確認

## セキュリティ注意事項

1. **JWT_SECRET**: 必ず本番環境用の強力なキーを設定
2. **データベース認証**: 強力なパスワードを使用
3. **HTTPS**: 本番環境では必ずHTTPS使用
4. **ファイアウォール**: 不要なポートは閉じる

## パフォーマンス最適化

1. **データベース接続プール**: PostgreSQLで自動設定済み
2. **WebSocket接続管理**: 適切な切断・再接続処理実装済み
3. **キャッシュ戦略**: 必要に応じて実装可能