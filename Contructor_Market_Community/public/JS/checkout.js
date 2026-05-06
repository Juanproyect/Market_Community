/**
 * checkout.js - Lógica del Carrito y Pasarela de Pago Simulada
 */

document.addEventListener('DOMContentLoaded', () => {
    // Referencias DOM
    const cartContainer = document.getElementById('cart-items-container');
    const cartCount = document.getElementById('cart-count');
    const summarySubtotal = document.getElementById('summary-subtotal');
    const summaryTotal = document.getElementById('summary-total');
    const btnPay = document.getElementById('btn-pay');
    const btnPayAmount = document.getElementById('btn-pay-amount');
    const paymentForm = document.getElementById('payment-form');
    
    // Modal Success
    const successModal = document.getElementById('success-modal');
    const receiptNumber = document.getElementById('receipt-number');
    const receiptTotal = document.getElementById('receipt-total');
    const btnContinue = document.getElementById('btn-continue-shopping');

    // Estado del carrito
    let currentTotal = 0;

    // Verificar si el usuario está autenticado antes de cargar el carrito
    const token = localStorage.getItem('mc_token');
    if (!token) {
        window.location.href = 'Autentication.html';
        return;
    }

    // Inicializar
    cargarCarrito();

    // 1. Cargar Carrito desde Backend
    async function cargarCarrito() {
        try {
            cartContainer.innerHTML = '<div class="empty-cart-message">Cargando carrito...</div>';
            btnPay.disabled = true;

            const res = await API.get('/api/carrito');
            
            if (res.error) {
                cartContainer.innerHTML = `<div class="empty-cart-message error">${res.error}</div>`;
                return;
            }

            renderizarCarrito(res.detalles || [], res.total || 0);

        } catch (error) {
            console.error("Error al cargar el carrito:", error);
            cartContainer.innerHTML = '<div class="empty-cart-message error">Hubo un error al cargar el carrito.</div>';
        }
    }

    // 2. Renderizar Elementos
    function renderizarCarrito(detalles, total) {
        currentTotal = total;
        cartCount.textContent = detalles.length;
        
        // Formatear moneda COP
        const formatearMoneda = (val) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(val);

        summarySubtotal.textContent = formatearMoneda(total);
        summaryTotal.textContent = formatearMoneda(total);
        btnPayAmount.textContent = formatearMoneda(total);

        if (detalles.length === 0) {
            cartContainer.innerHTML = `
                <div class="empty-cart-message">
                    Tu carrito está vacío.<br>
                    <a href="Home.html" style="color:var(--color-primary);text-decoration:underline;margin-top:10px;display:inline-block;">Ir al catálogo</a>
                </div>`;
            btnPay.disabled = true;
            return;
        }

        // Habilitar botón si hay items
        btnPay.disabled = false;
        cartContainer.innerHTML = '';

        detalles.forEach(d => {
            const pub = d.producto;
            const imagen = (pub.imagenes && pub.imagenes.length > 0) ? `/uploads/${pub.imagenes[0].ruta_imagen}` : 'img/placeholder.png';
            const precioTxt = pub.tipo === 'donacion' ? 'GRATIS' : formatearMoneda(pub.precio);

            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <img src="${API.BASE_URL}${imagen}" alt="${pub.titulo}" class="cart-item-img" onerror="this.src='img/logo_MC_Verde.png'">
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${pub.titulo}</h4>
                    <span class="badge ${pub.tipo === 'donacion' ? 'badge-donacion' : 'badge-compraventa'}">${pub.tipo}</span>
                    <div class="cart-item-price" style="margin-top:5px;">${precioTxt}</div>
                </div>
                <button class="cart-item-remove" data-id="${pub.id_publicacion}" title="Quitar del carrito">🗑️</button>
            `;
            cartContainer.appendChild(div);
        });

        // EventListeners para los botones de eliminar
        document.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id_pub = e.currentTarget.getAttribute('data-id');
                await removerItem(id_pub);
            });
        });
    }

    // 3. Remover Item
    async function removerItem(id_publicacion) {
        try {
            const res = await API.delete(`/api/carrito/remover/${id_publicacion}`);
            if (res.mensaje) {
                // Recargar carrito
                cargarCarrito();
            } else {
                alert(res.error || 'Error al remover el artículo.');
            }
        } catch (error) {
            console.error("Error al remover item:", error);
            alert("Error de conexión al intentar remover el artículo.");
        }
    }

    // 4. Formatear y validar inputs de tarjeta (Mock UX)
    const cardNumber = document.getElementById('card-number');
    cardNumber.addEventListener('input', function (e) {
        // Remover todo lo que no sea número
        let value = e.target.value.replace(/\D/g, '');
        // Agregar espacio cada 4 dígitos
        value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
        e.target.value = value;
    });

    const cardExp = document.getElementById('card-exp');
    cardExp.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        e.target.value = value;
    });

    const cardCvc = document.getElementById('card-cvc');
    cardCvc.addEventListener('input', function (e) {
        e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
    });

    // 5. Procesar Pago
    paymentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (currentTotal === 0 && document.querySelectorAll('.cart-item').length === 0) {
            alert("Tu carrito está vacío.");
            return;
        }

        // UX: Cambiar estado del botón
        const originalText = btnPay.innerHTML;
        btnPay.innerHTML = 'Procesando... <span class="spinner" style="display:inline-block;animation:spin 1s linear infinite;">⏳</span>';
        btnPay.disabled = true;

        try {
            // Simulamos un delay de red de pasarela de pago para dar sensación de procesamiento
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Llamada al backend para el checkout (se lleva todo el carrito)
            const payload = {
                metodo_pago: 'tarjeta_credito_test'
            };

            const res = await API.post('/api/carrito/checkout', payload);

            if (res.mensaje) {
                // Pago exitoso!
                mostrarRecibo(res.numero_recibo, res.pagado);
            } else {
                alert(res.error || "Ocurrió un error al procesar el pago.");
                btnPay.innerHTML = originalText;
                btnPay.disabled = false;
            }

        } catch (error) {
            console.error("Error en checkout:", error);
            alert("Ocurrió un error inesperado al conectar con el servidor.");
            btnPay.innerHTML = originalText;
            btnPay.disabled = false;
        }
    });

    // 6. Mostrar Modal de Éxito
    function mostrarRecibo(numeroRecibo, totalPagado) {
        receiptNumber.textContent = `#MC-${numeroRecibo.toString().padStart(6, '0')}`;
        receiptTotal.textContent = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(totalPagado);
        successModal.classList.remove('hidden');
    }

    // 7. Continuar comprando
    btnContinue.addEventListener('click', () => {
        window.location.href = 'Home.html';
    });
});
