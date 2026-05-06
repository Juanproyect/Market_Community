const db = require('../models');

async function syncChatTablesForce() {
    try {
        await db.sequelize.authenticate();
        console.log('Conectado a DB para sync forzado.');

        // Desactivar validación de FK temporalmente
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
        
        // Dropear y recrear
        await db.Chat.sync({ force: true });
        await db.Mensaje.sync({ force: true });
        
        // Reactivar
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
        
        console.log("Tablas 'chat' y 'mensaje' creadas a la fuerza con éxito.");
    } catch (e) {
        console.error('Error sincronizando tablas forzosamente:', e);
    } finally {
        process.exit();
    }
}

syncChatTablesForce();
