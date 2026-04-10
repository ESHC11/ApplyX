const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//POST /api/usuarios
// POST /api/usuarios/register
router.post('/register', async (req, res) => {
    try {
        const { nombre, correo, password, rol } = req.body;

        if (!nombre || !correo || !password || !rol) {
            return res.status(400).json({ mensaje: "Faltan campos obligatorios" });
        }

        const hash = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            'INSERT INTO usuarios (nombre, correo, password, rol) VALUES (?, ?, ?, ?)',
            [nombre, correo, hash, rol]
        );

        res.status(201).json({
            mensaje: 'Usuario registrado correctamente',
            id: result.insertId
        });

    } catch (error) {
        console.error('❌ Error al registrar usuario:', error);   // ← Esto sí se ve en terminal

        res.status(500).json({
            mensaje: "Error interno del servidor",
            detalle: error.message,      // ← Esto es lo nuevo (te muestra el error real)
            code: error.code || null
        });
    }
});

// POST /api/usuarios/login
router.post('/login', async (req, res) => {
    try {
        const { correo, password } = req.body;
        const [rows] = await db.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
        if (!rows.length) return res.status(401).json({error: 'Usuario no encontrado' });

        const valid = await bcrypt.compare(password, rows[0].password);
        if (!valid) return res.status(401).json({error: 'Contraseña incorrecta' });

        const token = jwt.sign(
            { id: rows[0].id_usuario },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        res.json({ token });
    } catch (error) {
        res.status(500).json({error: error.message });
    }
});

// GET /api/usuarios/:id
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id_usuario, nombre, correo, rol, skills, fecha_registro FROM usuarios WHERE id_usuario = ?', [req.params.id]
        );
        if (!rows.length) return res.status(404).json({error: 'Usuario no encontrado' });
        
        let user = rows[0];
        try { user.skills = JSON.parse(user.skills || '[]'); } catch(e) { user.skills = []; }
        res.json(user);
    } catch (error) {
        res.status(500).json({error: error.message });
    }
});

// PATCH /api/usuarios/:id/skills
const authMiddleware = require('../middleware/auth');
router.patch('/:id/skills', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { skills } = req.body;
        
        if (parseInt(id) !== req.user.id) {
            return res.status(403).json({ error: 'No tienes permisos' });
        }
        
        const skillsStr = JSON.stringify(skills || []);
        await db.query('UPDATE usuarios SET skills = ? WHERE id_usuario = ?', [skillsStr, id]);
        
        res.json({ message: 'Skills actualizadas correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PATCH /api/usuarios/:id/perfil
router.patch('/:id/perfil', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, correo } = req.body;
        
        if (parseInt(id) !== req.user.id) {
            return res.status(403).json({ error: 'No tienes permisos' });
        }
        
        if (!nombre || !correo) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }
        
        await db.query('UPDATE usuarios SET nombre = ?, correo = ? WHERE id_usuario = ?', [nombre, correo, id]);
        
        res.json({ success: true, message: 'Perfil actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;