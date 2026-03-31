const { Categoria, sequelize } = require('./src/models');
const { testConnection } = require('./src/config/database');

async function fixCategories() {
    try {
        await testConnection();
        // Insert or update categories to match expected IDs
        const items = [
            { id_categoria: 1, nombre: 'Camisetas', descripcion: 'Todo tipo de remeras' },
            { id_categoria: 2, nombre: 'Pantalones', descripcion: 'Jeans, joggers' },
            { id_categoria: 3, nombre: 'Vestidos', descripcion: 'Ropa entera' },
            { id_categoria: 4, nombre: 'Chaquetas', descripcion: 'Abrigos y buzos' },
            { id_categoria: 5, nombre: 'Calzado', descripcion: 'Zapatos, tenis' },
            { id_categoria: 6, nombre: 'Accesorios', descripcion: 'Gorras, relojes, etc' }
        ];

        // Disable foreign key checks to overwrite
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
        
        for (let cat of items) {
            await Categoria.upsert(cat);
        }

        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
        
        console.log('✅ Categorías corregidas e insertadas con IDs del 1 al 6');

    } catch (error) {
        console.error('Error:', error);
    } 
    process.exit(0);
}

fixCategories();
