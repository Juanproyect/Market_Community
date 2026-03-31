-- ============================================================
--  BASE DE DATOS: Market Community
--  Motor: MySQL 8.0+
--  Descripción: Plataforma de compra, venta y donación de ropa
--  Fuente: Diagrama ER MySQL Workbench + Diagrama UML de Clases
--  Versión: 1.0
-- ============================================================

-- Crear y seleccionar la base de datos
CREATE DATABASE IF NOT EXISTS market_community
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE market_community;

-- ────────────────────────────────────────────────────────────
--  TABLA: usuario
--  Entidad central del sistema. Roles: administrador,
--  vendedor, comprador.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuario (
    id_usuario      INT(11)      NOT NULL AUTO_INCREMENT,
    nombre          VARCHAR(100) NOT NULL,
    apellido        VARCHAR(100) NOT NULL,
    correo          VARCHAR(100) NOT NULL UNIQUE,
    contrasena      VARCHAR(255) NOT NULL,              -- hash bcrypt
    telefono        VARCHAR(20)  NULL,
    rol             ENUM('administrador','vendedor','comprador') NOT NULL DEFAULT 'comprador',
    estado_cuenta   ENUM('activo','suspendido','bloqueado')      NOT NULL DEFAULT 'activo',
    fecha_registro  DATE         NOT NULL DEFAULT (CURRENT_DATE),
    PRIMARY KEY (id_usuario),
    INDEX idx_correo (correo),
    INDEX idx_rol    (rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ────────────────────────────────────────────────────────────
--  TABLA: categoria
--  Categorías de productos (Camisetas, Pantalones, etc.)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categoria (
    id_categoria INT(11)      NOT NULL AUTO_INCREMENT,
    nombre       VARCHAR(100) NOT NULL UNIQUE,
    descripcion  TEXT         NULL,
    PRIMARY KEY (id_categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ────────────────────────────────────────────────────────────
--  TABLA: publicacion
--  Productos publicados para compra/venta o donación.
--  tipo = 'compraventa' | 'donacion'
--  estado_prenda = condición física de la prenda
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS publicacion (
    id_publicacion   INT(11)       NOT NULL AUTO_INCREMENT,
    titulo           VARCHAR(255)  NOT NULL,
    descripcion      TEXT          NULL,
    talla            VARCHAR(20)   NULL,
    estado_prenda    ENUM('como_nuevo','muy_bueno','bueno','regular') NOT NULL DEFAULT 'bueno',
    tipo             ENUM('compraventa','donacion')                   NOT NULL DEFAULT 'compraventa',
    precio           DECIMAL(10,2) NULL,               -- NULL si es donación
    ubicacion        VARCHAR(150)  NULL,
    estado_pub       ENUM('activa','vendida','donada','pausada','eliminada') NOT NULL DEFAULT 'activa',
    fecha_publicacion DATE         NOT NULL DEFAULT (CURRENT_DATE),
    id_usuario       INT(11)       NOT NULL,
    id_categoria     INT(11)       NOT NULL,
    PRIMARY KEY (id_publicacion),
    INDEX idx_pub_usuario   (id_usuario),
    INDEX idx_pub_categoria (id_categoria),
    INDEX idx_pub_tipo      (tipo),
    INDEX idx_pub_estado    (estado_pub),
    CONSTRAINT fk_pub_usuario
        FOREIGN KEY (id_usuario)   REFERENCES usuario  (id_usuario)   ON DELETE CASCADE,
    CONSTRAINT fk_pub_categoria
        FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ────────────────────────────────────────────────────────────
--  TABLA: imagen
--  Fotos asociadas a cada publicación (máx. 5 por publicación)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS imagen (
    id_imagen      INT(11)      NOT NULL AUTO_INCREMENT,
    ruta_imagen    VARCHAR(255) NOT NULL,
    orden          TINYINT(1)   NOT NULL DEFAULT 1,    -- 1 = imagen principal
    id_publicacion INT(11)      NOT NULL,
    PRIMARY KEY (id_imagen),
    INDEX idx_img_publicacion (id_publicacion),
    CONSTRAINT fk_img_publicacion
        FOREIGN KEY (id_publicacion) REFERENCES publicacion(id_publicacion) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ────────────────────────────────────────────────────────────
--  TABLA: favorito
--  Productos guardados en la lista de favoritos del usuario
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS favorito (
    id_favorito    INT(11) NOT NULL AUTO_INCREMENT,
    id_usuario     INT(11) NOT NULL,
    id_publicacion INT(11) NOT NULL,
    fecha_guardado DATE    NOT NULL DEFAULT (CURRENT_DATE),
    PRIMARY KEY (id_favorito),
    UNIQUE KEY uq_favorito (id_usuario, id_publicacion),
    CONSTRAINT fk_fav_usuario
        FOREIGN KEY (id_usuario)     REFERENCES usuario    (id_usuario)     ON DELETE CASCADE,
    CONSTRAINT fk_fav_publicacion
        FOREIGN KEY (id_publicacion) REFERENCES publicacion(id_publicacion) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ────────────────────────────────────────────────────────────
--  TABLA: carrito
--  Carrito de compras (una sesión de compra por usuario)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS carrito (
    id_carrito     INT(11) NOT NULL AUTO_INCREMENT,
    id_usuario     INT(11) NOT NULL,
    fecha_creacion DATE    NOT NULL DEFAULT (CURRENT_DATE),
    PRIMARY KEY (id_carrito),
    CONSTRAINT fk_carrito_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ────────────────────────────────────────────────────────────
--  TABLA: detalle_carrito
--  Publicaciones agregadas al carrito
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS detalle_carrito (
    id_detalle     INT(11) NOT NULL AUTO_INCREMENT,
    id_carrito     INT(11) NOT NULL,
    id_publicacion INT(11) NOT NULL,
    cantidad       INT(11) NOT NULL DEFAULT 1,
    PRIMARY KEY (id_detalle),
    INDEX idx_dc_carrito (id_carrito),
    CONSTRAINT fk_dc_carrito
        FOREIGN KEY (id_carrito)     REFERENCES carrito    (id_carrito)     ON DELETE CASCADE,
    CONSTRAINT fk_dc_publicacion
        FOREIGN KEY (id_publicacion) REFERENCES publicacion(id_publicacion) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ────────────────────────────────────────────────────────────
--  TABLA: pago
--  Registro de pagos realizados por compradores
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pago (
    id_pago        INT(11)       NOT NULL AUTO_INCREMENT,
    fecha_pago     DATE          NOT NULL DEFAULT (CURRENT_DATE),
    monto          DECIMAL(10,2) NOT NULL,
    metodo_pago    VARCHAR(50)   NOT NULL,              -- 'tarjeta','transferencia','efectivo', etc.
    estado         ENUM('pendiente','completado','fallido','reembolsado') NOT NULL DEFAULT 'pendiente',
    id_usuario     INT(11)       NOT NULL,
    id_publicacion INT(11)       NOT NULL,
    PRIMARY KEY (id_pago),
    INDEX idx_pago_usuario (id_usuario),
    CONSTRAINT fk_pago_usuario
        FOREIGN KEY (id_usuario)     REFERENCES usuario    (id_usuario)     ON DELETE RESTRICT,
    CONSTRAINT fk_pago_publicacion
        FOREIGN KEY (id_publicacion) REFERENCES publicacion(id_publicacion) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ────────────────────────────────────────────────────────────
--  TABLA: chat
--  Conversación entre dos usuarios (emisor y receptor)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat (
    id_chat             INT(11) NOT NULL AUTO_INCREMENT,
    id_usuario_emisor   INT(11) NOT NULL,
    id_usuario_receptor INT(11) NOT NULL,
    fecha_inicio        DATE    NOT NULL DEFAULT (CURRENT_DATE),
    PRIMARY KEY (id_chat),
    INDEX idx_chat_emisor   (id_usuario_emisor),
    INDEX idx_chat_receptor (id_usuario_receptor),
    CONSTRAINT fk_chat_emisor
        FOREIGN KEY (id_usuario_emisor)   REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_chat_receptor
        FOREIGN KEY (id_usuario_receptor) REFERENCES usuario(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ────────────────────────────────────────────────────────────
--  TABLA: mensaje
--  Mensajes individuales dentro de un chat
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mensaje (
    id_mensaje  INT(11)   NOT NULL AUTO_INCREMENT,
    mensaje     TEXT      NOT NULL,
    fecha_envio DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    leido       TINYINT(1) NOT NULL DEFAULT 0,
    id_chat     INT(11)   NOT NULL,
    id_emisor   INT(11)   NOT NULL,
    PRIMARY KEY (id_mensaje),
    INDEX idx_msg_chat   (id_chat),
    INDEX idx_msg_emisor (id_emisor),
    CONSTRAINT fk_msg_chat
        FOREIGN KEY (id_chat)   REFERENCES chat   (id_chat)    ON DELETE CASCADE,
    CONSTRAINT fk_msg_emisor
        FOREIGN KEY (id_emisor) REFERENCES usuario(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ────────────────────────────────────────────────────────────
--  TABLA: resena
--  Calificaciones y reseñas entre usuarios tras una transacción
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resena (
    id_resena           INT(11) NOT NULL AUTO_INCREMENT,
    calificacion        TINYINT(1) NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
    comentario          TEXT       NULL,
    fecha_resena        DATE       NOT NULL DEFAULT (CURRENT_DATE),
    id_usuario_emisor   INT(11)    NOT NULL,
    id_usuario_receptor INT(11)    NOT NULL,
    id_publicacion      INT(11)    NOT NULL,
    PRIMARY KEY (id_resena),
    INDEX idx_res_receptor (id_usuario_receptor),
    CONSTRAINT fk_res_emisor
        FOREIGN KEY (id_usuario_emisor)   REFERENCES usuario    (id_usuario)     ON DELETE CASCADE,
    CONSTRAINT fk_res_receptor
        FOREIGN KEY (id_usuario_receptor) REFERENCES usuario    (id_usuario)     ON DELETE CASCADE,
    CONSTRAINT fk_res_publicacion
        FOREIGN KEY (id_publicacion)      REFERENCES publicacion(id_publicacion) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ────────────────────────────────────────────────────────────
--  TABLA: soporte_plataforma
--  Tickets de soporte técnico generados por usuarios
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS soporte_plataforma (
    id_soporte     INT(11)      NOT NULL AUTO_INCREMENT,
    tipo_problema  VARCHAR(100) NOT NULL,
    descripcion    TEXT         NOT NULL,
    estado         ENUM('abierto','en_proceso','resuelto','cerrado') NOT NULL DEFAULT 'abierto',
    fecha_creacion DATE         NOT NULL DEFAULT (CURRENT_DATE),
    id_usuario     INT(11)      NOT NULL,
    PRIMARY KEY (id_soporte),
    INDEX idx_sop_usuario (id_usuario),
    INDEX idx_sop_estado  (estado),
    CONSTRAINT fk_sop_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ────────────────────────────────────────────────────────────
--  TABLA: reporte_usuario
--  Denuncias entre usuarios (fraude, contenido inapropiado, etc.)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reporte_usuario (
    id_reporte            INT(11) NOT NULL AUTO_INCREMENT,
    motivo                TEXT    NOT NULL,
    fecha_reporte         DATE    NOT NULL DEFAULT (CURRENT_DATE),
    estado                ENUM('pendiente','revisado','resuelto') NOT NULL DEFAULT 'pendiente',
    id_usuario_reportado  INT(11) NOT NULL,
    id_usuario_reportante INT(11) NOT NULL,
    PRIMARY KEY (id_reporte),
    INDEX idx_rep_reportado  (id_usuario_reportado),
    INDEX idx_rep_reportante (id_usuario_reportante),
    CONSTRAINT fk_rep_reportado
        FOREIGN KEY (id_usuario_reportado)  REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_rep_reportante
        FOREIGN KEY (id_usuario_reportante) REFERENCES usuario(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ════════════════════════════════════════════════════════════
--  DATOS INICIALES (Seed Data)
-- ════════════════════════════════════════════════════════════

-- Categorías base
INSERT INTO categoria (nombre, descripcion) VALUES
    ('Camisetas',   'Camisetas, camisas, blusas y tops'),
    ('Pantalones',  'Jeans, pantalones formales y casuales'),
    ('Vestidos',    'Vestidos de todo tipo y ocasión'),
    ('Chaquetas',   'Chaquetas, abrigos y sacos'),
    ('Calzado',     'Zapatos, tenis, botas y sandalias'),
    ('Accesorios',  'Bolsos, cinturones, gorras y joyería'),
    ('Ropa Niños',  'Ropa para niñas y niños'),
    ('Deportiva',   'Ropa y calzado deportivo');


-- Usuario administrador inicial
-- Contraseña: Admin123! (hash bcrypt generado en el backend)
INSERT INTO usuario (nombre, apellido, correo, contrasena, rol, estado_cuenta) VALUES
    ('Admin', 'Market', 'admin@marketcommunity.com',
     '$2b$10$placeholder_hash_cambia_en_produccion',
     'administrador', 'activo');


-- ════════════════════════════════════════════════════════════
--  VISTAS ÚTILES
-- ════════════════════════════════════════════════════════════

-- Vista: publicaciones con info del usuario y categoría
CREATE OR REPLACE VIEW v_publicaciones AS
SELECT
    p.id_publicacion,
    p.titulo,
    p.descripcion,
    p.talla,
    p.estado_prenda,
    p.tipo,
    p.precio,
    p.ubicacion,
    p.estado_pub,
    p.fecha_publicacion,
    c.nombre   AS categoria,
    u.nombre   AS vendedor_nombre,
    u.apellido AS vendedor_apellido,
    u.correo   AS vendedor_correo,
    (SELECT ruta_imagen FROM imagen
     WHERE id_publicacion = p.id_publicacion AND orden = 1
     LIMIT 1) AS imagen_principal
FROM publicacion p
JOIN usuario   u ON p.id_usuario   = u.id_usuario
JOIN categoria c ON p.id_categoria = c.id_categoria
WHERE p.estado_pub = 'activa';


-- Vista: estadísticas por usuario (para el panel de usuario)
CREATE OR REPLACE VIEW v_estadisticas_usuario AS
SELECT
    u.id_usuario,
    u.nombre,
    u.apellido,
    COUNT(DISTINCT p.id_publicacion)                                AS total_publicaciones,
    COUNT(DISTINCT CASE WHEN p.estado_pub = 'vendida' THEN p.id_publicacion END) AS total_ventas,
    COUNT(DISTINCT pa.id_pago)                                      AS total_compras,
    COALESCE(SUM(CASE WHEN pa.estado = 'completado' THEN pa.monto END), 0) AS total_ganado,
    COALESCE(AVG(r.calificacion), 0)                                AS calificacion_promedio
FROM usuario u
LEFT JOIN publicacion p  ON p.id_usuario   = u.id_usuario
LEFT JOIN pago        pa ON pa.id_usuario  = u.id_usuario
LEFT JOIN resena      r  ON r.id_usuario_receptor = u.id_usuario
GROUP BY u.id_usuario, u.nombre, u.apellido;
