const express = require('express');
const cors = require('cors');

const jobicyRoutes    = require('./routes/remotive');
const theMuseRoutes   = require('./routes/adzuna');
const jobsRoutes      = require('./routes/jobs');
const favoritosRoutes = require('./routes/favoritos');
const usuariosRoutes  = require('./routes/usuarios');
const notificacionesRoutes = require('./routes/notificaciones');

const app = express();

app.use(cors());
app.use(express.json());

// Rutas existentes
app.use('/api/jobicy', jobicyRoutes);
app.use('/api/themuse', theMuseRoutes);

// Rutas nuevas
app.use('/api/jobs', jobsRoutes);
app.use('/api/favoritos', favoritosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/notificaciones', notificacionesRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Job Search API funcionando ✅' });
});

module.exports = app;
