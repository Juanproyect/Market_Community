/**
 * auth.js — Lógica de Autenticación (UI)
 * Market Community | Arquitectura Modular v1.0
 *
 * Responsabilidad:
 *  - Cambiar entre los paneles Login y Registro
 *  - Validación básica de formularios en el cliente
 *
 * NOTA: La autenticación real contra el servidor
 * se implementará cuando el backend esté listo.
 */

/* ─── CAMBIO DE TABS ─────────────────────────────────
   Muestra el panel indicado (login | register)
   y resalta la pestaña activa.
─────────────────────────────────────────────────── */

/**
 * @param {'login' | 'register'} tabName  Panel a mostrar
 */
function switchTab(tabName) {
    /* Actualizar pestaña activa */
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    /* Mostrar / ocultar paneles */
    document.querySelectorAll('.auth-form-panel').forEach(panel => {
        panel.classList.toggle('active', panel.id === `${tabName}-panel`);
    });
}

/* ─── VALIDACIÓN BÁSICA ──────────────────────────────
   Verifica campos requeridos antes de enviar.
   Devuelve true si el formulario es válido.
─────────────────────────────────────────────────── */

/**
 * @param {HTMLFormElement} form  Formulario a validar
 * @returns {boolean}
 */
function validateForm(form) {
    let isValid = true;

    form.querySelectorAll('input[required]').forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = '#dc3545';
            isValid = false;
        } else {
            input.style.borderColor = '';
        }
    });

    /* Verificar que las contraseñas coincidan (en formulario de registro) */
    const pass    = form.querySelector('#reg-password');
    const confirm = form.querySelector('#confirm-password');

    if (pass && confirm && pass.value !== confirm.value) {
        confirm.style.borderColor = '#dc3545';
        showAuthMessage('Las contraseñas no coinciden.', 'error');
        isValid = false;
    }

    return isValid;
}

/* ─── MENSAJE DE FEEDBACK ─────────────────────────── */

/**
 * Muestra un mensaje temporal en el contenedor de auth.
 * @param {string} message   Texto a mostrar
 * @param {'success'|'error'} type   Tipo de mensaje
 */
function showAuthMessage(message, type = 'success') {
    const existing = document.querySelector('.auth-message');
    if (existing) existing.remove();

    const el = document.createElement('div');
    el.className = 'auth-message';
    el.textContent = message;
    el.style.cssText = `
        padding: 10px 15px;
        border-radius: 8px;
        margin-bottom: 15px;
        font-size: 14px;
        font-weight: 600;
        background: ${type === 'success' ? '#e8f5e9' : '#ffebee'};
        color: ${type === 'success' ? '#2e7d32' : '#c62828'};
        border-left: 4px solid ${type === 'success' ? '#4CAF50' : '#dc3545'};
    `;

    const container = document.querySelector('.auth-container');
    if (container) container.prepend(el);

    setTimeout(() => el.remove(), 4000);
}

/* ─── INICIALIZACIÓN ─────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    /* El tab activo por defecto es 'login' */
    switchTab('login');

    /* Interceptar envío del login */
    const loginForm = document.querySelector('#login-panel form');
    if (loginForm) {
        loginForm.addEventListener('submit', async e => {
            e.preventDefault();
            if (validateForm(loginForm)) {
                // Prevenir múltiples envíos
                const submitBtn = loginForm.querySelector('button[type="submit"]');
                submitBtn.disabled = true;
                submitBtn.textContent = 'Iniciando...';
                
                try {
                    const correo = loginForm.querySelector('#login-email').value;
                    const contraseña = loginForm.querySelector('#login-password').value;

                    const data = await apiFetch('/auth/login', {
                        method: 'POST',
                        body: JSON.stringify({ correo, contraseña })
                    });
                    
                    showAuthMessage('¡Bienvenido de vuelta!', 'success');
                    saveToken(data.token); // Usamos api.js para guardar el token
                    
                    // Redirigir al inicio después de 1 segundo
                    setTimeout(() => {
                        window.location.href = 'Home.html';
                    }, 1000);
                } catch (error) {
                    showAuthMessage(error.message, 'error');
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Iniciar Sesión';
                }
            }
        });
    }

    /* Interceptar envío del registro */
    const registerForm = document.querySelector('#register-panel form');
    if (registerForm) {
        registerForm.addEventListener('submit', async e => {
            e.preventDefault();
            if (validateForm(registerForm)) {
                const submitBtn = registerForm.querySelector('button[type="submit"]');
                submitBtn.disabled = true;
                submitBtn.textContent = 'Creando cuenta...';

                try {
                    const nombre = registerForm.querySelector('#reg-name').value;
                    const correo = registerForm.querySelector('#reg-email').value;
                    const contraseña = registerForm.querySelector('#reg-password').value;

                    const data = await apiFetch('/auth/register', {
                        method: 'POST',
                        body: JSON.stringify({ nombre, correo, contraseña })
                    });

                    showAuthMessage('Cuenta creada exitosamente. ¡Ahora puedes iniciar sesión!', 'success');
                    registerForm.reset();
                    // Cambiar a la pestaña de login
                    setTimeout(() => {
                        switchTab('login');
                    }, 2000);
                } catch (error) {
                    showAuthMessage(error.message, 'error');
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Crear Cuenta';
                }
            }
        });
    }
});
