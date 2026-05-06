const db = require('../models');

async function syncChatTables() {
    try {
        // Autenticar
        await db.sequelize.authenticate();
        console.log('Conectado a DB para sync.');

        // Sincronizar solo Chat y Mensaje
        await db.Chat.sync({ alter: true });
        await db.Mensaje.sync({ alter: true });
        
        console.log("Tablas 'chat' y 'mensaje' sincronizadas/creadas con éxito.");
    } catch (e) {
        console.error('Error sincronizando tablas:', e);
    } finally {
        process.exit();
    }
}

syncChatTables();
