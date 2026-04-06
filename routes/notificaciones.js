const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const db = require('../config/db');

// Autocrear tabla de notificaciones si no existe
const initTable = async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS notificaciones (
                id INT AUTO_INCREMENT PRIMARY KEY,
                id_usuario INT NOT NULL,
                mensaje VARCHAR(255) NOT NULL,
                leida BOOLEAN DEFAULT FALSE,
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
            )
        `);
    } catch (error) {
        console.error('Error inicializando tabla notificaciones:', error);
    }
};
initTable();

router.use(authMiddleware);

// GET /api/notificaciones
router.get('/', async (req, res) => {
    try {
        const id_usuario = req.user.id;
        const [notificaciones] = await db.query(
            'SELECT * FROM notificaciones WHERE id_usuario = ? ORDER BY fecha_creacion DESC',
            [id_usuario]
        );

        res.json({
            success: true,
            data: notificaciones
        });
    } catch (error) {
        console.error('Error al obtener notificaciones:', error);
        res.status(500).json({ success: false, message: 'Error interno' });
    }
});

// POST /api/notificaciones (Testing endpoint para agregar una notificación)
router.post('/', async (req, res) => {
    try {
        const id_usuario = req.user.id;
        const { mensaje } = req.body;
        
        if (!mensaje) return res.status(400).json({ success: false, message: 'mensaje es requerido' });

        const [resultado] = await db.query(
            'INSERT INTO notificaciones (id_usuario, mensaje) VALUES (?, ?)',
            [id_usuario, mensaje]
        );

        res.status(201).json({ success: true, id: resultado.insertId, mensaje });
    } catch (error) {
        console.error('Error al crear notificación:', error);
        res.status(500).json({ success: false, message: 'Error al crear' });
    }
});

// PATCH /api/notificaciones/:id/leida
router.patch('/:id/leida', async (req, res) => {
    try {
        const { id } = req.params;
        const id_usuario = req.user.id;
        
        await db.query(
            'UPDATE notificaciones SET leida = TRUE WHERE id = ? AND id_usuario = ?',
            [id, id_usuario]
        );

        res.json({ success: true, message: 'Notificación marcada como leída' });
    } catch (error) {
        console.error('Error al actualizar notificación:', error);
        res.status(500).json({ success: false, message: 'Error interno' });
    }
});

module.exports = router;
