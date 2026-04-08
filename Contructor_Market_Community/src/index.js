require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { testConnection } = require('./config/database');

// Inicializar la app de Express
const app = express();

// Middlewares globales
app.use(cors()); // Permitir peticiones desde el frontend
app.use(express.json()); // Parsear JSON en el body de las requests
app.use(express.urlencoded({ extended: true })); // Parsear URL-encoded datos

// Rutas
const authRoutes = require('./routes/auth.routes');
const publicacionRoutes = require('./routes/publicacion.routes');

// Carpeta estática para imágenes (Multer las guardará aquí)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../public')));

// Ruta base
app.get('/', (req, res) => {
    res.json({
        mensaje: 'Bienvenido a la API de Market Community',
        version: '1.0.0'
    });
});

// Montar el router de autenticación
app.use('/api/auth', authRoutes);

// Montar el router de publicaciones (catálogo y gestión de productos)
app.use('/api/publicaciones', publicacionRoutes);

// Importar rutas de Fases 5 y 6
const favoritosRoutes = require('./routes/favorito.routes');
const carritoRoutes = require('./routes/carrito.routes');
const estadisticasRoutes = require('./routes/estadistica.routes');
const chatRoutes = require('./routes/chat.routes');
const soporteRoutes = require('./routes/soporte.routes');

// Montar rutas de Fases 5 y 6
app.use('/api/favoritos', favoritosRoutes);
app.use('/api/carrito', carritoRoutes);
app.use('/api/estadisticas', estadisticasRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/soporte', soporteRoutes);

// Manejo de errores genérico (middleware de error 404)
app.use((req, res, next) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Probar conexión a BD e iniciar servidor
const PORT = process.env.PORT || 3000;

const startServer = async () => {
    await testConnection();
    
    // Iniciando la aplicación sin sequelize.sync para evitar conflictos con claves foráneas manuales en la DB.
    
    app.listen(PORT, () => {
        console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
    });
};

if (require.main === module) {
    startServer();
}

module.exports = app;
