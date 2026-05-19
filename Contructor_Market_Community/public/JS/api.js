/**
 * api.js — Capa de comunicación con el Backend (Servicio HTTP)
 * Market Community | Arquitectura Modular v1.0
 */

const API_BASE_URL = '/api';

/**
 * Obtiene el token guardado en la sesión activa del navegador.
 * @returns {string|null}
 */
function getToken() {
    return localStorage.getItem('mc_token');
}

/**
 * Guarda el token en la sesión.
 * @param {string} token 
 */
function saveToken(token) {
    localStorage.setItem('mc_token', token);
}

/**
 * Borra el token (Cerrar sesión).
 */
function removeToken() {
    localStorage.removeItem('mc_token');
}

/**
 * Función central para realizar peticiones HTTP (Fetch wrapper).
 * Inyecta automáticamente el token de seguridad si existe.
 * 
 * @param {string} endpoint - Ruta relativa al backend (ej: '/auth/login')
 * @param {object} options - Opciones nativas de fetch (method, body, headers, etc)
 * @returns {Promise<any>}
 */
async function apiFetch(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Preparar headers por defecto
    const headers = { ...options.headers };
    
    // Si no es FormData (que el navegador configura automáticamente), definimos JSON
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    // Si hay un token guardado, añadirlo al header de Autorización
    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Realizar la petición
    try {
        const response = await fetch(url, {
            ...options,
            headers
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            // Si el backend retornó un error estructurado, lanzarlo
            const errorMessage = data && data.error ? data.error : `Error en el servidor: ${response.statusText}`;
            throw new Error(errorMessage);
        }

        return data; // Retorna los datos parseados si todo sale bien
    } catch (error) {
        // Lanzamos el error capturado para manejarlo localmente en la interfaz
        throw error;
    }
}
