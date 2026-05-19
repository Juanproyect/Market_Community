/**
 * chat.js - Lógica de Mensajería y Long Polling
 */

document.addEventListener('DOMContentLoaded', () => {

    // Validar sesión
    const token = typeof getToken === 'function' ? getToken() : null;
    if (!token) {
        window.location.href = 'Autentication.html';
        return;
    }

    // Ping inicial para actualizar "ultimo_acceso"
    apiFetch('/auth/ping', { method: 'PUT' }).catch(console.error);

    // Referencias DOM
    const chatListContainer = document.getElementById('chat-list');
    const placeholder = document.getElementById('chat-placeholder');
    const activeChat = document.getElementById('chat-active');
    const chatContainer = document.querySelector('.chat-container');
    
    // Pestañas
    const tabChats = document.getElementById('tab-btn-chats');
    const tabComunidad = document.getElementById('tab-btn-comunidad');
    const communityListContainer = document.getElementById('community-list');
    
    // Header activo
    const activeName = document.getElementById('active-name');
    const activeStatus = document.getElementById('active-status');
    const btnBack = document.getElementById('btn-back-chat');
    
    // Mensajes e Input
    const messagesContainer = document.getElementById('chat-messages');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');

    // Estado local
    let currentChatId = null;
    let poller = null;
    let pingInterval = null;
    let myUserId = null;

    // Inicializar
    iniciar();

    async function iniciar() {
        try {
            const meRes = await apiFetch('/auth/me');
            myUserId = meRes.usuario.id_usuario;

            await cargarListaChats();

            // Configurar Polling para refrescar la lista general y el chat activo (cada 4 segundos)
            poller = setInterval(() => {
                cargarListaChats(false); // false = silenciar spinner
                if (currentChatId) {
                    cargarMensajes(currentChatId, false);
                }
            }, 4000);

            // Ping constante para mantenernos "En Línea" (cada 30 segundos)
            pingInterval = setInterval(() => {
                apiFetch('/auth/ping', { method: 'PUT' }).catch(console.error);
            }, 30000);

            // Cargar comunidad por primera vez
            cargarComunidad();

            // Eventos de pestañas
            tabChats.addEventListener('click', () => {
                tabChats.classList.add('active');
                tabComunidad.classList.remove('active');
                chatListContainer.classList.remove('hidden');
                communityListContainer.classList.add('hidden');
            });

            tabComunidad.addEventListener('click', () => {
                tabComunidad.classList.add('active');
                tabChats.classList.remove('active');
                communityListContainer.classList.remove('hidden');
                chatListContainer.classList.add('hidden');
            });

        } catch (error) {
            console.error('Error inicializando chat:', error);
            alert('Error cargando el chat.');
        }
    }

    async function cargarListaChats(showLoader = true) {
        try {
            if (showLoader && !currentChatId) chatListContainer.innerHTML = '<div style="padding:20px;text-align:center;">Cargando...</div>';
            
            const chats = await apiFetch('/chats');
            
            if (chats.length === 0) {
                chatListContainer.innerHTML = '<div style="padding:20px;text-align:center;color:gray;"><img src="img/img_favoritos.png" alt="Sin mensajes" style="max-width:100px; margin-bottom:1rem;"><br>Aún no tienes mensajes.</div>';
                return;
            }

            let html = '';
            chats.forEach(c => {
                const contacto = c.contacto;
                const isActive = (c.id_chat === currentChatId) ? 'active' : '';
                
                // Indicador de conexión
                const indicatorClass = contacto.en_linea ? 'indicator-online' : 'indicator-offline';

                // Badge de no leídos
                const unreadBadge = (c.no_leidos && c.no_leidos > 0 && c.id_chat !== currentChatId) 
                    ? `<div class="unread-badge">${c.no_leidos}</div>` 
                    : '';

                html += `
                    <div class="chat-item ${isActive}" data-id="${c.id_chat}" data-name="${contacto.nombre}" data-online="${contacto.en_linea}">
                        <div class="chat-avatar">
                            ${contacto.nombre.charAt(0).toUpperCase()}
                            <div class="${indicatorClass}"></div>
                        </div>
                        <div class="chat-item-info">
                            <h4 class="chat-item-name">${contacto.nombre}</h4>
                            <span class="chat-item-date">${contacto.en_linea ? '<span style="color:var(--color-success);font-size:0.8rem;">En línea</span>' : '<span style="color:var(--color-text-light);font-size:0.8rem;">Desconectado</span>'}</span>
                        </div>
                        ${unreadBadge}
                    </div>
                `;
            });

            chatListContainer.innerHTML = html;

            // Reasignar eventos
            document.querySelectorAll('.chat-item').forEach(item => {
                item.addEventListener('click', () => {
                    const idChat = parseInt(item.getAttribute('data-id'));
                    const nombre = item.getAttribute('data-name');
                    const online = item.getAttribute('data-online') === 'true';
                    seleccionarChat(idChat, nombre, online);
                });
            });

        } catch (error) {
            console.error(error);
            if (showLoader) chatListContainer.innerHTML = '<div style="padding:20px;text-align:center;color:red;">Error cargando contactos.</div>';
        }
    }

    async function cargarComunidad() {
        try {
            const publicaciones = await apiFetch('/publicaciones');
            
            // Extraer vendedores únicos
            const mapVendedores = new Map();
            publicaciones.forEach(pub => {
                if (pub.vendedor && pub.vendedor.id_usuario !== myUserId) {
                    if (!mapVendedores.has(pub.vendedor.id_usuario)) {
                        mapVendedores.set(pub.vendedor.id_usuario, {
                            id_usuario: pub.vendedor.id_usuario,
                            nombre: pub.vendedor.nombre,
                            total_pubs: 1
                        });
                    } else {
                        mapVendedores.get(pub.vendedor.id_usuario).total_pubs++;
                    }
                }
            });

            const vendedores = Array.from(mapVendedores.values());

            if (vendedores.length === 0) {
                communityListContainer.innerHTML = '<div style="padding:20px;text-align:center;color:gray;">No hay vendedores activos.</div>';
                return;
            }

            let html = '';
            vendedores.forEach(v => {
                html += `
                    <div class="chat-item" onclick="window.contactarNuevaPersona(${v.id_usuario}, '${v.nombre}')">
                        <div class="chat-avatar">
                            ${v.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div class="chat-item-info">
                            <h4 class="chat-item-name">${v.nombre}</h4>
                            <span class="chat-item-date">${v.total_pubs} producto(s) publicado(s)</span>
                        </div>
                    </div>
                `;
            });

            communityListContainer.innerHTML = html;

        } catch (error) {
            console.error('Error cargando comunidad:', error);
            communityListContainer.innerHTML = '<div style="padding:20px;text-align:center;color:red;">Error al cargar comunidad.</div>';
        }
    }

    window.contactarNuevaPersona = async function(id_usuario_receptor, nombre) {
        try {
            const res = await apiFetch('/chats/iniciar', { 
                method: 'POST',
                body: JSON.stringify({ id_usuario_receptor })
            });
            
            // Regresar a la pestaña de chats visualmente
            tabChats.click();
            
            // Cargar la lista de chats para que aparezca
            await cargarListaChats(true);
            
            // Seleccionar inmediatamente el chat activo (asumimos offline de inicio hasta que responda)
            if (res.chat && res.chat.id_chat) {
                seleccionarChat(res.chat.id_chat, nombre, false);
            }

        } catch (err) {
            alert('Error al contactar persona: ' + err.message);
        }
    };

    function seleccionarChat(idChat, nombre, online) {
        currentChatId = idChat;
        
        // UI Updates
        placeholder.classList.add('hidden');
        activeChat.classList.remove('hidden');
        chatContainer.classList.add('chat-open'); // Para móviles

        // Header Updates
        activeName.textContent = nombre;
        if (online) {
            activeStatus.textContent = "En línea";
            activeStatus.className = "chat-status status-text-online";
        } else {
            activeStatus.textContent = "Desconectado";
            activeStatus.className = "chat-status status-text-offline";
        }

        // Marcar activo en la lista (visualmente inmediato)
        document.querySelectorAll('.chat-item').forEach(i => i.classList.remove('active'));
        const el = document.querySelector(`.chat-item[data-id="${idChat}"]`);
        if (el) el.classList.add('active');

        // Cargar mensajes
        cargarMensajes(idChat, true);
    }

    async function cargarMensajes(idChat, forceScroll = false) {
        try {
            const mensajes = await apiFetch(`/chats/${idChat}/mensajes`);
            
            // Renderizar
            let html = '';
            mensajes.forEach(m => {
                const isMine = (m.id_emisor === myUserId);
                const bubbleClass = isMine ? 'msg-sent' : 'msg-received';
                
                // Formatear hora localmente
                const fecha = new Date(m.fecha_envio);
                const horaStr = fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                html += `
                    <div class="msg-bubble ${bubbleClass}">
                        ${m.mensaje}
                        <span class="msg-time">${horaStr}</span>
                    </div>
                `;
            });

            // Solo actualizar si hay cambios o si forzamos scroll (para evitar parpadeos y pérdida de selección)
            // Una técnica simple es comparar el HTML si no es gigante.
            if (messagesContainer.innerHTML !== html) {
                messagesContainer.innerHTML = html;
                
                // Auto-scroll al fondo
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            } else if (forceScroll) {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }

        } catch (error) {
            console.error(error);
        }
    }

    // Enviar mensaje
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const texto = chatInput.value.trim();
        if (!texto || !currentChatId) return;

        // Limpiar input inmediatamente (UX)
        chatInput.value = '';
        chatInput.focus();

        try {
            await apiFetch(`/chats/${currentChatId}/mensajes`, {
                method: 'POST',
                body: JSON.stringify({ texto })
            });

            // Forzar recarga de mensajes inmediatamente en lugar de esperar el poller
            cargarMensajes(currentChatId, true);
        } catch (error) {
            console.error('Error al enviar:', error);
            alert('Error al enviar mensaje');
        }
    });

    // Botón volver (Mobile)
    btnBack.addEventListener('click', () => {
        chatContainer.classList.remove('chat-open');
        currentChatId = null;
    });

});
