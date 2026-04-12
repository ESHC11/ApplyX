const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

// POST /api/usuarios/google
router.post('/google', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ error: 'Token es requerido' });

        const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!googleRes.ok) {
            return res.status(401).json({ error: 'Token de Google inválido' });
        }

        const payload = await googleRes.json();
        const { email, name } = payload;

        // Comprobar si el usuario existe
        const [rows] = await db.query('SELECT * FROM usuarios WHERE correo = ?', [email]);
        
        let id_usuario;

        if (rows.length > 0) {
            id_usuario = rows[0].id_usuario;
        } else {
            // Usuario nuevo, crear cuenta
            // Generar password random muy seguro ya que se loguea por Google
            const randomPassword = require('crypto').randomBytes(16).toString('hex');
            const hash = await bcrypt.hash(randomPassword, 10);
            const rol = 'usuario';

            const [result] = await db.query(
                'INSERT INTO usuarios (nombre, correo, password, rol) VALUES (?, ?, ?, ?)',
                [name, email, hash, rol]
            );
            id_usuario = result.insertId;
        }

        // Generar JWT local
        const jwtToken = jwt.sign(
            { id: id_usuario },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({ token: jwtToken });

    } catch (error) {
        console.error('Error Google Auth:', error);
        res.status(500).json({ error: 'Error autenticando con Google' });
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