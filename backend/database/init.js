const fs = require('fs');
const path = require('path');
const { getConnection } = require('./connection');

function initializeDatabase() {
    try {
        const db = getConnection();
        const initSqlPath = path.join(__dirname, 'init.sql');
        const initSql = fs.readFileSync(initSqlPath, 'utf-8');
        db.exec(initSql);
        console.log('✅ Esquema de base de datos inicializado correctamente');
    } catch (error) {
        console.error('❌ Error al inicializar la base de datos:', error.message);
        throw error;
    }
}

initializeDatabase();

module.exports = { initializeDatabase };
