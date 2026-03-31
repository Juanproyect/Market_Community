const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

// Función auxiliar para generar token
const generarToken = (id_usuario, rol) => {
    return jwt.sign(
        { id_usuario, rol },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// Registro de usuario nuevo
const registrar = async (req, res) => {
    try {
        const { nombre, correo, contraseña } = req.body;

        // Validaciones básicas (pueden ampliarse con express-validator)
        if (!nombre || !correo || !contraseña) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        // Verificar si el correo ya existe
        const usuarioExistente = await Usuario.findOne({ where: { correo } });
        if (usuarioExistente) {
            return res.status(400).json({ error: 'El correo ya está registrado' });
        }

        // Encriptar la contraseña (salt de 10 rondas)
        const salt = await bcrypt.genSalt(10);
        const contraseñaHash = await bcrypt.hash(contraseña, salt);

        // Crear el usuario
        const nuevoUsuario = await Usuario.create({
            nombre,
            correo,
            contraseña: contraseñaHash,
            rol: 'comprador', // Por defecto todos inician como comprador
            estado_cuenta: 'activo'
        });

        // Ocultar la contraseña antes de responder
        const usuarioResponse = nuevoUsuario.toJSON();
        delete usuarioResponse.contraseña;

        res.status(201).json({
            mensaje: 'Usuario creado exitosamente',
            usuario: usuarioResponse
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error interno del servidor al registrar' });
    }
};

// Iniciar sesión
const login = async (req, res) => {
    try {
        const { correo, contraseña } = req.body;

        if (!correo || !contraseña) {
            return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
        }

        // Buscar al usuario
        const usuario = await Usuario.findOne({ where: { correo } });
        if (!usuario) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Verificar si está bloqueado/suspendido
        if (usuario.estado_cuenta !== 'activo') {
            return res.status(403).json({ error: 'La cuenta no está activa' });
        }

        // Validar contraseña
        const passValida = await bcrypt.compare(contraseña, usuario.contraseña);
        if (!passValida) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Generar JWT
        const token = generarToken(usuario.id_usuario, usuario.rol);

        // Ocultar contraseña
        const usuarioResponse = usuario.toJSON();
        delete usuarioResponse.contraseña;

        res.json({
            mensaje: 'Inicio de sesión exitoso',
            token,
            usuario: usuarioResponse
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor en login' });
    }
};

// Obtener datos del usuario autenticado (requiere token)
const perfil = async (req, res) => {
    try {
        // req.usuario.id_usuario viene del middleware de auth
        const usuario = await Usuario.findByPk(req.usuario.id_usuario, {
            attributes: { exclude: ['contraseña'] }
        });

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ usuario });
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = {
    registrar,
    login,
    perfil
};
