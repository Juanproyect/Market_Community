const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

// Crear la carpeta uploads si no existe para evitar Error 500 de Multer
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de almacenamiento local
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); 
    },
    filename: function (req, file, cb) {
        // Genera nombre único aleatorio para evitar colisiones
        const uniqueSuffix = crypto.randomBytes(16).toString('hex');
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    }
});

// Filtro para aceptar solo imágenes seguras
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Formato no soportado. Sólo JPG, PNG y WEBP permitidos.'), false);
    }
};

// Middleware de Multer configurado
const upload = multer({
    storage: storage,
    limits: {
        fileSize: (process.env.UPLOAD_MAX_SIZE_MB || 5) * 1024 * 1024 // 5MB limit default
    },
    fileFilter: fileFilter
});

module.exports = upload;
