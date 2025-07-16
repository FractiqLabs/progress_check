# シンチョク. | 特養入居進捗管理アプリ

特別養護老人ホーム（特養）の入居申込者の進捗状況をリアルタイムで管理・共有できるWebアプリケーションです。

![シンチョク.](https://img.shields.io/badge/シンチョク.-特養入居進捗管理-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node.js](https://img.shields.io/badge/node.js-18+-brightgreen)

## 🌟 特徴

- **📋 申込者情報の一元管理** - 氏名、年齢、介護度、連絡先等の基本情報を管理
- **📊 進捗状況のリアルタイム更新** - WebSocketによる即座な状況共有
- **⏰ タイムライン形式での記録管理** - 時系列での進捗確認が可能
- **🔄 複数デバイス間でのデータ同期** - 異なるPC・ブラウザでデータ共有
- **🔐 セキュアな認証システム** - JWT認証によるアクセス制御
- **💾 柔軟なデータベース対応** - SQLite（ローカル）とPostgreSQL（クラウド）

## 🚀 クイックデプロイ

### Railway（推奨）
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/shinchoku)

### Heroku
[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/FractiqLabs/Shinchoku)

### Render
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/FractiqLabs/Shinchoku)

## 💻 ローカル開発環境

### 必要な環境
- Node.js 18以上
- npm または yarn

### セットアップ手順

1. **リポジトリのクローン**
   ```bash
   git clone https://github.com/FractiqLabs/Shinchoku.git
   cd Shinchoku
   ```

2. **依存関係のインストール**
   ```bash
   npm install
   ```

3. **環境設定**
   ```bash
   cp .env.example .env
   # .envファイルを編集して必要な設定を行う
   ```

4. **開発サーバーの起動**
   ```bash
   npm run dev
   ```

5. **ブラウザでアクセス**
   ```
   http://localhost:3001
   ```

### デフォルトログイン情報
- **ユーザー名**: `a` / **パスワード**: `a`
- **ユーザー名**: `b` / **パスワード**: `b`
- **ユーザー名**: `c` / **パスワード**: `c`

## 🐳 Docker での実行

### Docker Compose（推奨）
```bash
# PostgreSQLを含む完全な環境
docker-compose up -d
```

### 単体Docker
```bash
# Dockerfile使用
docker build -t shinchoku .
docker run -p 3001:3001 shinchoku
```

## ☁️ クラウドデプロイ

### PostgreSQL使用時の環境変数
```bash
DB_TYPE=postgres
DB_HOST=your-postgres-host
DB_PORT=5432
DB_NAME=shinchoku
DB_USER=your-username
DB_PASSWORD=your-password
JWT_SECRET=your-secret-key
NODE_ENV=production
```

### SQLite使用時（ローカル開発）
```bash
DB_TYPE=sqlite
JWT_SECRET=your-secret-key
NODE_ENV=development
```

## 📖 使用方法

### 基本的な操作

1. **ログイン**
   - 認証情報を入力してシステムにアクセス

2. **申込者の追加**
   - 「新規登録」ボタンから申込者情報を入力

3. **進捗の更新**
   - 申込者の詳細画面でタイムライン投稿を追加
   - アクション選択により自動的にステータスが更新

4. **情報の共有**
   - リアルタイムで他のユーザーと情報を共有
   - 変更は即座に全ユーザーに反映

### 進捗ステータス

- **申込書受領** → **実調日程調整中** → **実調完了**
- **健康診断書依頼** → **健康診断書待ち** → **健康診断書受領**
- **判定会議中** → **入居決定** → **入居日調整中**
- **書類送付済** → **入居準備完了** → **入居完了**

## 🛠️ 技術スタック

### フロントエンド
- React 17
- Vanilla JavaScript
- Socket.IO Client
- CSS3

### バックエンド
- Node.js
- Express.js
- Socket.IO
- JWT認証
- bcryptjs

### データベース
- SQLite3（開発環境）
- PostgreSQL（本番環境）

### インフラ・デプロイ
- Docker & Docker Compose
- GitHub Actions
- Railway / Heroku / Render 対応

## 📁 プロジェクト構成

```
Shinchoku/
├── index.html              # メインアプリケーション
├── server.js              # Express サーバー
├── api-client.js          # API クライアント & WebSocket
├── database/
│   ├── db.js              # SQLite データベース
│   ├── postgres-db.js     # PostgreSQL データベース
│   ├── schema.sql         # SQLite スキーマ
│   └── postgres-schema.sql # PostgreSQL スキーマ
├── docs/                  # GitHub Pages 用静的サイト
├── scripts/               # データベースセットアップスクリプト
├── .github/workflows/     # GitHub Actions
├── docker-compose.yml     # Docker 構成
├── Dockerfile            # Docker イメージ
├── app.json              # Heroku 設定
├── railway.json          # Railway 設定
└── render.yaml           # Render 設定
```

## 🔒 セキュリティ

- JWT トークンによる認証
- パスワードのハッシュ化（bcryptjs）
- CORS 設定
- 環境変数による機密情報管理
- HTTPS 通信推奨

## 📄 法的事項

- [免責事項](disclaimer.html)
- [プライバシーポリシー](privacy.html)
- [著作権・クレジット](credits.html)

## 🤝 コントリビューション

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照してください。

## 👥 作者

**FractiqLabs**
- GitHub: [@FractiqLabs](https://github.com/FractiqLabs)

## 🙏 謝辞

特別養護老人ホームの現場で働く皆様からの貴重なご意見をいただき、開発することができました。心より感謝申し上げます。

---

**⚠️ 注意事項**

本アプリケーションは特別養護老人ホームの業務支援ツールです。重要な判断については必ず専門家にご相談ください。また、個人情報の取り扱いには十分ご注意ください。