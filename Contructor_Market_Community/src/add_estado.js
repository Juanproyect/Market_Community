require('dotenv').config();
const { sequelize } = require('./config/database');

async function runSQL() {
    try {
        console.log('Aplicando migración manual a la tabla publicacion...');
        await sequelize.query("ALTER TABLE publicacion ADD COLUMN estado_pub ENUM('activa', 'vendida', 'eliminada') DEFAULT 'activa';");
        console.log('✅ Columna estado_pub añadida con éxito - Los productos ya aparecerán.');
    } catch (e) {
        if(e.message.includes('Duplicate column name')) {
            console.log('✅ La columna estado_pub ya existía.');
        } else {
            console.error('Error al migrar:', e.message);
        }
    }
    process.exit(0);
}

runSQL();
