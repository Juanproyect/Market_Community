const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Imagen = sequelize.define('Imagen', {
    id_imagen: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ruta_imagen: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    id_publicacion: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'imagen',
    timestamps: false
});

module.exports = Imagen;
