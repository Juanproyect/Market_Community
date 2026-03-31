const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Usuario = sequelize.define('Usuario', {
    id_usuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    correo: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    contraseña: { // Using the exact column name from diagram
        type: DataTypes.STRING(100),
        allowNull: false
    },
    rol: {
        type: DataTypes.ENUM('administrador', 'vendedor', 'comprador'),
        allowNull: false,
        defaultValue: 'comprador'
    },
    fecha_registro: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    estado_cuenta: {
        type: DataTypes.ENUM('activo', 'suspendido', 'bloqueado'),
        defaultValue: 'activo'
    }
}, {
    tableName: 'usuario',
    timestamps: false
});

module.exports = Usuario;
