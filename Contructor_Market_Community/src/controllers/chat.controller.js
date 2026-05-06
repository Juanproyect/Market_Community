const { Chat, Mensaje, Usuario } = require('../models');
const { Op } = require('sequelize');

// 1. Obtener todos los chats del usuario actual
const obtenerMisChats = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;

        const chats = await Chat.findAll({
            where: {
                [Op.or]: [
                    { id_usuario_emisor: id_usuario },
                    { id_usuario_receptor: id_usuario }
                ]
            },
            include: [
                { model: Usuario, as: 'emisor', attributes: ['id_usuario', 'nombre', 'correo', 'ultimo_acceso'] },
                { model: Usuario, as: 'receptor', attributes: ['id_usuario', 'nombre', 'correo', 'ultimo_acceso'] }
            ],
            order: [['fecha_inicio', 'DESC']]
        });

        // Formatear la respuesta para saber con quién es el chat
        const ahora = new Date();
        const resultado = chats.map(chat => {
            const elOtroUsuario = chat.id_usuario_emisor === id_usuario ? chat.receptor : chat.emisor;
            
            // Si accedió en los últimos 2 minutos, está en línea
            let en_linea = false;
            if (elOtroUsuario.ultimo_acceso) {
                const diffMinutos = (ahora - new Date(elOtroUsuario.ultimo_acceso)) / 1000 / 60;
                en_linea = diffMinutos <= 2;
            }

            return {
                id_chat: chat.id_chat,
                fecha_inicio: chat.fecha_inicio,
                contacto: {
                    id_usuario: elOtroUsuario.id_usuario,
                    nombre: elOtroUsuario.nombre,
                    en_linea: en_linea,
                    ultimo_acceso: elOtroUsuario.ultimo_acceso
                }
            };
        });

        res.json(resultado);
    } catch (error) {
        console.error('Error obteniendo chats:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// 2. Iniciar un chat nuevo o devolver el existente
const iniciarChat = async (req, res) => {
    try {
        const id_usuario_emisor = req.usuario.id_usuario;
        const { id_usuario_receptor } = req.body;

        if (!id_usuario_receptor) {
            return res.status(400).json({ error: 'Falta especificar el destinatario' });
        }

        if (id_usuario_emisor === id_usuario_receptor) {
            return res.status(400).json({ error: 'No puedes iniciar un chat contigo mismo' });
        }

        // Buscar si ya existe un chat entre ambos (sin importar quién lo inició)
        let chat = await Chat.findOne({
            where: {
                [Op.or]: [
                    { id_usuario_emisor, id_usuario_receptor },
                    { id_usuario_emisor: id_usuario_receptor, id_usuario_receptor: id_usuario_emisor }
                ]
            }
        });

        // Si no existe, crearlo
        if (!chat) {
            chat = await Chat.create({
                id_usuario_emisor,
                id_usuario_receptor
            });
            return res.status(201).json({ mensaje: 'Chat creado', chat });
        }

        res.json({ mensaje: 'Chat recuperado', chat });

    } catch (error) {
        console.error('Error iniciando chat:', error);
        res.status(500).json({ error: 'Fallo al procesar el chat' });
    }
};

// 3. Obtener mensajes de un chat
const obtenerMensajes = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;
        const { id_chat } = req.params;

        const chat = await Chat.findByPk(id_chat);
        if (!chat) return res.status(404).json({ error: 'Chat no encontrado' });

        // Validar que el usuario sea parte del chat
        if (chat.id_usuario_emisor !== id_usuario && chat.id_usuario_receptor !== id_usuario) {
            return res.status(403).json({ error: 'Acceso denegado a este chat' });
        }

        const mensajes = await Mensaje.findAll({
            where: { id_chat },
            order: [['fecha_envio', 'ASC']],
            include: [{ model: Usuario, as: 'autor', attributes: ['nombre'] }]
        });

        res.json(mensajes);
    } catch (error) {
        res.status(500).json({ error: 'Error cargando mensajes' });
    }
};

// 4. Enviar un mensaje
const enviarMensaje = async (req, res) => {
    try {
        const id_emisor = req.usuario.id_usuario;
        const { id_chat } = req.params;
        const { texto } = req.body;

        if (!texto) return res.status(400).json({ error: 'El mensaje no puede estar vacío' });

        const chat = await Chat.findByPk(id_chat);
        if (!chat) return res.status(404).json({ error: 'Chat no encontrado' });

        // Validar membresía
        if (chat.id_usuario_emisor !== id_emisor && chat.id_usuario_receptor !== id_emisor) {
            return res.status(403).json({ error: 'Acceso denegado' });
        }

        const nuevoMensaje = await Mensaje.create({
            id_chat,
            id_emisor,
            mensaje: texto
        });

        res.status(201).json({
            mensaje: 'Mensaje enviado',
            data: nuevoMensaje
        });

    } catch (error) {
        console.error('Error enviando mensaje:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = {
    obtenerMisChats,
    iniciarChat,
    obtenerMensajes,
    enviarMensaje
};
