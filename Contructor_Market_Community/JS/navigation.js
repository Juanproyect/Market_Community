/**
 * navigation.js — Navegación y Estado de Links Activos
 * Market Community | Arquitectura Modular v1.0
 *
 * Responsabilidad:
 *  - Marcar como .active el link de navegación según la página actual
 *  - Centralizar las rutas del proyecto
 */

/* ─── MAPA DE RUTAS ──────────────────────────────────
   Asocia cada nombre de página con su archivo HTML.
   Edita aquí si cambias nombres de archivo.
─────────────────────────────────────────────────── */
const ROUTES = {
    home:     'Home.html',
    auth:     'Autentication.html',
    panel:    'Panel_User.html',
    products: 'Gest_Product.html',
};

/**
 * Detecta qué página está activa comparando el nombre
 * del archivo en la URL y marca el enlace correspondiente
 * con la clase "active" dentro de .header-nav.
 */
function markActiveNavLink() {
    const currentFile = window.location.pathname
        .split('/')
        .pop()
        .toLowerCase();

    const navLinks = document.querySelectorAll('.header-nav a');

    navLinks.forEach(link => {
        const linkFile = link.getAttribute('href')
            ? link.getAttribute('href').split('/').pop().toLowerCase()
            : '';

        if (linkFile === currentFile) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/* ─── SESIÓN Y HEADER DINÁMICO ─────────────────────
   Oculta / Muestra links según si el usuario está
   logueado (tiene token) o no.
─────────────────────────────────────────────────── */
function setupAuthNavigation() {
    const nav = document.querySelector('.header-nav');
    if (!nav) return;

    const token = typeof getToken === 'function' ? getToken() : null;
    
    // Rutas protegidas que no deben verse si no está logueado
    const currentFile = window.location.pathname.split('/').pop().toLowerCase();
    const isProtected = ['gest_product.html', 'panel_user.html'].includes(currentFile);

    if (token) {
        // Usuario CON sesión
        nav.innerHTML = `
            <a href="Home.html">Inicio</a>
            <a href="Gest_Product.html">Mis Productos</a>
            <a href="Panel_User.html">Mi Cuenta</a>
            <a href="#" id="nav-logout">Cerrar Sesión</a>
        `;
        
        // Asignar evento al botón de cerrar sesión
        document.getElementById('nav-logout').addEventListener('click', (e) => {
            e.preventDefault();
            removeToken();
            window.location.href = 'Autentication.html';
        });

        // Si está en Autentication.html pero ya tiene sesión, mandarlo al Inicio
        if (currentFile === 'autentication.html') {
            window.location.href = 'Home.html';
        }

    } else {
        // Usuario SIN sesión
        nav.innerHTML = `
            <a href="Home.html">Inicio</a>
            <a href="Autentication.html">Iniciar Sesión / Registro</a>
        `;

        // Si intenta entrar a ruta protegida, expulsarlo a Iniciar Sesión
        if (isProtected) {
            window.location.href = 'Autentication.html';
        }
    }
}

/* ─── INICIALIZACIÓN ─────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    setupAuthNavigation();
    markActiveNavLink();
});
