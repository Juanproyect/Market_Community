const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DetalleCarrito = sequelize.define('DetalleCarrito', {
    id_detalle: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_carrito: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_publicacion: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    cantidad: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    }
}, {
    tableName: 'detalle_carrito',
    timestamps: false
});

module.exports = DetalleCarrito;
