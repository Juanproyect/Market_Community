const { Soporte, Usuario } = require('../models');

// Crear un nuevo ticket de soporte
const crearTicket = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;
        const { tipo_problema, descripcion } = req.body;

        if (!tipo_problema || !descripcion) {
            return res.status(400).json({ error: 'El tipo de problema y descripción son obligatorios' });
        }

        const nuevoTicket = await Soporte.create({
            id_usuario,
            tipo_problema,
            descripcion
        });

        res.status(201).json({
            mensaje: 'Ticket de soporte creado correctamente',
            ticket: nuevoTicket
        });
    } catch (error) {
        console.error('Error creando ticket:', error);
        res.status(500).json({ error: 'Error del servidor al procesar el ticket' });
    }
};

// Obtener los tickets del usuario
const obtenerMisTickets = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;

        const tickets = await Soporte.findAll({
            where: { id_usuario },
            order: [['fecha_creacion', 'DESC']]
        });

        res.json(tickets);
    } catch (error) {
        console.error('Error obteniendo tickets:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

// (Solo Administración) Obtener todos los tickets a nivel global
const obtenerTodosLosTickets = async (req, res) => {
    try {
        // middleware de rol ya verificó si es admin
        const tickets = await Soporte.findAll({
            include: [{ model: Usuario, attributes: ['nombre', 'correo'] }],
            order: [['estado', 'ASC'], ['fecha_creacion', 'DESC']]
        });

        res.json(tickets);
    } catch (error) {
        console.error('Error admin listando tickets:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

// (Solo Administración) Actualizar estado de ticket
const actualizarEstadoTicket = async (req, res) => {
    try {
        const { id_soporte } = req.params;
        const { estado } = req.body;

        const ticket = await Soporte.findByPk(id_soporte);
        if (!ticket) return res.status(404).json({ error: 'Ticket no encontrado' });

        ticket.estado = estado;
        await ticket.save();

        res.json({ mensaje: 'Estado del ticket actualizado', ticket });
    } catch (error) {
         res.status(500).json({ error: 'Error del servidor' });
    }
}

module.exports = {
    crearTicket,
    obtenerMisTickets,
    obtenerTodosLosTickets,
    actualizarEstadoTicket
};
