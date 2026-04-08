const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Pago = sequelize.define('Pago', {
    id_pago: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_publicacion: { // Faltaba en tu screenshot original pero es lógico o referenciarlo por el carrito
        type: DataTypes.INTEGER,
        allowNull: true 
    },
    fecha_pago: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    monto: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    metodo_pago: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    estado: {
        type: DataTypes.ENUM('pendiente', 'completado', 'fallido', 'reembolsado'),
        defaultValue: 'pendiente'
    }
}, {
    tableName: 'pago',
    timestamps: false
});

module.exports = Pago;
