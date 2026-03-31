const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Publicacion = sequelize.define('Publicacion', {
    id_publicacion: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    titulo: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    estado_prenda: {
        type: DataTypes.ENUM('como_nuevo', 'muy_bueno', 'bueno', 'regular'),
        defaultValue: 'bueno'
    },
    tipo: {
        type: DataTypes.ENUM('compraventa', 'donacion'),
        defaultValue: 'compraventa'
    },
    precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true // Puede ser nulo si es donación
    },
    fecha_publicacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_categoria: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'publicacion',
    timestamps: false
});

module.exports = Publicacion;
