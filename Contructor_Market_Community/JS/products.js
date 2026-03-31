/**
 * products.js — Lógica de Gestión de Productos y Catálogo conectado a la API
 * Market Community | Arquitectura Modular v1.0
 */

// ==========================================
// 1. CARGA DEL CATÁLOGO (HOME)
// ==========================================

async function loadCatalog() {
    const grid = document.getElementById('catalog-grid');
    if (!grid) return; // Si no estamos en el Home, salimos.

    try {
        // Pedir las publicaciones activas al backend
        const publicaciones = await apiFetch('/publicaciones');
        
        if (publicaciones.length === 0) {
            grid.innerHTML = '<div style="text-align:center; grid-column: 1 / -1; padding: 2rem;">No hay publicaciones disponibles en este momento.</div>';
            return;
        }

        // Construir el HTML de cada tarjeta
        let htmlCards = '';
        publicaciones.forEach(pub => {
            // Construir URL de imagen (tomamos la primera o usamos un emoji/placeholder si no hay)
            let imgHTML = '<div class="product-image">📷</div>';
            if (pub.imagenes && pub.imagenes.length > 0) {
                // Suponiendo que el backend sirve uploads en localhost:3000/uploads/...
                const imgUrl = `http://localhost:3000/uploads/${pub.imagenes[0].ruta_imagen}`;
                imgHTML = `<div class="product-image" style="background-image: url('${imgUrl}'); background-size: cover; background-position: center;"></div>`;
            }

            // Formatear precio
            const precioText = pub.tipo === 'donacion' 
                ? '<span style="color:var(--primary); font-weight:bold;">DONACIÓN</span>' 
                : `$${Number(pub.precio).toLocaleString('es-CO')}`;

            htmlCards += `
                <article class="product-card" style="position:relative;">
                    <div style="position:absolute; top:10px; right:10px; z-index:10; display:flex; gap:8px;">
                        <button class="btn btn-sm" style="background:rgba(255,255,255,0.8); color:black; border:none; border-radius:50%; padding:8px 10px; cursor:pointer;" onclick="event.stopPropagation(); window.toggleFav(${pub.id_publicacion})" title="Agregar/Quitar a favoritos">
                            ❤️
                        </button>
                    </div>
                    ${imgHTML}
                    <div class="product-info" onclick="alert('Detalle en construcción. ID: ${pub.id_publicacion}')" style="cursor:pointer;">
                        <h4>${pub.titulo}</h4>
                        <p>${precioText}</p>
                        <small>${pub.estado_prenda.replace('_', ' ')} · ${pub.categoria ? pub.categoria.nombre : 'Sin categoría'}</small>
                        <br>
                        <button class="btn btn-primary" style="margin-top:10px; width:100%;" onclick="event.stopPropagation(); window.addCart(${pub.id_publicacion})">🛒 Añadir al carrito</button>
                    </div>
                </article>
            `;
        });

        grid.innerHTML = htmlCards;

        // Animar la entrada
        const cards = grid.querySelectorAll('.product-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.05}s`;
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
                        <button class="btn-sm btn-edit" type="button" onclick="alert('Editar en construcción')">✏️ Editar</button>
                        <button class="btn-sm btn-delete" type="button" onclick="handleDeleteProduct(${pub.id_publicacion}, '${pub.titulo}')">🗑️ Eliminar</button>
                    </div>
                </div>
            `;
        });

        listContainer.innerHTML = htmlRows;

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

// ==========================================
// 2A. INTERACCIONES DE FASE 5 (USUARIO)
// ==========================================

window.toggleFav = async function(id_publicacion) {
    const token = getToken();
    if (!token) return alert('Debes iniciar sesión para dar favorito');
    
    try {
        const res = await apiFetch(`/favoritos/${id_publicacion}`, { method: 'POST' });
        alert(res.mensaje);
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

    // Interceptar envío del formulario de creación de producto
    const newProductForm = document.querySelector('#product-form form');
    if (newProductForm) {
        newProductForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = newProductForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Subiendo...';

            try {
                // Recolectar datos usando FormData (soporta archivos)
                const formData = new FormData();
                formData.append('titulo', document.getElementById('prod-name').value);
                formData.append('descripcion', document.getElementById('prod-desc').value);
                
                // Mapear categorías string a IDs aproximados del SEEDER (1=ropa, etc.) 
                // ya que la base de datos espera INT. Por defecto 1 o el índice seleccioado.
                const categorySelect = document.getElementById('prod-category');
                const catIndex = (categorySelect.selectedIndex > 0) ? categorySelect.selectedIndex : 1;
                formData.append('id_categoria', catIndex);
                
                formData.append('estado_prenda', document.getElementById('prod-condition').value);
                formData.append('tipo', document.getElementById('prod-type').value);
                
                const precioVal = document.getElementById('prod-price').value;
                if (precioVal) formData.append('precio', precioVal);

                // Agregar los archivos seleccionados
                const fileInput = document.getElementById('prod-images');
                if (fileInput && fileInput.files.length > 0) {
                    for (let i = 0; i < fileInput.files.length; i++) {
                        formData.append('imagenes', fileInput.files[i]);
                    }
                }

                // Enviar petición POST (apiFetch no pone Content-Type si es FormData)
                await apiFetch('/publicaciones', {
                    method: 'POST',
                    body: formData
                });

                alert('¡Publicación creada exitosamente!');
                toggleProductForm();
                loadMyProducts(); // Actualizar la tabla

            } catch (error) {
                alert(`Error al crear publicación: ${error.message}`);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Publicar Artículo';
            }
        });
    }

});
