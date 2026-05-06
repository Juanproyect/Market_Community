const { sequelize } = require('../config/database');

async function agregarColumnaUltimoAcceso() {
    try {
        await sequelize.authenticate();
        console.log('Conexión a la base de datos establecida.');

        // Ejecutar query en crudo para agregar la columna si no existe
        await sequelize.query('ALTER TABLE usuario ADD COLUMN ultimo_acceso DATETIME DEFAULT NULL;');
        
        console.log('Columna "ultimo_acceso" agregada correctamente a la tabla "usuario".');
    } catch (error) {
        if (error.original && error.original.code === 'ER_DUP_FIELDNAME') {
            console.log('La columna "ultimo_acceso" ya existe en la tabla "usuario".');
        } else {
            console.error('Error al agregar la columna:', error);
        }
    } finally {
        process.exit();
    }
}

agregarColumnaUltimoAcceso();
