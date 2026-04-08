const express = require('express');
const { registrar, login, perfil, solicitarRecuperacion, restablecerPassword, solicitarRecordatorioUsuario, validarTokenUsuario } = require('../controllers/auth.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

const router = express.Router();

// Rutas Públicas
router.post('/register', registrar);
router.post('/login', login);
router.post('/forgot-password', solicitarRecuperacion);
router.post('/reset-password', restablecerPassword);
router.post('/forgot-username', solicitarRecordatorioUsuario);
router.post('/reveal-username', validarTokenUsuario);

// Rutas Protegidas (Requieren token)
router.get('/me', verificarToken, perfil);

module.exports = router;
