const express = require('express');
const {
    obtenerMisChats,
    iniciarChat,
    obtenerMensajes,
    enviarMensaje
} = require('../controllers/chat.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(verificarToken);

// GET /api/chats
router.get('/', obtenerMisChats);

// POST /api/chats/iniciar
router.post('/iniciar', iniciarChat);

// GET /api/chats/:id_chat/mensajes
router.get('/:id_chat/mensajes', obtenerMensajes);

// POST /api/chats/:id_chat/mensajes
router.post('/:id_chat/mensajes', enviarMensaje);

module.exports = router;
