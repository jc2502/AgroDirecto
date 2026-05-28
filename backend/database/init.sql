PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE
);

INSERT OR IGNORE INTO roles (nombre) VALUES
('PRODUCTOR'), ('COMPRADOR'), ('TRANSPORTISTA'), ('ADMIN');

CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rol_id INTEGER NOT NULL,
    nombre_completo TEXT NOT NULL,
    correo TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    celular TEXT NOT NULL,
    foto_perfil TEXT,
    estado_verificacion TEXT NOT NULL DEFAULT 'REGISTRADO'
        CHECK (estado_verificacion IN ('REGISTRADO','PENDIENTE','VERIFICADO','RECHAZADO')),
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rol_id) REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS productores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL UNIQUE,
    tipo_productor TEXT NOT NULL,
    nombre_finca TEXT NOT NULL,
    municipio TEXT, provincia TEXT, departamento TEXT,
    experiencia_anios INTEGER,
    tipo_documento TEXT, numero_documento TEXT,
    latitud REAL, longitud REAL, localidad TEXT,
    promedio_calificacion REAL DEFAULT 0,
    total_calificaciones INTEGER DEFAULT 0,
    total_ventas INTEGER DEFAULT 0,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS compradores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL UNIQUE,
    tipo_comprador TEXT NOT NULL,
    nombre_negocio TEXT, ciudad_compra TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS transportistas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL UNIQUE,
    tipo_transporte TEXT NOT NULL,
    capacidad_carga REAL NOT NULL,
    zona_operacion TEXT, licencia_conducir TEXT, placa_vehiculo TEXT,
    promedio_calificacion REAL DEFAULT 0,
    total_calificaciones INTEGER DEFAULT 0,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS documentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    tipo_documento TEXT NOT NULL,
    archivo TEXT NOT NULL,
    estado TEXT DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE','APROBADO','RECHAZADO')),
    comentario_admin TEXT,
    fecha_subida DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_revision DATETIME,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS categorias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE
);
INSERT OR IGNORE INTO categorias (nombre) VALUES
('Hortalizas'), ('Frutas'), ('Granos'), ('Tubérculos'), ('Lácteos'), ('Otros');

CREATE TABLE IF NOT EXISTS productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    productor_id INTEGER NOT NULL, categoria_id INTEGER NOT NULL,
    nombre TEXT NOT NULL, variedad TEXT,
    cantidad_disponible REAL NOT NULL, unidad_medida TEXT NOT NULL,
    precio REAL NOT NULL, descripcion TEXT,
    estado TEXT DEFAULT 'DISPONIBLE' CHECK (estado IN ('DISPONIBLE','AGOTADO','PREVENTA')),
    fecha_publicacion DATETIME DEFAULT CURRENT_TIMESTAMP, fecha_disponibilidad DATE,
    FOREIGN KEY (productor_id) REFERENCES productores(id),
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

CREATE TABLE IF NOT EXISTS producto_imagenes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    producto_id INTEGER NOT NULL, ruta_imagen TEXT NOT NULL,
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

CREATE TABLE IF NOT EXISTS reservas_preventa (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    producto_id INTEGER NOT NULL, comprador_id INTEGER NOT NULL,
    cantidad REAL NOT NULL, fecha_reserva DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id),
    FOREIGN KEY (comprador_id) REFERENCES compradores(id)
);

CREATE TABLE IF NOT EXISTS alertas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    comprador_id INTEGER NOT NULL, categoria_id INTEGER, producto_nombre TEXT,
    activa INTEGER DEFAULT 1,
    FOREIGN KEY (comprador_id) REFERENCES compradores(id),
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

CREATE TABLE IF NOT EXISTS precios_referencia (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    producto_nombre TEXT NOT NULL, precio_referencia REAL NOT NULL,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS carritos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    comprador_id INTEGER NOT NULL, fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comprador_id) REFERENCES compradores(id)
);

CREATE TABLE IF NOT EXISTS carrito_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    carrito_id INTEGER NOT NULL, producto_id INTEGER NOT NULL,
    cantidad REAL NOT NULL,
    FOREIGN KEY (carrito_id) REFERENCES carritos(id),
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    comprador_id INTEGER NOT NULL,
    estado TEXT DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE','CONFIRMADO','PAGO_PENDIENTE','PAGO_VERIFICACION','LISTO_DESPACHO','EN_CAMINO','COMPLETADO','CANCELADO')),
    monto_total REAL NOT NULL, fecha_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comprador_id) REFERENCES compradores(id)
);

CREATE TABLE IF NOT EXISTS pedido_detalles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pedido_id INTEGER NOT NULL, producto_id INTEGER NOT NULL,
    cantidad REAL NOT NULL, precio_unitario REAL NOT NULL, subtotal REAL NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

CREATE TABLE IF NOT EXISTS pagos_qr (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pedido_id INTEGER NOT NULL UNIQUE,
    codigo_qr TEXT NOT NULL, referencia TEXT NOT NULL UNIQUE, monto REAL NOT NULL,
    fecha_generacion DATETIME DEFAULT CURRENT_TIMESTAMP, fecha_expiracion DATETIME,
    estado TEXT DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO','VENCIDO','PAGADO')),
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
);

CREATE TABLE IF NOT EXISTS comprobantes_pago (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pedido_id INTEGER NOT NULL, archivo TEXT NOT NULL, comentario TEXT,
    fecha_subida DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
);

CREATE TABLE IF NOT EXISTS postulaciones_flete (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pedido_id INTEGER NOT NULL, transportista_id INTEGER NOT NULL,
    estado TEXT DEFAULT 'POSTULADO' CHECK (estado IN ('POSTULADO','ACEPTADO','RECHAZADO')),
    fecha_postulacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
    FOREIGN KEY (transportista_id) REFERENCES transportistas(id)
);

CREATE TABLE IF NOT EXISTS hojas_ruta (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pedido_id INTEGER NOT NULL, transportista_id INTEGER NOT NULL,
    ruta_maps TEXT, estado TEXT DEFAULT 'EN_PROCESO' CHECK (estado IN ('EN_PROCESO','FINALIZADA')),
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
    FOREIGN KEY (transportista_id) REFERENCES transportistas(id)
);

CREATE TABLE IF NOT EXISTS ruta_paradas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hoja_ruta_id INTEGER NOT NULL, productor_id INTEGER NOT NULL,
    orden_parada INTEGER NOT NULL, hora_recoleccion DATETIME, foto_confirmacion TEXT,
    FOREIGN KEY (hoja_ruta_id) REFERENCES hojas_ruta(id),
    FOREIGN KEY (productor_id) REFERENCES productores(id)
);

CREATE TABLE IF NOT EXISTS entregas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pedido_id INTEGER NOT NULL UNIQUE,
    estado TEXT DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE','ENTREGADO','RECLAMO')),
    comentario TEXT, foto_reclamo TEXT, fecha_entrega DATETIME,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
);

CREATE TABLE IF NOT EXISTS firmas_digitales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entrega_id INTEGER NOT NULL, archivo_firma TEXT NOT NULL,
    latitud REAL, longitud REAL, fecha_firma DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (entrega_id) REFERENCES entregas(id)
);

CREATE TABLE IF NOT EXISTS calificaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pedido_id INTEGER NOT NULL, comprador_id INTEGER NOT NULL,
    productor_id INTEGER, transportista_id INTEGER,
    puntuacion INTEGER NOT NULL CHECK (puntuacion BETWEEN 1 AND 5), comentario TEXT,
    fecha_calificacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
    FOREIGN KEY (comprador_id) REFERENCES compradores(id),
    FOREIGN KEY (productor_id) REFERENCES productores(id),
    FOREIGN KEY (transportista_id) REFERENCES transportistas(id)
);

CREATE TABLE IF NOT EXISTS notificaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL, titulo TEXT NOT NULL, mensaje TEXT NOT NULL,
    leido INTEGER DEFAULT 0, fecha_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS historial_pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pedido_id INTEGER NOT NULL, estado TEXT NOT NULL, comentario TEXT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
);
