const { Carrito, DetalleCarrito, Publicacion, Imagen, Pago } = require('../models');

// Función auxiliar para obtener o crear el carrito activo
const getOrCreateCarrito = async (id_usuario) => {
    let carrito = await Carrito.findOne({ where: { id_usuario } });
    if (!carrito) {
        carrito = await Carrito.create({ id_usuario });
    }
    return carrito;
};

// 1. Obtener contenido del carrito
const obtenerCarrito = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;
        const carrito = await getOrCreateCarrito(id_usuario);

        const detalles = await DetalleCarrito.findAll({
            where: { id_carrito: carrito.id_carrito },
            include: [
                {
                    model: Publicacion,
                    as: 'producto',
                    include: [{ model: Imagen, as: 'imagenes', attributes: ['ruta_imagen'] }]
                }
            ]
        });

        // Calcular costo total
        let totalValores = 0;
        detalles.forEach(d => {
            // Solo sumamos si es compraventa y sigue activa
            if (d.producto && d.producto.tipo === 'compraventa' && d.producto.estado_pub === 'activa') {
                totalValores += Number(d.producto.precio || 0);
            }
        });

        res.json({
            id_carrito: carrito.id_carrito,
            detalles,
            total: totalValores
        });
    } catch (error) {
        console.error('Error al obtener carrito:', error);
        res.status(500).json({ error: 'Error del servidor al obtener el carrito' });
    }
};

// 2. Agregar al carrito
const agregarAlCarrito = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;
        const { id_publicacion } = req.body;

        const publicacion = await Publicacion.findByPk(id_publicacion);
        if (!publicacion) {
            return res.status(404).json({ error: 'Publicación no encontrada' });
        }

        if (publicacion.estado_pub !== 'activa') {
            return res.status(400).json({ error: `La publicación no está disponible (Estado: ${publicacion.estado_pub})` });
        }

        if (publicacion.id_usuario === id_usuario) {
            return res.status(400).json({ error: 'No puedes comprar tu propia publicación' });
        }

        const carrito = await getOrCreateCarrito(id_usuario);

        // Verificar si ya está en el carrito
        const existe = await DetalleCarrito.findOne({
            where: { id_carrito: carrito.id_carrito, id_publicacion }
        });

        if (existe) {
            return res.status(400).json({ error: 'El artículo ya se encuentra en tu carrito' });
        }

        await DetalleCarrito.create({
            id_carrito: carrito.id_carrito,
            id_publicacion,
            cantidad: 1 // Marketplace de Segunda Mano = Cantidad Única
        });

        res.status(201).json({ mensaje: 'Artículo añadido al carrito' });

    } catch (error) {
        console.error('Error al agregar al carrito:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

// 3. Remover del carrito
const removerDelCarrito = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;
        const { id_publicacion } = req.params;

        const carrito = await Carrito.findOne({ where: { id_usuario } });
        if (!carrito) return res.status(404).json({ error: 'Carrito no encontrado' });

        const eliminados = await DetalleCarrito.destroy({
            where: { id_carrito: carrito.id_carrito, id_publicacion }
        });

        if (eliminados > 0) {
            res.json({ mensaje: 'Artículo removido del carrito' });
        } else {
            res.status(404).json({ error: 'El artículo no estaba en tu carrito' });
        }

    } catch (error) {
        console.error('Error al remover:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

// 4. Procesar Pago (Checkout Simulado)
const checkout = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;
        const carrito = await Carrito.findOne({ where: { id_usuario } });
        
        if (!carrito) return res.status(400).json({ error: 'Tu carrito está vacío' });

        const detalles = await DetalleCarrito.findAll({
            where: { id_carrito: carrito.id_carrito },
            include: [{ model: Publicacion, as: 'producto' }]
        });

        if (detalles.length === 0) {
            return res.status(400).json({ error: 'Tu carrito está vacío' });
        }

        // 1. Verificación de stock (que ninguna se haya vendido ya)
        for (let d of detalles) {
            if (d.producto.estado_pub !== 'activa') {
                return res.status(409).json({ 
                    error: `El artículo "${d.producto.titulo}" ya no está disponible. Por favor, remuévelo para continuar.` 
                });
            }
        }

        // 2. Procesar (Simular Pago y cambiar estado de todas a 'vendida')
        let totalPagado = 0;
        for (let d of detalles) {
            d.producto.estado_pub = 'vendida';
            await d.producto.save();
            
            if (d.producto.tipo === 'compraventa') {
                totalPagado += Number(d.producto.precio || 0);
            }
        }

        // Registrar boleta de pago en base de datos
        const nuevoPago = await Pago.create({
            monto: totalPagado,
            metodo_pago: req.body.metodo_pago || 'saldo_plataforma',
            estado: 'completado',
            id_usuario
        });

        // 3. Vaciar el carrito
        await DetalleCarrito.destroy({ where: { id_carrito: carrito.id_carrito } });

        res.json({
            mensaje: '¡Compra procesada exitosamente!',
            pagado: totalPagado,
            numero_recibo: nuevoPago.id_pago
        });

    } catch (error) {
        console.error('Error en Checkout:', error);
        res.status(500).json({ error: 'Error procesando la transacción' });
    }
};

module.exports = {
    obtenerCarrito,
    agregarAlCarrito,
    removerDelCarrito,
    checkout
};
