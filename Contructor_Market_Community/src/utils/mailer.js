require('dotenv').config();
const nodemailer = require('nodemailer');

let transporterConfigured = null;

const createTransporter = async () => {
    if (transporterConfigured) return transporterConfigured;

    // Si existen credenciales SMTP en el .env, usa ese proveedor (ej. Gmail, SendGrid)
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        // Ejemplo de configuración para Gmail
        transporterConfigured = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
        console.log('✉️  Nodemailer configurado con credenciales SMTP externas.');
    } else {
        // Fallback: Usar Ethereal Email (Cuenta de prueba gratuita)
        console.log('✉️  No se detectaron credenciales SMTP. Creando cuenta de prueba Ethereal...');
        let testAccount = await nodemailer.createTestAccount();
        transporterConfigured = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        console.log('✉️  Cuenta Ethereal lista. Los correos se generarán como enlaces de previsualización.');
    }

    return transporterConfigured;
};

/**
 * Enviar un correo electrónico genérico.
 * @param {string} to - Destinatario
 * @param {string} subject - Asunto
 * @param {string} html - Cuerpo en HTML
 */
const sendMail = async (to, subject, html) => {
    try {
        const transporter = await createTransporter();
        const mailOptions = {
            from: '"Market Community" <noreply@marketcommunity.com>',
            to,
            subject,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        
        console.log(`✅ Correo enviado a: ${to}`);
        
        // Si usamos Ethereal, mostrar el link para ver el buzón simulado
        if (info.messageId && !process.env.SMTP_USER) {
            console.log('👀 Ver correo de prueba aquí: %s', nodemailer.getTestMessageUrl(info));
        }

        return info;
    } catch (error) {
        console.error('❌ Error enviando correo:', error);
        throw error; // Propagar error para que el controller lo maneje
    }
};

module.exports = {
    sendMail
};
