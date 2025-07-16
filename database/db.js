const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

class Database {
  constructor() {
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database('./database/shinchoku.db', (err) => {
        if (err) {
          console.error('データベース接続エラー:', err.message);
          reject(err);
          return;
        }
        console.log('SQLiteデータベースに接続しました');
        this.setupDatabase().then(resolve).catch(reject);
      });
    });
  }

  async setupDatabase() {
    return new Promise((resolve, reject) => {
      const schemaPath = path.join(__dirname, 'schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      this.db.exec(schema, (err) => {
        if (err) {
          console.error('データベーススキーマ作成エラー:', err.message);
          reject(err);
          return;
        }
        console.log('データベーススキーマが作成されました');
        resolve();
      });
    });
  }

  async run(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(query, params, function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  async get(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(query, params, (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row);
      });
    });
  }

  async all(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows);
      });
    });
  }

  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('データベース切断エラー:', err.message);
          return;
        }
        console.log('データベース接続を閉じました');
      });
    }
  }
}

module.exports = new Database();