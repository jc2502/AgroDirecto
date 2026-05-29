const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const sharp = require('sharp');
const { getConnection } = require('./connection');

async function initializeDatabase() {
    try {
        const db = getConnection();
        const initSqlPath = path.join(__dirname, 'init.sql');
        const initSql = fs.readFileSync(initSqlPath, 'utf-8');
        db.exec(initSql);
        console.log('✅ Esquema de base de datos inicializado correctamente');

        // =========================================
        // MIGRACIONES SPRINT 2
        // =========================================
        try {
            db.exec('ALTER TABLE compradores ADD COLUMN latitud REAL');
            db.exec('ALTER TABLE compradores ADD COLUMN longitud REAL');
            console.log('✅ Migración: Columnas latitud/longitud añadidas a compradores');
        } catch (e) {
            // Ignorar si las columnas ya existen
        }

        try {
            db.exec("ALTER TABLE reservas_preventa ADD COLUMN estado TEXT DEFAULT 'PENDIENTE'");
            console.log('✅ Migración: Columna estado añadida a reservas_preventa');
        } catch (e) {
            // Ignorar si la columna ya existe
        }

        // Tabla de compras directas (productos DISPONIBLE)
        db.exec(`
            CREATE TABLE IF NOT EXISTS compras (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                comprador_id INTEGER NOT NULL,
                producto_id INTEGER NOT NULL,
                cantidad REAL NOT NULL,
                precio_unitario REAL NOT NULL,
                total REAL NOT NULL,
                estado TEXT DEFAULT 'PENDIENTE',
                notas TEXT,
                fecha_compra DATETIME DEFAULT CURRENT_TIMESTAMP,
                fecha_envio DATETIME,
                fecha_entrega DATETIME,
                FOREIGN KEY (comprador_id) REFERENCES compradores(id),
                FOREIGN KEY (producto_id) REFERENCES productos(id)
            )
        `);
        console.log('✅ Tabla compras lista');


        // =========================================
        // GENERACIÓN DE IMAGEN PLACEHOLDER
        // =========================================
        const uploadDir = path.join(__dirname, '../uploads/productos');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        const placeholderPath = path.join(uploadDir, 'placeholder.jpg');
        if (!fs.existsSync(placeholderPath)) {
            try {
                await sharp({
                    create: {
                        width: 600,
                        height: 400,
                        channels: 3,
                        background: { r: 22, g: 163, b: 74 } // color primary-600
                    }
                })
                .jpeg({ quality: 80 })
                .toFile(placeholderPath);
                console.log('✅ Imagen placeholder creada exitosamente');
            } catch (err) {
                console.error('⚠️ Error al generar placeholder:', err.message);
            }
        }

        // =========================================
        // SEEDING SPRINT 2
        // =========================================
        const userCount = db.prepare('SELECT COUNT(*) as count FROM usuarios').get().count;
        if (userCount <= 1) {
            console.log('🌱 Sembrando datos de prueba para AgroDirecto...');
            
            const hashedPassword = bcrypt.hashSync('Test1234', 10);
            const adminPassword = bcrypt.hashSync('Admin1234', 10);

            // 1. Productor: Juan Pérez (Verificado)
            const resProductor = db.prepare(`
                INSERT INTO usuarios (rol_id, nombre_completo, correo, password, celular, estado_verificacion)
                VALUES (1, 'Juan Pérez', 'juan@test.com', ?, '71234567', 'VERIFICADO')
            `).run(hashedPassword);
            const productorUsuarioId = resProductor.lastInsertRowid;

            db.prepare(`
                INSERT INTO productores (usuario_id, tipo_productor, nombre_finca, municipio, provincia, departamento, experiencia_anios, latitud, longitud, localidad, promedio_calificacion, total_calificaciones)
                VALUES (?, 'Pequeño Agricultor', 'Finca El Paraíso', 'Warnes', 'Ignacio Warnes', 'Santa Cruz', 10, -17.5123, -63.1745, 'Warnes', 4.8, 5)
            `).run(productorUsuarioId);
            const productorId = db.prepare('SELECT id FROM productores WHERE usuario_id = ?').get(productorUsuarioId).id;

            // 2. Comprador: María López (Verificado)
            const resComprador = db.prepare(`
                INSERT INTO usuarios (rol_id, nombre_completo, correo, password, celular, estado_verificacion)
                VALUES (2, 'María López', 'maria@test.com', ?, '71234568', 'VERIFICADO')
            `).run(hashedPassword);
            const compradorUsuarioId = resComprador.lastInsertRowid;

            db.prepare(`
                INSERT INTO compradores (usuario_id, tipo_comprador, nombre_negocio, ciudad_compra, latitud, longitud)
                VALUES (?, 'Comercio Local', 'Supermercado Fidalga', 'Santa Cruz de la Sierra', -17.7833, -63.1821)
            `).run(compradorUsuarioId);
            const compradorId = db.prepare('SELECT id FROM compradores WHERE usuario_id = ?').get(compradorUsuarioId).id;

            // 3. Transportista: Pedro Gómez (Verificado)
            const resTrans = db.prepare(`
                INSERT INTO usuarios (rol_id, nombre_completo, correo, password, celular, estado_verificacion)
                VALUES (3, 'Pedro Gómez', 'pedro@test.com', ?, '71234569', 'VERIFICADO')
            `).run(hashedPassword);
            const transportistaUsuarioId = resTrans.lastInsertRowid;

            db.prepare(`
                INSERT INTO transportistas (usuario_id, tipo_transporte, capacidad_carga, zona_operacion, licencia_conducir, placa_vehiculo)
                VALUES (?, 'Camión Mediano', 5000, 'Santa Cruz - Warnes', '458921-SC', '2584-LPA')
            `).run(transportistaUsuarioId);

            // 4. Administrador: admin@test.com
            const existingAdmin = db.prepare('SELECT id FROM usuarios WHERE correo = ?').get('admin@test.com');
            if (!existingAdmin) {
                db.prepare(`
                    INSERT INTO usuarios (rol_id, nombre_completo, correo, password, celular, estado_verificacion)
                    VALUES (4, 'Administrador del Sistema', 'admin@test.com', ?, '70000000', 'VERIFICADO')
                `).run(adminPassword);
            }

            // 5. Productos / Cosechas
            // Producto DISPONIBLE 1: Tomate Perita
            const resP1 = db.prepare(`
                INSERT INTO productos (productor_id, categoria_id, nombre, variedad, cantidad_disponible, unidad_medida, precio, descripcion, estado, fecha_disponibilidad)
                VALUES (?, 1, 'Tomate Perita', 'Perita Seleccionado', 200, 'KILOGRAMO', 6.50, 'Tomate fresco de cultivo hidropónico, de excelente calidad.', 'DISPONIBLE', NULL)
            `).run(productorId);
            db.prepare('INSERT INTO producto_imagenes (producto_id, ruta_imagen) VALUES (?, ?)').run(resP1.lastInsertRowid, 'uploads/productos/placeholder.jpg');

            // Producto DISPONIBLE 2: Papa Harinosa
            const resP2 = db.prepare(`
                INSERT INTO productos (productor_id, categoria_id, nombre, variedad, cantidad_disponible, unidad_medida, precio, descripcion, estado, fecha_disponibilidad)
                VALUES (?, 4, 'Papa Harinosa', 'Papa Imilla', 15, 'QUINTAL', 45.00, 'Papa de primera cosechada en los valles cruceños.', 'DISPONIBLE', NULL)
            `).run(productorId);
            db.prepare('INSERT INTO producto_imagenes (producto_id, ruta_imagen) VALUES (?, ?)').run(resP2.lastInsertRowid, 'uploads/productos/placeholder.jpg');

            // Producto PREVENTA: Mangos Dulces
            const fechaDisponibilidadStr = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const resP3 = db.prepare(`
                INSERT INTO productos (productor_id, categoria_id, nombre, variedad, cantidad_disponible, unidad_medida, precio, descripcion, estado, fecha_disponibilidad)
                VALUES (?, 2, 'Mangos Dulces', 'Mango Rosa', 50, 'CAJA', 80.00, 'Mangos premium en proceso de maduración. Reserve su caja anticipadamente.', 'PREVENTA', ?)
            `).run(productorId, fechaDisponibilidadStr);
            db.prepare('INSERT INTO producto_imagenes (producto_id, ruta_imagen) VALUES (?, ?)').run(resP3.lastInsertRowid, 'uploads/productos/placeholder.jpg');

            // 6. Reserva de Preventa inicial
            db.prepare(`
                INSERT INTO reservas_preventa (producto_id, comprador_id, cantidad, estado)
                VALUES (?, ?, 10, 'PENDIENTE')
            `).run(resP3.lastInsertRowid, compradorId);

            // Reducir stock del producto de preventa por la cantidad reservada
            db.prepare(`
                UPDATE productos SET cantidad_disponible = cantidad_disponible - 10 WHERE id = ?
            `).run(resP3.lastInsertRowid);

            // Notificaciones correspondientes
            db.prepare(`
                INSERT INTO notificaciones (usuario_id, titulo, mensaje)
                VALUES (?, 'Nueva Reserva de Preventa', 'El comprador María López ha reservado 10 CAJA de tu cosecha Mangos Dulces.')
            `).run(productorUsuarioId);

            db.prepare(`
                INSERT INTO notificaciones (usuario_id, titulo, mensaje)
                VALUES (?, 'Reserva de Preventa Registrada', 'Has reservado 10 CAJA del producto Mangos Dulces exitosamente.')
            `).run(compradorUsuarioId);

            console.log('🌱 Datos de prueba sembrados correctamente');
        }
    } catch (error) {
        console.error('❌ Error al inicializar la base de datos:', error.message);
        throw error;
    }
}

initializeDatabase();

module.exports = { initializeDatabase };
