const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Soporte = sequelize.define('Soporte', {
    id_soporte: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    tipo_problema: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    estado: {
        type: DataTypes.ENUM('abierto', 'en_proceso', 'resuelto', 'cerrado'),
        defaultValue: 'abierto'
    },
    fecha_creacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'soporte', // Ajustado al nombre de tabla en la imagen
    timestamps: false
});

module.exports = Soporte;
