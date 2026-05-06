const { Usuario, Publicacion, Imagen } = require('../models');

// 1. Obtener todos los usuarios
const obtenerUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.findAll({
            attributes: { exclude: ['contraseña', 'token_recuperacion'] },
            order: [['fecha_registro', 'DESC']]
        });
        res.json(usuarios);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// 2. Cambiar estado de un usuario (activo, suspendido, bloqueado)
const cambiarEstadoUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado_cuenta } = req.body; // 'activo', 'suspendido', 'bloqueado'

        const estadosPermitidos = ['activo', 'suspendido', 'bloqueado'];
        if (!estadosPermitidos.includes(estado_cuenta)) {
            return res.status(400).json({ error: 'Estado de cuenta inválido' });
        }

        const usuario = await Usuario.findByPk(id);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Evitar que el admin se bloquee a sí mismo
        if (usuario.id_usuario === req.usuario.id_usuario) {
            return res.status(403).json({ error: 'No puedes cambiar tu propio estado desde esta interfaz' });
        }

        usuario.estado_cuenta = estado_cuenta;
        await usuario.save();

        res.json({ mensaje: `El estado del usuario ${usuario.nombre} ahora es: ${estado_cuenta}` });
    } catch (error) {
        console.error('Error al cambiar estado de usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// 3. Obtener todas las publicaciones (Para moderación)
const obtenerPublicacionesAdmin = async (req, res) => {
    try {
        const publicaciones = await Publicacion.findAll({
            include: [
                { model: Imagen, as: 'imagenes', attributes: ['ruta_imagen'] }
            ],
            order: [['fecha_publicacion', 'DESC']]
        });
        res.json(publicaciones);
    } catch (error) {
        console.error('Error al obtener publicaciones:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// 4. Eliminar publicación forzosamente (Moderación)
const eliminarPublicacionAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const publicacion = await Publicacion.findByPk(id);

        if (!publicacion) {
            return res.status(404).json({ error: 'Publicación no encontrada' });
        }

        // Aquí podríamos borrarla o solo cambiar su estado a 'eliminada'
        // Lo marcaremos como eliminada para mantener el historial
        publicacion.estado_pub = 'eliminada';
        await publicacion.save();

        res.json({ mensaje: 'Publicación moderada/eliminada con éxito' });
    } catch (error) {
        console.error('Error al eliminar publicación:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// 5. Estadísticas rápidas del dashboard
const obtenerDashboardStats = async (req, res) => {
    try {
        const totalUsuarios = await Usuario.count();
        const usuariosBloqueados = await Usuario.count({ where: { estado_cuenta: 'bloqueado' } });
        
        const totalPublicaciones = await Publicacion.count();
        const pubsVendidas = await Publicacion.count({ where: { estado_pub: 'vendida' } });
        const pubsEliminadas = await Publicacion.count({ where: { estado_pub: 'eliminada' } });

        res.json({
            usuarios: {
                total: totalUsuarios,
                bloqueados: usuariosBloqueados,
                activos: totalUsuarios - usuariosBloqueados
            },
            publicaciones: {
                total: totalPublicaciones,
                vendidas: pubsVendidas,
                eliminadas: pubsEliminadas,
                activas: totalPublicaciones - pubsVendidas - pubsEliminadas
            }
        });
    } catch (error) {
        console.error('Error al obtener estadísticas de admin:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = {
    obtenerUsuarios,
    cambiarEstadoUsuario,
    obtenerPublicacionesAdmin,
    eliminarPublicacionAdmin,
    obtenerDashboardStats
};
