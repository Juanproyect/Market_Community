const express = require('express');
const { 
    crearTicket, 
    obtenerMisTickets, 
    obtenerTodosLosTickets, 
    actualizarEstadoTicket 
} = require('../controllers/soporte.controller');

const { verificarToken, verificarRol } = require('../middlewares/auth.middleware');

const router = express.Router();

// Rutas genéricas
router.use(verificarToken);

// Usuario normal
router.post('/', crearTicket);
router.get('/mis-tickets', obtenerMisTickets);

// Administrador
router.get('/admin', verificarRol(['administrador']), obtenerTodosLosTickets);
router.put('/admin/:id_soporte', verificarRol(['administrador']), actualizarEstadoTicket);

module.exports = router;
