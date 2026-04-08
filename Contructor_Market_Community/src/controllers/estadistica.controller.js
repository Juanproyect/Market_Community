const { Publicacion, Favorito, DetalleCarrito, Carrito, Pago } = require('../models');

// Obtener estadísticas del dashboard del usuario
const obtenerEstadisticas = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;

        // 1. Total de publicaciones activas creadas por el usuario
        const totalPublicaciones = await Publicacion.count({
            where: { id_usuario, estado_pub: 'activa' }
        });

        // 2. Favoritos que han recibido las publicaciones de este usuario
        // Primero obtener IDs de sus publicaciones
        const misPublicaciones = await Publicacion.findAll({
            where: { id_usuario },
            attributes: ['id_publicacion']
        });
        const misIds = misPublicaciones.map(p => p.id_publicacion);
        
        let totalFavsRecibidos = 0;
        if (misIds.length > 0) {
            totalFavsRecibidos = await Favorito.count({
                where: { id_publicacion: misIds }
            });
        }

        // 3. Ventas completadas (publicaciones suyas que pasaron a 'vendida')
        const totalVentas = await Publicacion.count({
            where: { id_usuario, estado_pub: 'vendida' }
        });

        // 4. Mis Favoritos Guardados (Lo que le gustó a él)
        const misFavoritos = await Favorito.count({
            where: { id_usuario }
        });

        // 5. Total gastado en la plataforma (Pagos)
        const pagos = await Pago.findAll({
            where: { id_usuario, estado: 'completado' }
        });
        const totalGastado = pagos.reduce((sum, pago) => sum + Number(pago.monto), 0);

        res.json({
            publicacionesActivas: totalPublicaciones,
            favoritosRecibidos: totalFavsRecibidos,
            ventasCompletadas: totalVentas,
            misFavoritosGuardados: misFavoritos,
            gastoTotal: totalGastado
        });
        
    } catch (error) {
        console.error('Error calculando estadísticas:', error);
        res.status(500).json({ error: 'Fallo al calcular métricas de usuario' });
    }
};

module.exports = {
    obtenerEstadisticas
};
