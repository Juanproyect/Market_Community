const mysql2 = require('mysql2/promise');
require('dotenv').config();

async function createChatTables() {
    // Leer credenciales del .env
    const conn = await mysql2.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'ropa_donacion',
        port: process.env.DB_PORT || 3306
    });

    console.log('Conectado directamente a MySQL.');

    try {
        // Desactivar FKs
        await conn.query('SET FOREIGN_KEY_CHECKS = 0');

        // Limpiar tablas si existen parcialmente
        await conn.query('DROP TABLE IF EXISTS `mensaje`');
        await conn.query('DROP TABLE IF EXISTS `chat`');
        
        // Limpiar constraints huérfanos que MySQL pudo haber guardado
        // (causante del errno 121)
        await conn.query(`
            CREATE TABLE \`chat\` (
                \`id_chat\` int(11) NOT NULL AUTO_INCREMENT,
                \`id_usuario_emisor\` int(11) NOT NULL,
                \`id_usuario_receptor\` int(11) NOT NULL,
                \`fecha_inicio\` datetime DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (\`id_chat\`),
                KEY \`fk_chat_emisor\` (\`id_usuario_emisor\`),
                KEY \`fk_chat_receptor\` (\`id_usuario_receptor\`),
                CONSTRAINT \`fk_chat_emisor\` FOREIGN KEY (\`id_usuario_emisor\`) REFERENCES \`usuario\` (\`id_usuario\`),
                CONSTRAINT \`fk_chat_receptor\` FOREIGN KEY (\`id_usuario_receptor\`) REFERENCES \`usuario\` (\`id_usuario\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `);
        console.log('✅ Tabla chat creada.');

        await conn.query(`
            CREATE TABLE \`mensaje\` (
                \`id_mensaje\` int(11) NOT NULL AUTO_INCREMENT,
                \`id_chat\` int(11) NOT NULL,
                \`id_emisor\` int(11) NOT NULL,
                \`mensaje\` text NOT NULL,
                \`fecha_envio\` datetime DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (\`id_mensaje\`),
                KEY \`fk_mensaje_chat\` (\`id_chat\`),
                KEY \`fk_mensaje_emisor\` (\`id_emisor\`),
                CONSTRAINT \`fk_mensaje_chat\` FOREIGN KEY (\`id_chat\`) REFERENCES \`chat\` (\`id_chat\`),
                CONSTRAINT \`fk_mensaje_emisor\` FOREIGN KEY (\`id_emisor\`) REFERENCES \`usuario\` (\`id_usuario\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `);
        console.log('✅ Tabla mensaje creada.');

    } finally {
        await conn.query('SET FOREIGN_KEY_CHECKS = 1');
        await conn.end();
        console.log('✅ Proceso completado exitosamente.');
    }
}

createChatTables().catch(e => {
    console.error('❌ Error:', e.sqlMessage || e.message);
    process.exit(1);
});
