const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
const { sendMail } = require('../utils/mailer');

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
        const { nombre, correo, correo_recuperacion, contraseña } = req.body;

        // Validaciones básicas 
        if (!nombre || !correo || !correo_recuperacion || !contraseña) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        if (correo === correo_recuperacion) {
            return res.status(400).json({ error: 'El correo de respaldo no puede ser el mismo que el principal.' });
        }

        // Verificar si el correo ya existe
        const usuarioExistente = await Usuario.findOne({ where: { correo } });
        if (usuarioExistente) {
            return res.status(400).json({ error: 'El correo ya está registrado' });
        }

        // Verificar si el correo de recuperación ya está en uso por alguien más
        const respaldoExistente = await Usuario.findOne({ where: { correo_recuperacion } });
        if (respaldoExistente) {
            return res.status(400).json({ error: 'El correo de respaldo ya está en uso' });
        }

        // Encriptar la contraseña 
        const salt = await bcrypt.genSalt(10);
        const contraseñaHash = await bcrypt.hash(contraseña, salt);

        // Crear el usuario
        const nuevoUsuario = await Usuario.create({
            nombre,
            correo,
            correo_recuperacion,
            contraseña: contraseñaHash,
            rol: 'comprador', 
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

// Solicitar recuperación de contraseña (AHORA USA CORREO_RECUPERACION)
const solicitarRecuperacion = async (req, res) => {
    try {
        const { correo_recuperacion } = req.body;
        if (!correo_recuperacion) return res.status(400).json({ error: 'El correo de respaldo es obligatorio' });

        const usuario = await Usuario.findOne({ where: { correo_recuperacion } });
        if (!usuario) {
            return res.status(200).json({ mensaje: 'Si el correo de respaldo existe, recibirás un código de recuperación.' });
        }

        // Generar token de 6 dígitos aleatorio
        const token = Math.floor(100000 + Math.random() * 900000).toString();
        const expiracion = new Date(Date.now() + 15 * 60000); // 15 minutos

        usuario.token_recuperacion = token;
        usuario.token_expiracion = expiracion;
        await usuario.save();

        // Enviar Correo Real
        const htmlBody = `
            <h2>Recuperación de Contraseña - Market Community</h2>
            <p>Hola ${usuario.nombre},</p>
            <p>Se ha solicitado un restablecimiento de contraseña usando tu correo de respaldo.</p>
            <p>Tu código de seguridad es: <strong>${token}</strong></p>
            <p>Este código expira en 15 minutos. Si no fuiste tú, ignora este mensaje.</p>
        `;
        
        await sendMail(correo_recuperacion, 'Código de Recuperación de Contraseña (Respaldo)', htmlBody);

        res.json({ mensaje: 'Si el correo de respaldo existe, recibirás un código de recuperación.' });
    } catch (error) {
        console.error('Error en solicitarRecuperacion:', error);
        res.status(500).json({ error: 'Fallo al procesar la solicitud de recuperación' });
    }
};

// Solicitar recordatorio de usuario / correo principal (mediante correo de respaldo)
const solicitarRecordatorioUsuario = async (req, res) => {
    try {
        const { correo_recuperacion } = req.body;
        if (!correo_recuperacion) return res.status(400).json({ error: 'El correo externo/respaldo es obligatorio' });

        // Buscamos si hay algún usuario con este correo configurado como respaldo
        const usuario = await Usuario.findOne({ where: { correo_recuperacion } });
        
        if (!usuario) {
            return res.status(200).json({ mensaje: 'Si el correo está afiliado como respaldo, le enviaremos un código.' });
        }

        const token = Math.floor(100000 + Math.random() * 900000).toString();
        usuario.token_recuperacion = token;
        usuario.token_expiracion = new Date(Date.now() + 15 * 60000); // 15 mins
        await usuario.save();

        const htmlBody = `
            <h2>Recuperación de Usuario - Market Community</h2>
            <p>Hola,</p>
            <p>Se ha solicitado recordar qué cuenta está asociada a este correo de respaldo.</p>
            <p>Tu código de seguridad es: <strong>${token}</strong></p>
            <p>Úsalo en la plataforma para ver tu información de acceso.</p>
        `;

        await sendMail(correo_recuperacion, 'Código para Recordar Usuario', htmlBody);
        
        res.json({ mensaje: 'Si el correo está afiliado como respaldo, le enviaremos un código.' });
    } catch (error) {
        console.error('Error en solicitarRecordatorioUsuario:', error);
        res.status(500).json({ error: 'Error al solicitar recordatorio de usuario.' });
    }
};

// Validar token de recordatorio de usuario
const validarTokenUsuario = async (req, res) => {
    try {
        const { correo_recuperacion, token } = req.body;
        if (!correo_recuperacion || !token) return res.status(400).json({ error: 'Faltan datos' });

        const usuario = await Usuario.findOne({ where: { correo_recuperacion, token_recuperacion: token } });

        if (!usuario) {
            return res.status(400).json({ error: 'Código inválido.' });
        }
        if (new Date() > usuario.token_expiracion) {
            return res.status(400).json({ error: 'El código ha expirado.' });
        }

        // Limpiar token
        usuario.token_recuperacion = null;
        usuario.token_expiracion = null;
        await usuario.save();

        res.json({ 
            mensaje: 'Identidad verificada exitosamente', 
            usuario_recuperado: {
                nombre: usuario.nombre,
                correo_principal: usuario.correo
            }
        });

    } catch (error) {
        console.error('Error en validarTokenUsuario:', error);
        res.status(500).json({ error: 'Error al validar el código' });
    }
};

// Restablecer la contraseña usando el token (AHORA BASADO EN CORREO_RECUPERACION)
const restablecerPassword = async (req, res) => {
    try {
        const { correo_recuperacion, token, nuevaContraseña } = req.body;

        if (!correo_recuperacion || !token || !nuevaContraseña) {
            return res.status(400).json({ error: 'Correo de respaldo, token y nueva contraseña son obligatorios' });
        }

        const usuario = await Usuario.findOne({ 
            where: { 
                correo_recuperacion, 
                token_recuperacion: token 
            } 
        });

        if (!usuario) {
            return res.status(400).json({ error: 'Token o correo inválidos' });
        }

        // Verificar expiración
        if (new Date() > usuario.token_expiracion) {
            return res.status(400).json({ error: 'El token ha expirado, solicita uno nuevo' });
        }

        // Encriptar nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const contraseñaHash = await bcrypt.hash(nuevaContraseña, salt);

        // Actualizar usuario y limpiar campos de token
        usuario.contraseña = contraseñaHash;
        usuario.token_recuperacion = null;
        usuario.token_expiracion = null;
        await usuario.save();

        res.json({ mensaje: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.' });

    } catch (error) {
        console.error('Error en restablecerPassword:', error);
        res.status(500).json({ error: 'Error del servidor al restablecer contraseña' });
    }
};

module.exports = { 
    registrar, 
    login, 
    perfil, 
    solicitarRecuperacion, 
    restablecerPassword,
    solicitarRecordatorioUsuario,
    validarTokenUsuario
};
