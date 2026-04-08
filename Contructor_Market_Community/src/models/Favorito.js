const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Favorito = sequelize.define('Favorito', {
    id_favorito: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fecha_guardado: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_publicacion: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'favorito',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['id_usuario', 'id_publicacion'] // Para evitar que un usuario de like a la misma pub > 1 vez
        }
    ]
});

module.exports = Favorito;
