/**
 * main.js — Inicialización Global
 * Market Community | Arquitectura Modular v1.0
 *
 * Responsabilidad:
 *  - Coordinar la carga de todos los módulos JS
 *  - Comportamientos comunes a TODAS las páginas
 *    (hover de botones, efectos micro-animación)
 *
 * Orden de carga de scripts en cada HTML:
 *   1. navigation.js
 *   2. auth.js        (solo en Autentication.html)
 *   3. products.js    (solo en Home.html y Gest_Product.html)
 *   4. main.js        (siempre, al final)
 */

document.addEventListener('DOMContentLoaded', () => {

    /* ─── EFECTO HOVER EN BOTONES ─────────────────────
       Añade micro-animación a todos los botones que
       aún no tienen transform definido en CSS.
    ─────────────────────────────────────────────── */
    document.querySelectorAll('.btn, .btn-secondary, .btn-sm').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.filter = 'brightness(1.07)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.filter = '';
        });
    });

    /* ─── EFECTO EN IMÁGENES DE PRODUCTO ──────────────
       Al hacer click en un placeholder de imagen,
       simula que se "cargó" la imagen.
    ─────────────────────────────────────────────── */
    document.querySelectorAll('.product-image, .product-thumb').forEach(img => {
        img.addEventListener('click', function () {
            this.innerHTML = '🖼️';
            this.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';
            this.style.color = 'white';
        });
    });

    /* ─── CATEGORÍAS SIDEBAR ──────────────────────────
       Resalta la categoría clickeada.
    ─────────────────────────────────────────────── */
    /* ─── CATEGORÍAS SIDEBAR ──────────────────────────
       Filtra el catálogo por la categoría seleccionada.
    ─────────────────────────────────────────────── */
    const categoryItems = document.querySelectorAll('.category-list li');
    categoryItems.forEach(item => {
        item.addEventListener('click', function () {
            const isAlreadyActive = this.classList.contains('active');
            
            categoryItems.forEach(i => i.classList.remove('active'));
            
            let id_categoria = null;
            if (!isAlreadyActive) {
                this.classList.add('active');
                id_categoria = this.getAttribute('data-id');
            }

            // Llamar a loadCatalog con el filtro de categoría
            // (Si hay un precio ya seleccionado, deberíamos mantenerlo, 
            // pero para simplificar por ahora solo filtramos categoría)
            const precioMax = document.getElementById('price-range')?.value;
            if (typeof loadCatalog === 'function') {
                loadCatalog({ id_categoria, precioMax });
            }
        });
    });

    /* ─── FILTRO DE PRECIO ─────────────────────────────
       Filtra localmente las publicaciones cargadas.
    ─────────────────────────────────────────────── */
    const priceRange = document.getElementById('price-range');
    const priceValue = document.getElementById('price-value');

    if (priceRange && priceValue) {
        priceRange.addEventListener('input', (e) => {
            const val = e.target.value;
            priceValue.textContent = `$${Number(val).toLocaleString('es-CO')}`;
        });

        priceRange.addEventListener('change', (e) => {
            const activeCat = document.querySelector('.category-list li.active');
            const id_categoria = activeCat ? activeCat.getAttribute('data-id') : null;
            
            if (typeof loadCatalog === 'function') {
                loadCatalog({ id_categoria, precioMax: e.target.value });
            }
        });
    }

    /* ─── FADE-IN DE PÁGINA ───────────────────────────
       Aplica animación de entrada al wrapper principal.
    ─────────────────────────────────────────────── */
    const wrapper = document.querySelector('.page-wrapper');
    if (wrapper) {
        wrapper.style.animation = 'fadeInUp 0.4s ease';
    }

    /* ─── PERFIL DE USUARIO EN PANEL ─────────────────
       Si existe .profile-name, cargar datos.
    ─────────────────────────────────────────────── */
    const profileName = document.querySelector('.profile-name');
    if (profileName) {
        (async () => {
            try {
                const meRes = await apiFetch('/auth/me');
                if (meRes && meRes.usuario) {
                    const user = meRes.usuario;
                    
                    // Llenar datos básicos del DOM
                    const nameEl = document.querySelector('.profile-name');
                    const infoEl = document.querySelector('.profile-info');

                    if (nameEl) nameEl.textContent = `${user.nombre} ${user.apellido}`;
                    if (infoEl) {
                        infoEl.innerHTML = `
                            <p><strong>Email:</strong> ${user.correo}</p>
                            <p><strong>Rol:</strong> ${user.rol.toUpperCase()}</p>
                            <p><strong>Miembro desde:</strong> ${new Date(user.fecha_registro).toLocaleDateString()}</p>
                            <p><strong>Estado:</strong> ${user.estado_cuenta}</p>
                        `;
                    }

                    // Llamar independientemente al endpoint de Estadísticas completas
                    const stats = await apiFetch('/estadisticas');
                    if (document.getElementById('st-productos')) {
                        document.getElementById('st-productos').innerText = stats.publicacionesActivas;
                        document.getElementById('st-ventas').innerText = stats.ventasCompletadas;
                        document.getElementById('st-favoritos').innerText = stats.favoritosRecibidos + stats.misFavoritosGuardados;
                    }
                }
            } catch (error) {
                console.error("No se pudo cargar perfil", error);
            }
        })();
    }

});
