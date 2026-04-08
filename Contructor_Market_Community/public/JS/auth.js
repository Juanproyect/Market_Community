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

function switchTab(tabName) {
    /* Actualizar pestaña activa */
    const tabsContainer = document.querySelector('.auth-tabs');
    if (tabName === 'recovery' || tabName === 'recovery-user') {
        if (tabsContainer) tabsContainer.style.display = 'none';
    } else {
        if (tabsContainer) tabsContainer.style.display = 'flex';
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
    }

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
                    const correo_recuperacion = registerForm.querySelector('#reg-backup-email').value;
                    const contraseña = registerForm.querySelector('#reg-password').value;

                    const data = await apiFetch('/auth/register', {
                        method: 'POST',
                        body: JSON.stringify({ nombre, correo, correo_recuperacion, contraseña })
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

    /* Interceptar envío de solicitud de token (Olvido de contraseña) */
    const forgotForm = document.querySelector('#forgot-form');
    if (forgotForm) {
        forgotForm.addEventListener('submit', async e => {
            e.preventDefault();
            const correoInput = forgotForm.querySelector('#forgot-backup-email');
            const correo_recuperacion = correoInput.value;

            if (!correo_recuperacion) return showAuthMessage('Ingresa tu correo de respaldo', 'error');

            const btn = forgotForm.querySelector('button');
            btn.disabled = true;
            btn.textContent = 'Enviando...';

            try {
                const data = await apiFetch('/auth/forgot-password', {
                    method: 'POST',
                    body: JSON.stringify({ correo_recuperacion })
                });

                showAuthMessage(data.mensaje, 'success');
                
                // Mostrar Paso 2 (Reset)
                document.querySelector('#step-request-token').style.display = 'none';
                const stepReset = document.querySelector('#step-reset-password');
                stepReset.style.display = 'block';
                stepReset.classList.remove('hidden');

            } catch (error) {
                showAuthMessage(error.message, 'error');
            } finally {
                btn.disabled = false;
                btn.textContent = 'Enviar Token';
            }
        });
    }

    /* Interceptar envío de cambio de contraseña */
    const resetForm = document.querySelector('#reset-form');
    if (resetForm) {
        resetForm.addEventListener('submit', async e => {
            e.preventDefault();
            // Obtenemos el correo del paso 1 si está allí, o forzamos un valor (aunque el botón de skip requiere teclearlo antes, mejor obligarlo si falta)
            let correo_recuperacion = document.querySelector('#forgot-backup-email').value;
            const token = resetForm.querySelector('#reset-token').value;
            const nuevaContraseña = resetForm.querySelector('#reset-password').value;

            if (!token || !nuevaContraseña) return showAuthMessage('Completa token y nueva contraseña', 'error');
            
            // Si el usuario saltó el paso, se le pedirá ingresar su correo de respaldo en un promt rápido 
            if (!correo_recuperacion) {
                correo_recuperacion = prompt("Por seguridad, ingresa nuevamente tu correo de respaldo:");
                if(!correo_recuperacion) return showAuthMessage('Falta el correo de respaldo', 'error');
            }

            const btn = resetForm.querySelector('button');
            btn.disabled = true;
            btn.textContent = 'Actualizando...';

            try {
                const data = await apiFetch('/auth/reset-password', {
                    method: 'POST',
                    body: JSON.stringify({ correo_recuperacion, token, nuevaContraseña })
                });

                showAuthMessage(data.mensaje, 'success');
                
                // Volver al login después de 2 segundos
                setTimeout(() => {
                    switchTab('login');
                }, 2000);

            } catch (error) {
                showAuthMessage(error.message, 'error');
            } finally {
                btn.disabled = false;
                btn.textContent = 'Actualizar Contraseña';
            }
        });
    }
    /* Interceptar envío de solicitud de token para Usuario (Olvido de Usuario) */
    const forgotUserForm = document.querySelector('#forgot-user-form');
    if (forgotUserForm) {
        forgotUserForm.addEventListener('submit', async e => {
            e.preventDefault();
            const correo_recuperacion = forgotUserForm.querySelector('#recovery-external-email').value;

            if (!correo_recuperacion) return showAuthMessage('Ingresa tu correo externo', 'error');

            const btn = forgotUserForm.querySelector('button');
            btn.disabled = true;
            btn.textContent = 'Enviando...';

            try {
                const data = await apiFetch('/auth/forgot-username', {
                    method: 'POST',
                    body: JSON.stringify({ correo_recuperacion })
                });

                showAuthMessage(data.mensaje, 'success');
                
                // Mostrar Paso 2 (Revelar Usuario)
                document.querySelector('#step-request-token-user').style.display = 'none';
                const stepReveal = document.querySelector('#step-reveal-user');
                stepReveal.style.display = 'block';
                stepReveal.classList.remove('hidden');

            } catch (error) {
                showAuthMessage(error.message, 'error');
            } finally {
                btn.disabled = false;
                btn.textContent = 'Enviar Código';
            }
        });
    }

    /* Interceptar envío de validación de código de Usuario */
    const revealUserForm = document.querySelector('#reveal-user-form');
    let revealedEmailTemp = ''; // Para prellenar el login

    if (revealUserForm) {
        revealUserForm.addEventListener('submit', async e => {
            e.preventDefault();
            const correo_recuperacion = document.querySelector('#recovery-external-email').value;
            const token = revealUserForm.querySelector('#reveal-token').value;

             if (!token) return showAuthMessage('Ingresa el código', 'error');

            const btn = revealUserForm.querySelector('button');
            btn.disabled = true;
            btn.textContent = 'Verificando...';

            try {
                const data = await apiFetch('/auth/reveal-username', {
                    method: 'POST',
                    body: JSON.stringify({ correo_recuperacion, token })
                });

                showAuthMessage(data.mensaje, 'success');
                
                // Ocultar paso 2, mostrar paso 3
                document.querySelector('#step-reveal-user').style.display = 'none';
                const stepShow = document.querySelector('#step-show-user');
                stepShow.style.display = 'block';
                stepShow.classList.remove('hidden');

                // Llenar datos en pantalla
                document.querySelector('#revealed-name').textContent = data.usuario_recuperado.nombre;
                document.querySelector('#revealed-email').textContent = data.usuario_recuperado.correo_principal;
                revealedEmailTemp = data.usuario_recuperado.correo_principal;
                
            } catch (error) {
                showAuthMessage(error.message, 'error');
            } finally {
                btn.disabled = false;
                btn.textContent = 'Ver mi Cuenta';
            }
        });
    }

    // Exponer la función para el botón 'Ir a Iniciar Sesión'
    window.fillLoginForm = function() {
        switchTab('login');
        if (revealedEmailTemp) {
            document.querySelector('#login-email').value = revealedEmailTemp;
            document.querySelector('#login-password').focus();
        }
    };

    // Función para saltarse del Paso 1 al Paso 2 si ya tiene código
    window.skipToToken = function() {
        const stepReq = document.querySelector('#step-request-token');
        const stepRes = document.querySelector('#step-reset-password');
        if (stepReq && stepRes) {
            stepReq.style.display = 'none';
            stepRes.style.display = 'block';
            stepRes.classList.remove('hidden');
        }
    };

});
