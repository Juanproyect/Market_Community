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

            const res = await apiFetch('/carrito');
            
            if (res && res.detalles) {
                renderizarCarrito(res.detalles, res.total || 0);
            } else {
                cartContainer.innerHTML = '<div class="empty-cart-message">Tu carrito está vacío.</div>';
            }

        } catch (error) {
            console.error("Error al cargar el carrito:", error);
            cartContainer.innerHTML = `<div class="empty-cart-message error">${error.message || 'Hubo un error al cargar el carrito.'}</div>`;
        }
    }

    // 2. Renderizar Elementos
    function renderizarCarrito(detalles, totalBackend) {
        // Recalcular total visualmente para mayor precisión en caso de datos de prueba antiguos
        let total = 0;
        detalles.forEach(d => {
            if (d.producto && d.producto.tipo !== 'donacion') {
                total += Number(d.producto.precio || 0);
            }
        });
        
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
                <img src="${imagen}" alt="${pub.titulo}" class="cart-item-img" onerror="this.src='img/logo_MC_Verde.png'">
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
            const res = await apiFetch(`/carrito/remover/${id_publicacion}`, { method: 'DELETE' });
            if (res.mensaje) {
                // Recargar carrito
                cargarCarrito();
            }
        } catch (error) {
            console.error("Error al remover item:", error);
            alert(`Error al remover: ${error.message}`);
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

    // 4b. Manejo de métodos de pago
    const radiosMetodoPago = document.querySelectorAll('input[name="payment_method"]');
    const cardDetailsSection = document.getElementById('card-details-section');
    const altPaymentMsg = document.getElementById('alt-payment-msg');
    
    radiosMetodoPago.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'tarjeta_credito_test') {
                cardDetailsSection.style.display = 'block';
                altPaymentMsg.style.display = 'none';
                // Restaurar required
                document.getElementById('card-name').required = true;
                document.getElementById('card-number').required = true;
                document.getElementById('card-exp').required = true;
                document.getElementById('card-cvc').required = true;
            } else {
                cardDetailsSection.style.display = 'none';
                altPaymentMsg.style.display = 'block';
                // Quitar required
                document.getElementById('card-name').required = false;
                document.getElementById('card-number').required = false;
                document.getElementById('card-exp').required = false;
                document.getElementById('card-cvc').required = false;
            }
        });
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

            const selectedMethod = document.querySelector('input[name="payment_method"]:checked').value;

            // Llamada al backend para el checkout (se lleva todo el carrito)
            const payload = {
                metodo_pago: selectedMethod
            };

            const res = await apiFetch('/carrito/checkout', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (res.mensaje) {
                // Pago exitoso! Pasamos currentTotal calculado en frontend
                mostrarRecibo(res.numero_recibo, currentTotal);
            }

        } catch (error) {
            console.error("Error en checkout:", error);
            alert(`Error procesando pago: ${error.message}`);
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
