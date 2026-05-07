/**
 * products.js — Lógica de Gestión de Productos y Catálogo conectado a la API
 * Market Community | Arquitectura Modular v1.0
 */

// ==========================================
// 1. CARGA DEL CATÁLOGO (HOME)
// ==========================================

// Variable global para persistir el catálogo y filtrar por precio localmente si se desea, 
// o simplemente volver a pedir al server.
let currentPublicaciones = [];

async function loadCatalog(filters = {}) {
    const grid = document.getElementById('catalog-grid');
    if (!grid) return;

    try {
        // 1. Obtener favoritos del usuario (si está logueado) para marcar los corazones
        let misFavoritosIds = [];
        const token = getToken();
        if (token) {
            try {
                const favs = await apiFetch('/favoritos');
                misFavoritosIds = favs.map(f => f.id_publicacion);
            } catch (e) { console.error("Error cargando favoritos iniciales", e); }
        }

        // 2. Construir Query String para filtros (categoría, tipo, etc.)
        let query = '';
        if (filters.id_categoria) query += `?id_categoria=${filters.id_categoria}`;
        
        // Pedir las publicaciones al backend
        const publicaciones = await apiFetch(`/publicaciones${query}`);
        currentPublicaciones = publicaciones; // Guardar para filtros de precio locales si fuera necesario
        
        // 3. Filtrado local adicional (como el precio máximo)
        let filtered = publicaciones;
        if (filters.precioMax) {
            filtered = filtered.filter(p => {
                if (p.tipo === 'donacion') return true; // Las donaciones siempre pasan
                return Number(p.precio) <= filters.precioMax;
            });
        }

        if (filtered.length === 0) {
            grid.innerHTML = '<div style="text-align:center; grid-column: 1 / -1; padding: 2rem;">No se encontraron productos con estos filtros.</div>';
            return;
        }

        // Construir el HTML
        let htmlCards = '';
        filtered.forEach(pub => {
            let imgHTML = '<div class="product-image">📷</div>';
            if (pub.imagenes && pub.imagenes.length > 0) {
                const imgUrl = `http://localhost:3000/uploads/${pub.imagenes[0].ruta_imagen}`;
                imgHTML = `<div class="product-image" style="background-image: url('${imgUrl}'); background-size: cover; background-position: center;"></div>`;
            }

            const precioText = pub.tipo === 'donacion' 
                ? '<span style="color:var(--primary); font-weight:bold;">DONACIÓN</span>' 
                : `$${Number(pub.precio).toLocaleString('es-CO')}`;

            const isFav = misFavoritosIds.includes(pub.id_publicacion);
            const favColor = isFav ? 'red' : 'rgba(0,0,0,0.3)';

            htmlCards += `
                <article class="product-card" style="position:relative;">
                    <div style="position:absolute; top:10px; right:10px; z-index:10;">
                        <button class="btn-fav ${isFav ? 'active' : ''}" 
                                style="background:white; color:${favColor}; border:none; border-radius:50%; width:35px; height:35px; cursor:pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.2); font-size: 1.2rem; display:flex; align-items:center; justify-content:center;" 
                                onclick="event.stopPropagation(); window.toggleFav(this, ${pub.id_publicacion})" 
                                title="Agregar/Quitar a favoritos">
                            ❤️
                        </button>
                    </div>
                    ${imgHTML}
                    <div class="product-info" onclick="alert('Detalle en construcción. ID: ${pub.id_publicacion}')" style="cursor:pointer;">
                        <h4>${pub.titulo}</h4>
                        <p>${precioText}</p>
                        <small>${pub.estado_prenda.replace('_', ' ')} · ${pub.categoria ? pub.categoria.nombre : 'Sin categoría'}</small>
                        <br>
                        <div style="display:flex; gap:8px; margin-top:10px; flex-wrap:wrap;">
                            <button class="btn btn-primary" style="flex:1; font-size:0.8rem; padding:8px 10px; min-width:0; white-space:nowrap;" onclick="event.stopPropagation(); window.addCart(${pub.id_publicacion})">🛒 Carrito</button>
                            <button class="btn btn-secondary" style="flex:1; font-size:0.8rem; padding:8px 10px; min-width:0; white-space:nowrap; background:white; color:var(--color-primary); border:1px solid var(--color-primary);" onclick="event.stopPropagation(); window.contactarVendedor(${pub.id_usuario})">💬 Vendedor</button>
                        </div>
                    </div>
                </article>
            `;
        });

        grid.innerHTML = htmlCards;

        // Animar la entrada
        const cards = grid.querySelectorAll('.product-card');
        cards.forEach((card, index) => {
            card.style.animation = `fadeInUp 0.4s ease forwards ${index * 0.05}s`;
            card.style.opacity = '0';
        });

    } catch (error) {
        grid.innerHTML = `<div style="text-align:center; grid-column: 1 / -1; padding: 2rem; color: #dc3545;">Error cargando publicaciones: ${error.message}</div>`;
    }
}

// ==========================================
// 2. GESTIÓN DE MIS PRODUCTOS (PANEL)
// ==========================================

function toggleProductForm() {
    const formPanel = document.getElementById('product-form');
    // En el HTML actual, formPanel es el contenedor <section id="product-form" class="hidden">
    if (!formPanel) return;

    if (formPanel.classList.contains('hidden')) {
        formPanel.classList.remove('hidden');
        formPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        formPanel.classList.add('hidden');
        const form = formPanel.querySelector('form');
        if (form) form.reset();
    }
}

async function loadStats() {
    const viewsEl = document.getElementById('stat-views');
    if (!viewsEl) return;

    try {
        const stats = await apiFetch('/estadisticas');
        
        document.getElementById('stat-views').textContent = Math.floor(Math.random() * 100) + 50; // Visualizaciones simuladas si no hay campo en BD
        document.getElementById('stat-favs').textContent = stats.favoritosRecibidos;
        document.getElementById('stat-sold').textContent = stats.ventasCompletadas;
        
        // Mensajes: Podríamos contar los chats donde el usuario es receptor
        const chats = await apiFetch('/chats');
        document.getElementById('stat-messages').textContent = chats.length;

    } catch (err) {
        console.error("Error cargando stats:", err);
    }
}

async function loadMyProducts() {
    const listContainer = document.querySelector('.product-list');
    if (!listContainer) return; // Si no estamos en Gest_Product, salimos

    try {
        const token = getToken();
        if (!token) return;

        const meRes = await apiFetch('/auth/me');
        const myId = meRes.usuario.id_usuario;

        const publicaciones = await apiFetch('/publicaciones');
        const misPubs = publicaciones.filter(p => p.id_usuario === myId);

        if (misPubs.length === 0) {
            listContainer.innerHTML = '<div style="text-align:center; padding:2rem; width:100%;">No has publicado ningún artículo aún.</div>';
            return;
        }

        let htmlRows = '';
        misPubs.forEach(pub => {
            const precioText = pub.tipo === 'donacion' ? 'Donación' : `$${Number(pub.precio).toLocaleString('es-CO')}`;
            const statusClass = pub.estado_pub === 'activa' ? 'success' : 'warning';
            
            let imgHTML = '<div class="product-thumb">📷</div>';
            if (pub.imagenes && pub.imagenes.length > 0) {
                const imgUrl = `http://localhost:3000/uploads/${pub.imagenes[0].ruta_imagen}`;
                imgHTML = `<div class="product-thumb" style="background-image: url('${imgUrl}'); background-size: cover; background-position: center; border-radius: 8px;"></div>`;
            }

            htmlRows += `
                <div class="product-item" data-id="${pub.id_publicacion}">
                    ${imgHTML}
                    <div class="product-details">
                        <h4>${pub.titulo}</h4>
                        <p>${precioText} · ${pub.categoria ? pub.categoria.nombre : '-'}</p>
                        <div class="product-badges">
                            <span class="badge ${statusClass}">Estado: ${pub.estado_pub}</span>
                        </div>
                    </div>
                    <div class="product-actions">
                        <button class="btn-sm btn-edit" type="button" onclick="handleEditProduct(${pub.id_publicacion})">✏️ Editar</button>
                        <button class="btn-sm btn-delete" type="button" onclick="handleDeleteProduct(${pub.id_publicacion}, '${pub.titulo}')">🗑️ Eliminar</button>
                    </div>
                </div>
            `;
        });

        listContainer.innerHTML = htmlRows;
        
        // Cargar también las estadísticas generales
        loadStats();

    } catch (error) {
        console.error("Error cargando mis productos:", error);
    }
}

async function handleDeleteProduct(id_publicacion, titulo) {
    if (confirm(`¿Seguro que quieres eliminar "${titulo}"?`)) {
        try {
            await apiFetch(`/publicaciones/${id_publicacion}`, { method: 'DELETE' });
            // Recargar la tabla
            loadMyProducts();
        } catch (error) {
            alert(`Error borrando: ${error.message}`);
        }
    }
}

let editingProductId = null;

async function handleEditProduct(id) {
    try {
        const pub = await apiFetch(`/publicaciones/${id}`);
        editingProductId = id;

        // Abrir formulario
        const formPanel = document.getElementById('product-form');
        formPanel.classList.remove('hidden');
        formPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Llenar datos
        document.getElementById('prod-name').value = pub.titulo;
        document.getElementById('prod-desc').value = pub.descripcion;
        document.getElementById('prod-price').value = pub.precio || '';
        document.getElementById('prod-type').value = pub.tipo;
        document.getElementById('prod-condition').value = pub.estado_prenda;
        
        // Mapear categoría
        const catSelect = document.getElementById('prod-category');
        if (pub.categoria) {
            // Buscamos por texto si el value no coincide
            Array.from(catSelect.options).forEach((opt, idx) => {
                if (opt.value.toLowerCase() === pub.categoria.nombre.toLowerCase() || idx === pub.id_categoria) {
                    catSelect.selectedIndex = idx;
                }
            });
        }

        // Cambiar texto del botón
        const submitBtn = document.querySelector('#new-product-form button[type="submit"]');
        submitBtn.textContent = '💾 Guardar Cambios';
        document.querySelector('#product-form h3').textContent = 'Editar Producto';

    } catch (err) {
        alert("Error cargando datos del producto: " + err.message);
    }
}

// ==========================================
// 2A. INTERACCIONES DE FASE 5 (USUARIO)
// ==========================================

window.toggleFav = async function(btn, id_publicacion) {
    const token = getToken();
    if (!token) return alert('Debes iniciar sesión para dar favorito');
    
    try {
        const res = await apiFetch(`/favoritos/${id_publicacion}`, { method: 'POST' });
        // Feedback visual inmediato
        if (res.estado) {
            btn.style.color = 'red';
            btn.classList.add('active');
        } else {
            btn.style.color = 'rgba(0,0,0,0.3)';
            btn.classList.remove('active');
        }
    } catch (err) {
        alert(err.message);
    }
}

window.addCart = async function(id_publicacion) {
    const token = getToken();
    if (!token) return alert('Debes iniciar sesión para agregar al carrito');
    
    try {
        const res = await apiFetch(`/carrito/agregar`, { 
            method: 'POST',
            body: JSON.stringify({ id_publicacion })
        });
        alert(res.mensaje);
    } catch (err) {
        alert(err.message);
    }
}

window.contactarVendedor = async function(id_usuario_receptor) {
    const token = getToken();
    if (!token) return alert('Debes iniciar sesión para contactar al vendedor');
    
    try {
        const meRes = await apiFetch('/auth/me');
        if (meRes.usuario.id_usuario === id_usuario_receptor) {
            return alert('No puedes contactarte a ti mismo.');
        }

        // Crear o obtener el chat
        await apiFetch('/chats/iniciar', { 
            method: 'POST',
            body: JSON.stringify({ id_usuario_receptor })
        });
        
        // Redirigir al chat
        window.location.href = 'Chat.html';
    } catch (err) {
        alert(err.message);
    }
}

// ==========================================
// 3. INICIALIZACIÓN
// ==========================================

document.addEventListener('DOMContentLoaded', () => {

    // ── Home
    loadCatalog();

    // ── Gestión
    loadMyProducts();

    const publishBtn = document.getElementById('btn-publish');
    if (publishBtn) publishBtn.addEventListener('click', toggleProductForm);

    const cancelBtn = document.getElementById('btn-cancel-form');
    if (cancelBtn) cancelBtn.addEventListener('click', toggleProductForm);

    // Interceptar envío del formulario de creación/edición de producto
    const newProductForm = document.querySelector('#product-form form');
    if (newProductForm) {
        newProductForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = newProductForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Procesando...';

            try {
                const isEdit = !!editingProductId;
                
                // Si es edición, usamos JSON simple por ahora (Multer no es necesario si no cambiamos fotos)
                // Para simplificar, si es edición no permitimos cambiar fotos en esta fase 
                // (o tendríamos que manejar el append de fotos viejas/nuevas)
                
                let res;
                if (isEdit) {
                    const body = {
                        titulo: document.getElementById('prod-name').value,
                        descripcion: document.getElementById('prod-desc').value,
                        id_categoria: document.getElementById('prod-category').selectedIndex, // Asumiendo 1-indexed por orden
                        estado_prenda: document.getElementById('prod-condition').value,
                        tipo: document.getElementById('prod-type').value,
                        precio: document.getElementById('prod-price').value || null
                    };

                    res = await apiFetch(`/publicaciones/${editingProductId}`, {
                        method: 'PUT',
                        body: JSON.stringify(body)
                    });
                } else {
                    // Creación con FormData (soporta archivos)
                    const formData = new FormData();
                    formData.append('titulo', document.getElementById('prod-name').value);
                    formData.append('descripcion', document.getElementById('prod-desc').value);
                    formData.append('id_categoria', document.getElementById('prod-category').selectedIndex);
                    formData.append('estado_prenda', document.getElementById('prod-condition').value);
                    formData.append('tipo', document.getElementById('prod-type').value);
                    
                    const precioVal = document.getElementById('prod-price').value;
                    if (precioVal) formData.append('precio', precioVal);

                    const fileInput = document.getElementById('prod-images');
                    if (fileInput && fileInput.files.length > 0) {
                        for (let i = 0; i < fileInput.files.length; i++) {
                            formData.append('imagenes', fileInput.files[i]);
                        }
                    }

                    res = await apiFetch('/publicaciones', {
                        method: 'POST',
                        body: formData
                    });
                }

                alert(isEdit ? '¡Cambios guardados!' : '¡Publicación creada exitosamente!');
                
                // Resetear estado
                editingProductId = null;
                submitBtn.textContent = 'Publicar Artículo';
                document.querySelector('#product-form h3').textContent = 'Publicar Nuevo Producto';
                
                toggleProductForm();
                loadMyProducts(); 

            } catch (error) {
                alert(`Error: ${error.message}`);
            } finally {
                submitBtn.disabled = false;
                if (!editingProductId) submitBtn.textContent = 'Publicar Artículo';
            }
        });
    }

});
