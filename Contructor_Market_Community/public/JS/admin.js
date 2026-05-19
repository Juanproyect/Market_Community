/**
 * admin.js - Lógica del Panel de Administración
 */

document.addEventListener('DOMContentLoaded', async () => {

    // 1. Verificación de seguridad rápida del lado del cliente
    try {
        const meRes = await apiFetch('/auth/me');
        if (!meRes || meRes.usuario.rol !== 'administrador') {
            alert('Acceso Denegado. Esta sección es exclusiva para administradores.');
            window.location.href = 'Home.html';
            return; // Detener ejecución
        }
    } catch (e) {
        window.location.href = 'Autentication.html';
        return;
    }

    // 2. Navegación entre pestañas
    const tabs = document.querySelectorAll('.admin-menu li');
    const tabContents = document.querySelectorAll('.admin-tab');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Quitar clase activa de todo
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Agregar clase activa al presionado
            tab.classList.add('active');
            const targetId = tab.getAttribute('data-tab');
            document.getElementById(targetId).classList.add('active');

            // Cargar datos según pestaña
            if (targetId === 'tab-dashboard') cargarDashboard();
            if (targetId === 'tab-usuarios') cargarUsuarios();
            if (targetId === 'tab-publicaciones') cargarPublicaciones();
        });
    });

    // Cargar Dashboard por defecto
    cargarDashboard();

    // -----------------------------------------
    // FUNCIONES DE CARGA Y RENDERIZADO
    // -----------------------------------------

    async function cargarDashboard() {
        try {
            const stats = await apiFetch('/admin/estadisticas');
            const grid = document.getElementById('admin-stats-grid');
            
            grid.innerHTML = `
                <div class="stat-card stat-card--blue">
                    <div class="stat-number">${stats.usuarios.total}</div>
                    <div class="stat-label">Usuarios Registrados</div>
                </div>
                <div class="stat-card stat-card--orange">
                    <div class="stat-number">${stats.usuarios.bloqueados}</div>
                    <div class="stat-label">Usuarios Bloqueados</div>
                </div>
                <div class="stat-card stat-card--green">
                    <div class="stat-number">${stats.publicaciones.activas}</div>
                    <div class="stat-label">Publicaciones Activas</div>
                </div>
                <div class="stat-card stat-card--red" style="background:var(--color-danger);color:white;">
                    <div class="stat-number">${stats.publicaciones.eliminadas}</div>
                    <div class="stat-label">Publicaciones Moderadas</div>
                </div>
            `;
        } catch (error) {
            console.error(error);
        }
    }

    async function cargarUsuarios() {
        try {
            const usuarios = await apiFetch('/admin/usuarios');
            const tbody = document.getElementById('users-tbody');
            tbody.innerHTML = '';

            if (usuarios.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No hay usuarios.</td></tr>';
                return;
            }

            usuarios.forEach(u => {
                const tr = document.createElement('tr');
                
                // Botones según estado
                let btnAccion = '';
                if (u.rol === 'administrador') {
                    btnAccion = '<span style="color:var(--color-text-light);font-size:0.8rem;">Admin inamovible</span>';
                } else if (u.estado_cuenta === 'activo') {
                    btnAccion = `
                        <button class="action-btn btn-suspend" onclick="window.cambiarEstadoUser(${u.id_usuario}, 'suspendido')">Suspender</button>
                        <button class="action-btn btn-block" onclick="window.cambiarEstadoUser(${u.id_usuario}, 'bloqueado')">Bloquear</button>
                    `;
                } else {
                    btnAccion = `<button class="action-btn btn-activate" onclick="window.cambiarEstadoUser(${u.id_usuario}, 'activo')">Reactivar</button>`;
                }

                tr.innerHTML = `
                    <td>#${u.id_usuario}</td>
                    <td><strong>${u.nombre}</strong></td>
                    <td>${u.correo}</td>
                    <td>${u.rol.toUpperCase()}</td>
                    <td><span class="status-badge status-${u.estado_cuenta}">${u.estado_cuenta}</span></td>
                    <td>${btnAccion}</td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error(error);
        }
    }

    async function cargarPublicaciones() {
        try {
            const pubs = await apiFetch('/admin/publicaciones');
            const tbody = document.getElementById('pubs-tbody');
            tbody.innerHTML = '';

            if (pubs.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No hay publicaciones.</td></tr>';
                return;
            }

            pubs.forEach(p => {
                const tr = document.createElement('tr');
                const imagen = (p.imagenes && p.imagenes.length > 0) ? `/uploads/${p.imagenes[0].ruta_imagen}` : 'img/placeholder.png';
                
                let btnAccion = p.estado_pub !== 'eliminada' 
                    ? `<button class="action-btn btn-block" onclick="window.eliminarPublicacion(${p.id_publicacion})">Eliminar / Moderar</button>` 
                    : '<span style="color:var(--color-text-light);font-size:0.8rem;">Moderada</span>';

                tr.innerHTML = `
                    <td>#${p.id_publicacion}</td>
                    <td><img src="${imagen}" alt="${p.titulo}" onerror="this.src='img/logo_MC_Verde.png'"></td>
                    <td><strong>${p.titulo}</strong><br><small>${p.tipo === 'donacion' ? 'Donación' : '$'+p.precio}</small></td>
                    <td>User ID: ${p.id_usuario}</td>
                    <td><span class="status-badge status-${p.estado_pub}">${p.estado_pub}</span></td>
                    <td>${btnAccion}</td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error(error);
        }
    }

    // -----------------------------------------
    // FUNCIONES GLOBALES DE ACCIÓN
    // -----------------------------------------

    window.cambiarEstadoUser = async function(id_usuario, nuevoEstado) {
        if (!confirm(`¿Estás seguro de que deseas marcar este usuario como ${nuevoEstado.toUpperCase()}?`)) return;

        try {
            const res = await apiFetch(`/admin/usuarios/${id_usuario}/estado`, {
                method: 'PUT',
                body: JSON.stringify({ estado_cuenta: nuevoEstado })
            });
            alert(res.mensaje);
            cargarUsuarios(); // Recargar la tabla
            cargarDashboard(); // Actualizar stats
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    window.eliminarPublicacion = async function(id_publicacion) {
        if (!confirm('Esta acción moderará la publicación eliminándola del catálogo general. ¿Continuar?')) return;

        try {
            const res = await apiFetch(`/admin/publicaciones/${id_publicacion}`, { method: 'DELETE' });
            alert(res.mensaje);
            cargarPublicaciones(); // Recargar la tabla
            cargarDashboard(); // Actualizar stats
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

});
