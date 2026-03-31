const { sequelize } = require('../config/database');

// Importar todos los modelos
const Usuario = require('./Usuario');
const Categoria = require('./Categoria');
const Publicacion = require('./Publicacion');
const Imagen = require('./Imagen');
const Carrito = require('./Carrito');
const DetalleCarrito = require('./DetalleCarrito');
const Pago = require('./Pago');
const Chat = require('./Chat');
const Mensaje = require('./Mensaje');
const Resena = require('./Resena');
const Soporte = require('./Soporte');
const ReporteUsuario = require('./ReporteUsuario');
const Favorito = require('./Favorito');

// ==========================================
// DEFINICIÓN DE ASOCIACIONES (RELACIONES)
// ==========================================

// --- Usuario <-> Publicacion (1 a N) ---
Usuario.hasMany(Publicacion, { foreignKey: 'id_usuario', as: 'publicaciones' });
Publicacion.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'vendedor' });

// --- Categoria <-> Publicacion (1 a N) ---
Categoria.hasMany(Publicacion, { foreignKey: 'id_categoria', as: 'publicaciones' });
Publicacion.belongsTo(Categoria, { foreignKey: 'id_categoria', as: 'categoria' });

// --- Publicacion <-> Imagen (1 a N) ---
Publicacion.hasMany(Imagen, { foreignKey: 'id_publicacion', as: 'imagenes' });
Imagen.belongsTo(Publicacion, { foreignKey: 'id_publicacion' });

// --- Usuario <-> Carrito (1 a 1 / N) ---
Usuario.hasMany(Carrito, { foreignKey: 'id_usuario' });
Carrito.belongsTo(Usuario, { foreignKey: 'id_usuario' });

// --- Carrito <-> DetalleCarrito <-> Publicacion ---
Carrito.hasMany(DetalleCarrito, { foreignKey: 'id_carrito', as: 'detalles' });
DetalleCarrito.belongsTo(Carrito, { foreignKey: 'id_carrito' });

Publicacion.hasMany(DetalleCarrito, { foreignKey: 'id_publicacion' });
DetalleCarrito.belongsTo(Publicacion, { foreignKey: 'id_publicacion', as: 'producto' });

// --- Usuario <-> Pago <-> Publicacion ---
Usuario.hasMany(Pago, { foreignKey: 'id_usuario', as: 'pagos' });
Pago.belongsTo(Usuario, { foreignKey: 'id_usuario' });

// Opcional: relación del pago con publicación si aplica
// Publicacion.hasMany(Pago, { foreignKey: 'id_publicacion' });
// Pago.belongsTo(Publicacion, { foreignKey: 'id_publicacion' });

// --- Chat y Mensajes ---
Usuario.hasMany(Chat, { foreignKey: 'id_usuario_emisor', as: 'chats_iniciados' });
Usuario.hasMany(Chat, { foreignKey: 'id_usuario_receptor', as: 'chats_recibidos' });
Chat.belongsTo(Usuario, { foreignKey: 'id_usuario_emisor', as: 'emisor' });
Chat.belongsTo(Usuario, { foreignKey: 'id_usuario_receptor', as: 'receptor' });

Chat.hasMany(Mensaje, { foreignKey: 'id_chat', as: 'mensajes' });
Mensaje.belongsTo(Chat, { foreignKey: 'id_chat' });

Usuario.hasMany(Mensaje, { foreignKey: 'id_emisor' });
Mensaje.belongsTo(Usuario, { foreignKey: 'id_emisor', as: 'autor' });

// --- Reseñas ---
Usuario.hasMany(Resena, { foreignKey: 'id_usuario_emisor', as: 'reseñas_dadas' });
Usuario.hasMany(Resena, { foreignKey: 'id_usuario_receptor', as: 'reseñas_recibidas' });
Resena.belongsTo(Usuario, { foreignKey: 'id_usuario_emisor', as: 'autor_resena' });
Resena.belongsTo(Usuario, { foreignKey: 'id_usuario_receptor', as: 'receptor_resena' });

// --- Soporte ---
Usuario.hasMany(Soporte, { foreignKey: 'id_usuario', as: 'tickets_soporte' });
Soporte.belongsTo(Usuario, { foreignKey: 'id_usuario' });

// --- Reportes ---
Usuario.hasMany(ReporteUsuario, { foreignKey: 'id_usuario_reportante', as: 'reportes_hechos' });
Usuario.hasMany(ReporteUsuario, { foreignKey: 'id_usuario_reportado', as: 'reportes_recibidos' });
ReporteUsuario.belongsTo(Usuario, { foreignKey: 'id_usuario_reportante', as: 'demandante' });
ReporteUsuario.belongsTo(Usuario, { foreignKey: 'id_usuario_reportado', as: 'acusado' });

// --- Favoritos ---
Usuario.hasMany(Favorito, { foreignKey: 'id_usuario', as: 'mis_favoritos' });
Favorito.belongsTo(Usuario, { foreignKey: 'id_usuario' });

Publicacion.hasMany(Favorito, { foreignKey: 'id_publicacion', as: 'favoritos_recibidos' });
Favorito.belongsTo(Publicacion, { foreignKey: 'id_publicacion', as: 'publicacion' });

// Exportar la instancia de sequelize y todos los modelos
module.exports = {
    sequelize,
    Usuario,
    Categoria,
    Publicacion,
    Imagen,
    Carrito,
    DetalleCarrito,
    Pago,
    Chat,
    Mensaje,
    Resena,
    Soporte,
    ReporteUsuario,
    Favorito
};
