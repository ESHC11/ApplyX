require('dotenv').config();
const db = require('./config/db');

async function migrate() {
    console.log('Iniciando migración de la base de datos...');
    try {
        // 0. Crear tabla usuarios si no existe (importante para nuevas nubes)
        await db.query(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id_usuario INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(255) NOT NULL,
                correo VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                rol VARCHAR(50) DEFAULT 'usuario',
                fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabla "usuarios" lista');

        // 1. Añadir columna skills (TEXT para soportar JSON largo)
        try {
            await db.query(`ALTER TABLE usuarios ADD COLUMN skills TEXT DEFAULT NULL`);
            console.log('✅ Columna "skills" añadida a usuarios');
        } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️  La columna "skills" ya existe');
            } else {
                throw error;
            }
        }

        // 2. Crear tabla user_jobs con status capitalizados (match frontend)
        await db.query(`
            CREATE TABLE IF NOT EXISTS user_jobs (
                id          INT AUTO_INCREMENT PRIMARY KEY,
                id_usuario  INT NOT NULL,
                title       VARCHAR(255) NOT NULL,
                company     VARCHAR(255) NOT NULL,
                description TEXT,
                link        VARCHAR(500),
                status      ENUM('Guardada','Aplicada','Pendiente','Rechazada') DEFAULT 'Guardada',
                iconType    ENUM('blue','pink','green') DEFAULT 'blue',
                created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
            )
        `);
        console.log('✅ Tabla "user_jobs" lista');

        console.log('✅ Migración completada exitosamente.');
    } catch (error) {
        console.error('❌ Error durante la migración:', error.message);
    } finally {
        process.exit(0);
    }
}

migrate();
