const express = require('express');
const { obtenerMisFavoritos, toggleFavorito } = require('../controllers/favorito.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

const router = express.Router();

// Todas las rutas de favoritos requieren usuario autenticado
router.use(verificarToken);

// GET /api/favoritos
router.get('/', obtenerMisFavoritos);

// POST /api/favoritos/:id_publicacion
router.post('/:id_publicacion', toggleFavorito);

module.exports = router;
