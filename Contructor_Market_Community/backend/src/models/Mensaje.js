const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Mensaje = sequelize.define('Mensaje', {
    id_mensaje: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_chat: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_emisor: { // Nota: en tu MySQL es id_emisor o id_chat
        type: DataTypes.INTEGER,
        allowNull: false
    },
    mensaje: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    fecha_envio: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    leido: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'mensaje',
    timestamps: false
});

module.exports = Mensaje;
