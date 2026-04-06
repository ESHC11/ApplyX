const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // Extraer el token del header Authorization (estándar Bearer)
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            msg: 'Acceso denegado. No hay un token válido.'
        });
    }

    const token = authHeader.split(' ')[1];   // Quita la palabra "Bearer "

    try {
        const cifrado = jwt.verify(token, process.env.JWT_SECRET);

        // Guardamos el usuario correctamente (tu token tiene "id")
        req.user = { id: cifrado.id };

        next();   // Continuar a la siguiente función
    } catch (error) {
        console.error('Error en auth middleware:', error.message);
        res.status(401).json({ msg: 'Token no válido o expirado' });
    }
};