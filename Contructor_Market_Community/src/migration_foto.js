require('dotenv').config();
const { sequelize } = require('./config/database');

async function runSQL() {
    try {
        console.log('Añadiendo columna foto_perfil a la tabla usuario...');
        await sequelize.query('ALTER TABLE usuario ADD COLUMN foto_perfil VARCHAR(255) DEFAULT NULL;');
        console.log('✅ Columna foto_perfil añadida exitosamente');
    } catch (e) {
        if(e.message.includes('Duplicate column name')) {
            console.log('⚠️ La columna foto_perfil ya existe.');
        } else {
            console.error('❌ Error:', e.message);
        }
    }
    
    try {
        console.log('Verificando columna ultimo_acceso...');
        await sequelize.query('ALTER TABLE usuario ADD COLUMN ultimo_acceso DATETIME DEFAULT NULL;');
        console.log('✅ Columna ultimo_acceso añadida');
    } catch (e) {
        if(e.message.includes('Duplicate column name')) {
            console.log('ultimo_acceso ya existe');
        } else {
            console.log(e.message);
        }
    }

    process.exit(0);
}

runSQL();
