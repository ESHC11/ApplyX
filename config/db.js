const mysql = require('mysql2');
require('dotenv').config();

const pool = process.env.DATABASE_URL 
    ? mysql.createPool(process.env.DATABASE_URL)
    : mysql.createPool({
          host    : process.env.DB_HOST,
          user    : process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
      });

// Verificar conexión al iniciar
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Error al conectar con MySQL:', err.message);
        console.error('   Verifica DB_HOST, DB_USER, DB_PASSWORD, DB_NAME en .env');
    } else {
        console.log('✅ Conectado a MySQL - Base de datos:', process.env.DB_NAME);
        connection.release();
    }
});

module.exports = pool.promise();