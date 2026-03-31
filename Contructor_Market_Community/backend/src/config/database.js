const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false, // Set to console.log to see SQL queries
        define: {
            timestamps: false, // We'll manage them manually based on the script or let models define it
            freezeTableName: true, // Prevent pluralization of table names
        },
    }
);

// Función para probar la conexión
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión exitosa a la base de datos MySQL.');
    } catch (error) {
        console.error('❌ Error conectando a la base de datos:', error.message);
    }
};

module.exports = { sequelize, testConnection };
