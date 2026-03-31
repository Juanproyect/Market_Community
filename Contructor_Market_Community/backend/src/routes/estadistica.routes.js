const express = require('express');
const { obtenerEstadisticas } = require('../controllers/estadistica.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(verificarToken);

// GET /api/estadisticas
router.get('/', obtenerEstadisticas);

module.exports = router;
