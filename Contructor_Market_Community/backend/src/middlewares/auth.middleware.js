const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    // Leer el token del header (formato: "Bearer <token>")
    const headerAuth = req.headers['authorization'];
    
    if (!headerAuth) {
        return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token.' });
    }

    const partes = headerAuth.split(' ');
    if (partes.length !== 2 || partes[0] !== 'Bearer') {
        return res.status(401).json({ error: 'Formato de token inválido. Usa "Bearer <token>"' });
    }

    const token = partes[1];

    try {
        // Verificar firma y expiración
        const decodificado = jwt.verify(token, process.env.JWT_SECRET);
        
        // Adjuntar datos del token a req para usarlo en el controlador
        req.usuario = decodificado;
        
        // Continuar al siguiente middleware/controlador
        next();
    } catch (error) {
        console.error('Error validando token:', error.message);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'El token ha expirado. Inicia sesión nuevamente.' });
        }
        res.status(401).json({ error: 'Token inválido.' });
    }
};

const verificarRol = (rolesPermitidos) => {
    return (req, res, next) => {
        // Asume que verificarToken se ejecutó antes
        if (!req.usuario) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }

        if (!rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({ error: 'No tienes permiso para realizar esta acción' });
        }

        next();
    };
};

module.exports = {
    verificarToken,
    verificarRol
};
