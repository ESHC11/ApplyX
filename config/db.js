const mysql = require('mysql2');
require('dotenv').config();

let pool;
if (process.env.DATABASE_URL) {
    // Aiven y otras nubes exigen SSL, mysql2 ignora "?ssl-mode=REQUIRED" en el string,
    // por ende debemos pasar el string y forzar la propiedad ssl en las opciones.
    pool = mysql.createPool({
        uri: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
} else {
    pool = mysql.createPool({
        host    : process.env.DB_HOST,
        user    : process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });
}

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