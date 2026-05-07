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
    correo_recuperacion: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true
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
    },
    token_recuperacion: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    token_expiracion: {
        type: DataTypes.DATE,
        allowNull: true
    },
    ultimo_acceso: {
        type: DataTypes.DATE,
        allowNull: true
    },
    foto_perfil: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
}, {
    tableName: 'usuario',
    timestamps: false
});

module.exports = Usuario;
