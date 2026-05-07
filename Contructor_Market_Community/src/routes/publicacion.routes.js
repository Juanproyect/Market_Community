const express = require('express');
const {
    obtenerPublicaciones,
    obtenerPublicacionPorId,
    crearPublicacion,
    editarPublicacion,
    eliminarPublicacion
} = require('../controllers/publicacion.controller');

// Importar Middlewares
const { verificarToken } = require('../middlewares/auth.middleware');
const upload = require('../config/multer'); // Configurado para procesar inputs file

const router = express.Router();

// ========================
// Rutas de Acceso Público
// ========================
// Ej: GET /api/publicaciones?tipo=donacion&id_categoria=2
router.get('/', obtenerPublicaciones);

// Ej: GET /api/publicaciones/14
router.get('/:id', obtenerPublicacionPorId);

// ========================
// Rutas Protegidas
// ========================

// Crear publicación. 'imagenes' debe coincidir con el nombre(name="") del input file en HTML. Máximo 5 imágenes.
router.post('/', verificarToken, upload.array('imagenes', 5), crearPublicacion);

// Editar publicación
router.put('/:id', verificarToken, editarPublicacion);

// Eliminar publicación lógicamente
router.delete('/:id', verificarToken, eliminarPublicacion);

module.exports = router;
