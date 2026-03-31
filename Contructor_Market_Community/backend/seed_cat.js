const { Categoria } = require('./src/models');
const { testConnection } = require('./src/config/database');

async function checkCategories() {
    try {
        await testConnection();
        const categorias = await Categoria.findAll();
        console.log('Categories count:', categorias.length);
        if (categorias.length === 0) {
            console.log('Creating default categories...');
            await Categoria.bulkCreate([
                { nombre: 'camisetas' },
                { nombre: 'pantalones' },
                { nombre: 'vestidos' },
                { nombre: 'chaquetas' },
                { nombre: 'calzado' },
                { nombre: 'accesorios' }
            ]);
            console.log('Categories seeded successfully!');
        }
    } catch (error) {
        console.error('Error:', error);
    } process.exit(0);
}

checkCategories();
