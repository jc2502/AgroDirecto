const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = process.env.DB_PATH
    ? path.resolve(process.env.DB_PATH)
    : path.join(__dirname, '../../database/agrodirecto.db');

let db;

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
