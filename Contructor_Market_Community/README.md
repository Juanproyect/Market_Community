# 🛍️ Market Community

Bienvenido al repositorio oficial de **Market Community**, una plataforma web Full-Stack diseñada para fomentar la economía circular mediante la compra, venta, donación e intercambio de ropa y accesorios. 

## 🚀 Sobre el Proyecto

Market Community permite a los usuarios:
- 👗 **Subir artículos de segunda mano** para la venta o donación.
- 🛒 **Añadir productos a un carrito** y visualizar el pago (Integración de Checkout).
- ❤️ **Guardar productos en Favoritos** para consultar más tarde.
- 📊 **Panel de Usuario Dinámico** con historial de ventas, compras y estadísticas en tiempo real.
- 💬 **Sistemas de Chat y Soporte** (Estructura lista y funcional en API).

El proyecto fue desarrollado utilizando una arquitectura moderna enfocándola a la separación de responsabilidades:
- **Frontend (Cliente):** HTML5 Semántico, Vanilla JavaScript y CSS3 Modular.
- **Backend (Servidor):** API REST robusta construida con Node.js y Express.
- **Base de Datos (Transaccional):** ORM Sequelize conectado a MySQL 8.0+.

---

## 🛠️ Tecnologías y Dependencias
### Frontend Stack
*   `HTML5`, `CSS3` (Estructurado por Layouts y Componentes).
*   `ECMAScript 2021+` (Módulo Centralizado en `api.js` usando `Fetch API`).

### Backend Stack
*   [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/) (Controladores robustos y enrutamiento modular).
*   [Sequelize](https://sequelize.org/) (Modelos asíncronos y relaciones N:M, 1:N).
*   [MySQL](https://www.mysql.com/) (Motor de persistencia de datos relacional).
*   `jsonwebtoken` & `bcryptjs` (Autenticación por Token Seguro).
*   `multer` (Para el procesamiento integral y seguro de subida de imágenes).

---

## 💻 Guía de Instalación y Uso (Desarrollo Local)

Sigue estos pasos para arrancar el entorno tú mismo:

### 1. Preparar la Base de Datos
1. Asegúrate de tener **XAMPP** o cualquier servidor **MySQL** instalado y ejecutándose en el puerto `3306`.
2. Opcional: Inyecta el script que se encuentra en `BD_SQL/BD_market_Comunity_MySql.sql` en tu Base de datos para recrear las tablas base.
   
### 2. Levantar el Backend
1. Abre tu terminal y navega hasta la carpeta del servidor:
   ```bash
   cd Contructor_Market_Community/backend
   ```
2. Instala las dependencias necesarias:
   ```bash
   npm install
   ```
3. Prepara tu archivo de entorno `backend/.env`. Aquí te mostramos un ejemplo resumido:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=ropa_donacion
   DB_USER=root
   DB_PASS=
   JWT_SECRET=tu_secreto_super_seguro
   JWT_EXPIRES_IN=7d
   ```
4. Inicializa el servidor central con **Nodemon** (En caliente):
   ```bash
   npm run dev
   ```
   *Deberías recibir el mensaje "Conexión exitosa a la base de datos MySQL" si tu `.env` está configurado correctamente.*

### 3. Conectar el Frontend
Gracias a la estructura descentralizada, no necesitas ejecutar ningún framework frontal (Zero build steps en frontend).
Simplemente abre tu carpeta raíz en [VS Code](https://code.visualstudio.com/) y usa la extensión **Live Server** para lanzar cualquier archivo de la estructura `INDEX/` (ej: `Home.html`).


---

## 🧱 Estructura de Fases Completada (Roadmap MVP)

- [x] **Fase 1 al 4**: Arquitectura DB, Auth Middleware (JWT), Subida de Archivos y CRUD Catálogo.
- [x] **Fase 5 y 6**: Rutas enlazadas para Favoritos, Carritos, Panel de Stats (`/api/estadisticas`) y sistema base de Chat+Soporte.
- [x] **Fase 7**: Intercepción nativa de Forms y conexión cruzada Full-Stack en DOM vía localstorage `mc_token`.

---

> Desplegado y construido iterativamente para Market Community v1.0.
