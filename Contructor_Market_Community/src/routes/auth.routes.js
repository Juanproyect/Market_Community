const express = require('express');
const { 
    registrar, 
    login, 
    obtenerPerfil, 
    actualizarFotoPerfil,
    pingOnline,
    solicitarRecuperacion, 
    restablecerPassword,
    solicitarRecordatorioUsuario,
    validarTokenUsuario 
} = require('../controllers/auth.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
const upload = require('../config/multer');

const router = express.Router();

// Rutas Públicas
router.post('/register', registrar);
router.post('/login', login);
router.post('/forgot-password', solicitarRecuperacion);
router.post('/reset-password', restablecerPassword);
router.post('/forgot-username', solicitarRecordatorioUsuario);
router.post('/reveal-username', validarTokenUsuario);

// Rutas Protegidas (Requieren token)
router.get('/me', verificarToken, obtenerPerfil);
router.put('/foto', verificarToken, upload.single('foto'), actualizarFotoPerfil);
router.put('/ping', verificarToken, pingOnline);

module.exports = router;
