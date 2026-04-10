const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/manual-jobs
router.get('/', async (req, res) => {
    try {
        const id_usuario = req.user.id;
        const [jobs] = await db.query(
            'SELECT * FROM user_jobs WHERE id_usuario = ? ORDER BY created_at DESC',
            [id_usuario]
        );
        res.json({ success: true, data: jobs });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/manual-jobs
router.post('/', async (req, res) => {
    try {
        const id_usuario = req.user.id;
        const { title, company, description, link, status, iconType } = req.body;

        if (!title || !company) {
            return res.status(400).json({ success: false, error: 'Faltan campos obligatorios' });
        }

        const [resultado] = await db.query(
            `INSERT INTO user_jobs (id_usuario, title, company, description, link, status, iconType) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id_usuario, title, company, description || '', link || '', status || 'pendiente', iconType || 'blue']
        );

        res.status(201).json({
            success: true,
            data: { id: resultado.insertId, title, company, description, link, status, iconType }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// PATCH /api/manual-jobs/:id  — actualizar estatus
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const id_usuario = req.user.id;
        const { status } = req.body;

        const VALID = ['Guardada', 'Aplicada', 'Pendiente', 'Rechazada'];
        if (!VALID.includes(status)) {
            return res.status(400).json({ success: false, error: 'Estatus inválido' });
        }

        const [existing] = await db.query(
            'SELECT id FROM user_jobs WHERE id = ? AND id_usuario = ?',
            [id, id_usuario]
        );
        if (!existing.length)
            return res.status(404).json({ success: false, error: 'Job no encontrado' });

        await db.query('UPDATE user_jobs SET status = ? WHERE id = ?', [status, id]);
        res.json({ success: true, message: 'Estatus actualizado' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE /api/manual-jobs/:id
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const id_usuario = req.user.id;

        const [job] = await db.query('SELECT id FROM user_jobs WHERE id = ? AND id_usuario = ?', [id, id_usuario]);
        if (!job.length) return res.status(404).json({ success: false, error: 'Job no encontrado' });

        await db.query('DELETE FROM user_jobs WHERE id = ?', [id]);
        res.json({ success: true, message: 'Job eliminado' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
