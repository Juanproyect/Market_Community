require('dotenv').config();
const { sequelize } = require('./config/database');

async function runSQL() {
    try {
        console.log('Aplicando migración manual a la tabla imagen...');
        await sequelize.query("ALTER TABLE imagen ADD COLUMN orden INT DEFAULT 1;");
        console.log('✅ Columna orden añadida a imagen exitosamente.');
    } catch (e) {
        if(e.message.includes('Duplicate column name')) {
            console.log('✅ La columna orden ya existía.');
        } else {
            console.error('Error al migrar:', e.message);
        }
    }
    process.exit(0);
}

runSQL();
