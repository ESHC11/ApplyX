
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const db = require('../config/db');
router.use(authMiddleware);

/**
 * POST /api/favoritos
 */
router.post('/', async (req, res) => {
    try {
        const { id_empleo, titulo_empleo, empresa } = req.body;
        const id_usuario = req.user.id;

        // Validar que vengan los datos necesarios
        if (!id_empleo || !titulo_empleo) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos: id_empleo y titulo_empleo son obligatorios'
            });
        }

        // Verificar
        const [existe] = await db.query(
            'SELECT id FROM favoritos WHERE id_usuario = ? AND id_empleo = ?',
            [id_usuario, id_empleo]
        );

        if (existe.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Este empleo ya está en tus favoritos'
            });
        }

        // Insertar el favorito
        const [resultado] = await db.query(
            'INSERT INTO favoritos (id_usuario, id_empleo, titulo_empleo, empresa) VALUES (?, ?, ?, ?)',
            [id_usuario, id_empleo, titulo_empleo, empresa || null]
        );

        res.status(201).json({
            success: true,
            message: 'Empleo guardado en favoritos',
            data: {
                id: resultado.insertId,
                id_usuario,
                id_empleo,
                titulo_empleo,
                empresa
            }
        });

    } catch (error) {
        console.error('Error al guardar favorito:', error);
        res.status(500).json({
            success: false,
            message: 'Error al guardar el favorito',
            error: error.message
        });
    }
});

/* Obtener todos los favoritos*/
router.get('/:id_usuario', async (req, res) => {
    try {
        const { id_usuario } = req.params;
        const usuario_autenticado = req.user.id;
        if (parseInt(id_usuario) !== usuario_autenticado) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para ver estos favoritos'
            });
        }
        const [favoritos] = await db.query(
            'SELECT id, id_empleo, titulo_empleo, empresa, fecha_guardado FROM favoritos WHERE id_usuario = ? ORDER BY fecha_guardado DESC',
            [id_usuario]
        )

        res.json({
            success: true,
            total: favoritos.length,
            data: favoritos
        });

    } catch (error) {
        console.error('Error al obtener favoritos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener favoritos',
            error: error.message
        });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const id_usuario = req.user.id;
        const [favorito] = await db.query(
            'SELECT id FROM favoritos WHERE id = ? AND id_usuario = ?',
            [id, id_usuario]
        );

        if (favorito.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Favorito no encontrado o no tienes permiso para eliminarlo'
            });
        }

        // Eliminar
        await db.query('DELETE FROM favoritos WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Favorito eliminado correctamente'
        })

    } catch (error) {
        console.error('Error al eliminar favorito:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el favorito',
            error: error.message
        });
    }
});

module.exports = router;
