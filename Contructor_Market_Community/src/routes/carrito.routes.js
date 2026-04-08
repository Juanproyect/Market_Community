const express = require('express');
const { 
    obtenerCarrito, 
    agregarAlCarrito, 
    removerDelCarrito, 
    checkout 
} = require('../controllers/carrito.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

const router = express.Router();

// Absolutamente todo en el carrito requiere sesión (autenticación)
router.use(verificarToken);

// Obtener contenido del carrito
router.get('/', obtenerCarrito);

// Añadir una publicación
router.post('/agregar', agregarAlCarrito);

// Eliminar una publicación
router.delete('/remover/:id_publicacion', removerDelCarrito);

// Realizar checkout (comprar)
router.post('/checkout', checkout);

module.exports = router;
