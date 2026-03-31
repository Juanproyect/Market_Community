const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ReporteUsuario = sequelize.define('ReporteUsuario', {
    id_reporte: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_usuario_reportado: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_usuario_reportante: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    motivo: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    estado: {
        type: DataTypes.ENUM('pendiente', 'revisado', 'resuelto'),
        defaultValue: 'pendiente'
    },
    fecha_reporte: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'reporte_usuario',
    timestamps: false
});

module.exports = ReporteUsuario;
