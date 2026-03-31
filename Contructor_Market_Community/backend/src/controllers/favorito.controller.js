const { Favorito, Publicacion, Imagen, Categoria } = require('../models');

// Obtener todos los favoritos del usuario actual
const obtenerMisFavoritos = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;

        const favoritos = await Favorito.findAll({
            where: { id_usuario },
            include: [
                {
                    model: Publicacion,
                    as: 'publicacion',
                    include: [
                        { model: Imagen, as: 'imagenes', attributes: ['ruta_imagen'] },
                        { model: Categoria, as: 'categoria', attributes: ['nombre'] }
                    ]
                }
            ],
            order: [['fecha_guardado', 'DESC']]
        });

        res.json(favoritos);
    } catch (error) {
        console.error('Error obteniendo favoritos:', error);
        res.status(500).json({ error: 'Error del servidor al obtener favoritos' });
    }
};

// Alternar (Agregar/Quitar) publicacion de favoritos
const toggleFavorito = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;
        const { id_publicacion } = req.params;

        // Comprobar si existe la publicación
        const publicacion = await Publicacion.findByPk(id_publicacion);
        if (!publicacion) {
            return res.status(404).json({ error: 'Publicación no encontrada' });
        }

        // Buscar el favorito
        const favoritoExistente = await Favorito.findOne({
            where: { id_usuario, id_publicacion }
        });

        if (favoritoExistente) {
            // Si ya existe, lo borramos (Toggle off)
            await favoritoExistente.destroy();
            return res.json({ mensaje: 'Eliminado de favoritos', estado: false });
        } else {
            // Si no existe, lo creamos (Toggle on)
            await Favorito.create({
                id_usuario,
                id_publicacion
            });
            return res.json({ mensaje: 'Añadido a favoritos', estado: true });
        }
    } catch (error) {
        console.error('Error alternando favorito:', error);
        res.status(500).json({ error: 'No se pudo procesar la acción' });
    }
};

module.exports = {
    obtenerMisFavoritos,
    toggleFavorito
};
