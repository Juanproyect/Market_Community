require('dotenv').config();
const { sequelize } = require('./config/database');

async function createTable() {
    try {
        console.log('Creando tabla favorito...');
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS favorito (
                id_favorito INT AUTO_INCREMENT PRIMARY KEY,
                id_usuario INT NOT NULL,
                id_publicacion INT NOT NULL,
                fecha_guardado DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_fav (id_usuario, id_publicacion),
                CONSTRAINT fk_fav_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
                CONSTRAINT fk_fav_publicacion FOREIGN KEY (id_publicacion) REFERENCES publicacion(id_publicacion) ON DELETE CASCADE
            ) ENGINE=InnoDB;
        `);
        console.log('✅ Tabla favorito creada exitosamente');
    } catch (e) {
        console.error('❌ Error creando tabla:', e.message);
    }
    process.exit(0);
}

createTable();
