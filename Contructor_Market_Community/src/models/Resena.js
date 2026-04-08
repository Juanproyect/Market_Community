const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Resena = sequelize.define('Resena', {
    id_reseña: { // Usando la 'ñ' por precisión con tu BD
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_usuario_emisor: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_usuario_receptor: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    calificacion: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    comentario: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    fecha_reseña: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'reseña', // Nombre literal de la tabla en tu MySQL Workbench
    timestamps: false
});

module.exports = Resena;
