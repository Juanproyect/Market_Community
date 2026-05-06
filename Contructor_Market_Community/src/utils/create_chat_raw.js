const { sequelize } = require('../config/database');

async function createChatTables() {
    try {
        await sequelize.authenticate();
        console.log('DB conectada');

        // Crear tabla chat
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS \`chat\` (
                \`id_chat\` int NOT NULL AUTO_INCREMENT,
                \`id_usuario_emisor\` int NOT NULL,
                \`id_usuario_receptor\` int NOT NULL,
                \`fecha_inicio\` datetime DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (\`id_chat\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        console.log('Tabla chat creada (sin FK estrictas)');

        // Crear tabla mensaje
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS \`mensaje\` (
                \`id_mensaje\` int NOT NULL AUTO_INCREMENT,
                \`id_chat\` int NOT NULL,
                \`id_emisor\` int NOT NULL,
                \`mensaje\` text NOT NULL,
                \`fecha_envio\` datetime DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (\`id_mensaje\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        console.log('Tabla mensaje creada (sin FK estrictas)');

    } catch (e) {
        console.error('Error:', e);
    } finally {
        process.exit();
    }
}

createChatTables();
