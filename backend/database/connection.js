const path = require('path');

const dbPath = process.env.DB_PATH
    ? path.resolve(process.env.DB_PATH)
    : path.join(__dirname, '../../database/agrodirecto.db');

let db;
let DatabaseSync;

try {
    DatabaseSync = require('node:sqlite').DatabaseSync;
} catch {
    const BetterSqlite3 = require('better-sqlite3');
    DatabaseSync = class {
        constructor(filePath) {
            this._inner = new BetterSqlite3(filePath);
        }
        exec(sql) { this._inner.exec(sql); }
        prepare(sql) { return this._inner.prepare(sql); }
        close() { this._inner.close(); }
    };
}

function getConnection() {
    if (!db) {
        db = new DatabaseSync(dbPath);
        db.exec('PRAGMA journal_mode = WAL');
        db.exec('PRAGMA foreign_keys = ON');
        console.log('✅ Base de datos SQLite conectada:', dbPath);
    }
    return db;
}

function closeConnection() {
    if (db) {
        db.close();
        db = null;
    }
}

module.exports = { getConnection, closeConnection };
