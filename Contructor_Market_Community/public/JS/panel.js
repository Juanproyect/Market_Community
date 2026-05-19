/**
 * panel.js — Gestión del Dashboard de Usuario
 * Market Community | Arquitectura Modular v1.0
 */

document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. CARGA INICIAL DE DATOS
    await loadUserProfile();
    await loadDashboardActivity();

    // 2. CONFIGURACIÓN DEL MODAL
    const modal = document.getElementById('panel-modal');
    const modalClose = document.getElementById('modal-close');

    function openModal(html) {
        modalBody.innerHTML = html;
        modal.style.display = 'flex';
    }

    modalClose.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

    // 3. EVENTOS DE BOTONES "VER TODOS" (POPUPS)
    
    document.getElementById('btn-show-compras').onclick = async () => {
        openModal('<h3>Historial de Compras</h3><p>Cargando...</p>');
        try {
            // Asumiendo que el carrito/pagos nos da el historial
            // Por ahora simulamos o pedimos a un endpoint si existiera
            const html = `
                <div class="modal-list">
                    <div class="item"><span>Chaqueta de Cuero</span> <strong>$120.000</strong> <span class="badge success">Entregado</span></div>
                    <div class="item"><span>Zapatos Deportivos</span> <strong>$85.000</strong> <span class="badge warning">En camino</span></div>
                    <p style="margin-top:1rem; font-size:0.9rem; color:#666;">Próximamente: Integración real con pasarela de pagos.</p>
                </div>
            `;
            openModal('<h3>Historial de Compras</h3>' + html);
        } catch (e) { openModal('Error cargando historial.'); }
    };

    document.getElementById('btn-show-ventas').onclick = async () => {
        openModal('<h3>Estadísticas de Ventas</h3><p>Cargando...</p>');
        try {
            const stats = await apiFetch('/estadisticas');
            const html = `
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-top:1rem;">
                    <div class="stat-card" style="background:#f0f9ff; padding:15px; border-radius:10px;">
                        <div style="font-size:1.5rem; font-weight:bold; color:var(--color-primary);">${stats.ventasCompletadas}</div>
                        <div style="font-size:0.8rem;">Ventas Realizadas</div>
                    </div>
                    <div class="stat-card" style="background:#f0fdf4; padding:15px; border-radius:10px;">
                        <div style="font-size:1.5rem; font-weight:bold; color:#16a34a;">$${(stats.gastoTotal * 0.8).toLocaleString()}</div>
                        <div style="font-size:0.8rem;">Ingresos Totales</div>
                    </div>
                </div>
                <h4 style="margin-top:1.5rem;">Ventas Recientes</h4>
                <ul class="activity-list">
                    <li><span>Venta #1024 - Jeans Levi's</span> <strong>$45.000</strong></li>
                    <li><span>Venta #1021 - Camiseta Polo</span> <strong>$25.000</strong></li>
                </ul>
            `;
            openModal('<h3>Estadísticas de Ventas</h3>' + html);
        } catch (e) { openModal('Error cargando estadísticas.'); }
    };

    document.getElementById('btn-show-favoritos').onclick = async () => {
        openModal('<h3>Mis Favoritos</h3><p>Cargando...</p>');
        try {
            const favs = await apiFetch('/favoritos');
            if (favs.length === 0) {
                openModal('<h3>Mis Favoritos</h3><p>No tienes productos guardados aún.</p>');
                return;
            }

            let html = '<div class="modal-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(150px, 1fr)); gap:15px; margin-top:1rem;">';
            favs.forEach(f => {
                const pub = f.publicacion;
                const img = pub.imagenes && pub.imagenes.length > 0 ? `/uploads/${pub.imagenes[0].ruta_imagen}` : '';
                html += `
                    <div class="fav-card" style="border:1px solid #eee; border-radius:10px; overflow:hidden; font-size:0.8rem;">
                        <div style="height:100px; background-image:url('${img}'); background-size:cover; background-position:center; background-color:#f5f5f5;"></div>
                        <div style="padding:8px;">
                            <div style="font-weight:bold; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${pub.titulo}</div>
                            <div style="color:var(--color-primary);">$${Number(pub.precio).toLocaleString()}</div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            openModal('<h3>Mis Favoritos</h3>' + html);
        } catch (e) { openModal('Error cargando favoritos.'); }
    };

    // 4. GESTIÓN DE FOTO DE PERFIL
    const profilePicTrigger = document.getElementById('profile-pic-trigger');
    const profileInput = document.getElementById('profile-photo-input');

    profilePicTrigger.onclick = () => profileInput.click();

    profileInput.onchange = async (e) => {
        if (e.target.files.length === 0) return;
        
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('foto', file);

        try {
            profilePicTrigger.textContent = '⏳';
            const res = await apiFetch('/auth/foto', {
                method: 'PUT',
                body: formData
            });
            
            // Actualizar imagen en el DOM
            const imgUrl = `/uploads/${res.foto_perfil}`;
            profilePicTrigger.style.backgroundImage = `url('${imgUrl}')`;
            profilePicTrigger.style.backgroundSize = 'cover';
            profilePicTrigger.style.backgroundPosition = 'center';
            profilePicTrigger.textContent = '';
            
            alert("¡Foto de perfil actualizada!");
        } catch (err) {
            alert("Error al subir foto: " + err.message);
            profilePicTrigger.textContent = '👤';
        }
    };

});

async function loadUserProfile() {
    try {
        const meRes = await apiFetch('/auth/me');
        if (meRes && meRes.usuario) {
            const user = meRes.usuario;
            
            document.querySelector('.profile-name').textContent = `${user.nombre} ${user.apellido || ''}`;
            document.getElementById('profile-info-details').innerHTML = `
                <p><strong>Email:</strong> ${user.correo}</p>
                <p><strong>Miembro desde:</strong> ${new Date(user.fecha_registro).toLocaleDateString()}</p>
                <p><strong>Ubicación:</strong> ${user.ubicacion || 'No especificada'}</p>
            `;

            if (user.foto_perfil) {
                const trigger = document.getElementById('profile-pic-trigger');
                const imgUrl = `/uploads/${user.foto_perfil}`;
                trigger.style.backgroundImage = `url('${imgUrl}')`;
                trigger.style.backgroundSize = 'cover';
                trigger.style.backgroundPosition = 'center';
                trigger.textContent = '';
            }

            // Estadísticas del sidebar
            const stats = await apiFetch('/estadisticas');
            document.getElementById('st-productos').innerText = stats.publicacionesActivas;
            document.getElementById('st-ventas').innerText = stats.ventasCompletadas;
            document.getElementById('st-favoritos').innerText = stats.misFavoritosGuardados;
        }
    } catch (e) { console.error("Error cargando perfil", e); }
}

async function loadDashboardActivity() {
    try {
        // Cargar mini-listas de actividad
        const favs = await apiFetch('/favoritos');
        const listFavs = document.getElementById('list-favoritos');
        if (favs.length > 0) {
            listFavs.innerHTML = favs.slice(0, 3).map(f => `
                <li><span>${f.publicacion.titulo}</span> <span>$${Number(f.publicacion.precio).toLocaleString()}</span></li>
            `).join('');
            document.getElementById('btn-show-favoritos').textContent = `Ver todos (${favs.length})`;
        }

        const stats = await apiFetch('/estadisticas');
        document.getElementById('total-vendido').textContent = `$${(stats.gastoTotal * 0.8).toLocaleString()}`; // Simulado

    } catch (e) { console.error("Error cargando actividad", e); }
}
