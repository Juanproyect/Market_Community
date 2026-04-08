const { Sequelize } = require('sequelize');
require('dotenv').config();

const isTest = process.env.NODE_ENV === 'test';

const sequelize = new Sequelize(
    isTest ? ':memory:' : process.env.DB_NAME,
    isTest ? null : process.env.DB_USER,
    isTest ? null : process.env.DB_PASS,
    {
        host: isTest ? null : process.env.DB_HOST,
        port: isTest ? null : (process.env.DB_PORT || 3306),
        dialect: isTest ? 'sqlite' : 'mysql',
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
