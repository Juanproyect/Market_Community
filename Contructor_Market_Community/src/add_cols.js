require('dotenv').config();
const { sequelize } = require('./config/database');

async function runSQL() {
    try {
        console.log('Aplicando migraciones manuales a la tabla usuario...');
        
        await sequelize.query('ALTER TABLE usuario ADD COLUMN token_recuperacion VARCHAR(100) DEFAULT NULL;');
        console.log('✅ Columna token_recuperacion añadida');
    } catch (e) {
        if(e.message.includes('Duplicate column name')) console.log('token_recuperacion ya existe');
        else console.log(e.message);
    }

    try {
        await sequelize.query('ALTER TABLE usuario ADD COLUMN token_expiracion DATETIME DEFAULT NULL;');
        console.log('✅ Columna token_expiracion añadida');
    } catch (e) {
        if(e.message.includes('Duplicate column name')) console.log('token_expiracion ya existe');
        else console.log(e.message);
    }
    
    try {
        await sequelize.query('ALTER TABLE usuario ADD COLUMN correo_recuperacion VARCHAR(100) DEFAULT NULL;');
        await sequelize.query('ALTER TABLE usuario ADD UNIQUE (correo_recuperacion);');
        console.log('✅ Columna correo_recuperacion añadida');
    } catch (e) {
        if(e.message.includes('Duplicate column name') || e.message.includes('Duplicate key')) console.log('correo_recuperacion ya existe');
        else console.log(e.message);
    }

    process.exit(0);
}

runSQL();
