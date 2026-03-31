const { Publicacion, Imagen, Categoria, Usuario } = require('../models');

// Obtener catálogo de publicaciones con filtros
const obtenerPublicaciones = async (req, res) => {
    try {
        const { id_categoria, tipo, estado_prenda } = req.query;

        // Por defecto, solo mostrar publicaciones activas (ni vendidas ni borradas)
        let whereClause = { estado_pub: 'activa' };
        
        if (id_categoria) whereClause.id_categoria = id_categoria;
        if (tipo) whereClause.tipo = tipo; // compraventa o donacion
        if (estado_prenda) whereClause.estado_prenda = estado_prenda;

        const publicaciones = await Publicacion.findAll({
            where: whereClause,
            include: [
                { model: Imagen, as: 'imagenes', attributes: ['id_imagen', 'ruta_imagen', 'orden'] },
                { model: Categoria, as: 'categoria', attributes: ['id_categoria', 'nombre'] },
                { model: Usuario, as: 'vendedor', attributes: ['id_usuario', 'nombre', 'apellido'] }
            ],
            order: [['fecha_publicacion', 'DESC']]
        });

        res.json(publicaciones);
    } catch (error) {
        console.error('Error obteniendo publicaciones:', error);
        res.status(500).json({ error: 'Error del servidor al obtener publicaciones' });
    }
};

// Obtener detalle de 1 sola publicación
const obtenerPublicacionPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const publicacion = await Publicacion.findByPk(id, {
            include: [
                { model: Imagen, as: 'imagenes', attributes: ['id_imagen', 'ruta_imagen', 'orden'] },
                { model: Categoria, as: 'categoria', attributes: ['id_categoria', 'nombre'] },
                { model: Usuario, as: 'vendedor', attributes: ['id_usuario', 'nombre', 'apellido', 'correo'] }
            ]
        });

        if (!publicacion) return res.status(404).json({ error: 'Publicación no encontrada' });

        res.json(publicacion);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno' });
    }
};

// Crear nueva publicación (auth requerida)
const crearPublicacion = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario; // Extraído del token
        const { titulo, descripcion, estado_prenda, tipo, precio, id_categoria } = req.body;

        // --- DEBUG LOG START ---
        require('fs').appendFileSync('debug_crear.log', JSON.stringify({
            body: req.body, 
            files: req.files ? req.files.length : 'no files', 
            user: id_usuario
        }) + '\n');
        // --- DEBUG LOG END ---

        if (!titulo || !id_categoria) {
            return res.status(400).json({ error: 'El título y la categoría son obligatorios' });
        }

        const nuevaPub = await Publicacion.create({
            titulo,
            descripcion,
            estado_prenda,
            tipo,
            precio: tipo === 'donacion' ? null : precio,
            id_usuario,
            id_categoria,
            estado_pub: 'activa'
        });

        // Guardar las imágenes en la DB si vienen archivos (hasta 5)
        if (req.files && req.files.length > 0) {
            const imagenesData = req.files.map((file, i) => ({
                ruta_imagen: file.filename, // Se guarda "nombre-hash.jpg", no toda la ruta c:/
                orden: i + 1,
                id_publicacion: nuevaPub.id_publicacion
            }));
            await Imagen.bulkCreate(imagenesData);
        }

        res.status(201).json({
            mensaje: 'Publicación creada exitosamente',
            publicacion_id: nuevaPub.id_publicacion
        });

    } catch (error) {
        console.error('Error creando publicación:', error);
        res.status(500).json({ error: `Error interno: ${error.message}` });
    }
};

// Borrado lógico de tu publicación
const eliminarPublicacion = async (req, res) => {
    try {
        const { id } = req.params;
        const id_usuario_peticion = req.usuario.id_usuario;

        const publicacion = await Publicacion.findByPk(id);
        if (!publicacion) return res.status(404).json({ error: 'Publicación no encontrada' });

        // Solo el creador o un admin puede eliminarla
        if (publicacion.id_usuario !== id_usuario_peticion && req.usuario.rol !== 'administrador') {
            return res.status(403).json({ error: 'Permiso denegado para alterar esta publicación' });
        }

        // Marcarla como eliminada en vez de borrarla de la BD (para historial)
        publicacion.estado_pub = 'eliminada';
        await publicacion.save();

        res.json({ mensaje: 'Publicación archivada/eliminada exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al dar de baja la publicación' });
    }
};

module.exports = {
    obtenerPublicaciones,
    obtenerPublicacionPorId,
    crearPublicacion,
    eliminarPublicacion
};
