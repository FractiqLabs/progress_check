require('dotenv').config();

async function setupDatabase() {
  const dbType = process.env.DB_TYPE || 'sqlite';
  
  if (dbType === 'postgres') {
    const db = require('../database/postgres-db');
    try {
      await db.init();
      console.log('PostgreSQLデータベースのセットアップが完了しました');
      process.exit(0);
    } catch (error) {
      console.error('データベースセットアップエラー:', error);
      process.exit(1);
    }
  } else {
    const db = require('../database/db');
    try {
      await db.init();
      console.log('SQLiteデータベースのセットアップが完了しました');
      process.exit(0);
    } catch (error) {
      console.error('データベースセットアップエラー:', error);
      process.exit(1);
    }
  }
}

setupDatabase();