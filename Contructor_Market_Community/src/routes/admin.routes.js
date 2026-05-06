const express = require('express');
const { 
    obtenerUsuarios, 
    cambiarEstadoUsuario, 
    obtenerPublicacionesAdmin, 
    eliminarPublicacionAdmin,
    obtenerDashboardStats
} = require('../controllers/admin.controller');
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware');

const router = express.Router();

// Todas las rutas de administración requieren autenticación y rol de "administrador"
router.use(verificarToken);
router.use(verificarRol(['administrador']));

// --- Usuarios ---
router.get('/usuarios', obtenerUsuarios);
router.put('/usuarios/:id/estado', cambiarEstadoUsuario);

// --- Publicaciones ---
router.get('/publicaciones', obtenerPublicacionesAdmin);
router.delete('/publicaciones/:id', eliminarPublicacionAdmin);

// --- Estadísticas ---
router.get('/estadisticas', obtenerDashboardStats);

module.exports = router;
