const { getConnection } = require('../database/connection');
const carritoService = require('./carritoService');

class PedidosService {
    _registrarHistorial(db, pedidoId, estado, comentario) {
        db.prepare(
            'INSERT INTO historial_pedidos (pedido_id, estado, comentario) VALUES (?, ?, ?)'
        ).run(pedidoId, estado, comentario || null);
    }

    checkout(compradorUsuarioId) {
        const db = getConnection();
        const comprador = db.prepare('SELECT id FROM compradores WHERE usuario_id = ?').get(compradorUsuarioId);
        if (!comprador) throw { status: 403, message: 'Debe tener perfil de comprador' };

        const carrito = carritoService.getCarrito(compradorUsuarioId);
        if (carrito.items.length === 0) throw { status: 400, message: 'El carrito está vacío' };

        for (const item of carrito.items) {
            const producto = db.prepare('SELECT cantidad_disponible, estado FROM productos WHERE id = ? AND activo = 1').get(item.producto_id);
            if (!producto || producto.estado !== 'DISPONIBLE' || producto.cantidad_disponible < item.cantidad) {
                throw { status: 400, message: `Stock insuficiente para "${item.nombre}"` };
            }
        }

        const montoTotal = carrito.total;
        const resPedido = db.prepare(
            'INSERT INTO pedidos (comprador_id, estado, monto_total) VALUES (?, ?, ?)'
        ).run(comprador.id, 'PENDIENTE', montoTotal);
        const pedidoId = resPedido.lastInsertRowid;

        for (const item of carrito.items) {
            const subtotal = item.cantidad * item.precio;
            db.prepare(`
                INSERT INTO pedido_detalles (pedido_id, producto_id, cantidad, precio_unitario, subtotal)
                VALUES (?, ?, ?, ?, ?)
            `).run(pedidoId, item.producto_id, item.cantidad, item.precio, subtotal);

            const producto = db.prepare('SELECT cantidad_disponible FROM productos WHERE id = ? AND activo = 1').get(item.producto_id);
            const nuevaCantidad = producto.cantidad_disponible - item.cantidad;
            const nuevoEstado = nuevaCantidad === 0 ? 'AGOTADO' : 'DISPONIBLE';
            db.prepare('UPDATE productos SET cantidad_disponible = ?, estado = ? WHERE id = ?')
                .run(nuevaCantidad, nuevoEstado, item.producto_id);
        }

        carritoService.clearCarrito(comprador.id);
        this._registrarHistorial(db, pedidoId, 'PENDIENTE', 'Pedido creado desde carrito');

        db.prepare(`INSERT INTO notificaciones (usuario_id, titulo, mensaje) VALUES (?, ?, ?)`)
            .run(compradorUsuarioId, 'Pedido Registrado',
                `Tu pedido #${pedidoId} por Bs ${montoTotal.toFixed(2)} fue creado. Procede al pago.`);

        const productores = db.prepare(`
            SELECT DISTINCT u.id as usuario_id, p.nombre
            FROM pedido_detalles pd
            JOIN productos pr ON pd.producto_id = pr.id
            JOIN productores prod ON pr.productor_id = prod.id
            JOIN usuarios u ON prod.usuario_id = u.id
            JOIN productos p ON pd.producto_id = p.id
            WHERE pd.pedido_id = ?
        `).all(pedidoId);

        for (const prod of productores) {
            db.prepare(`INSERT INTO notificaciones (usuario_id, titulo, mensaje) VALUES (?, ?, ?)`)
                .run(prod.usuario_id, 'Nuevo Pedido Recibido',
                    `Tienes productos incluidos en el pedido #${pedidoId}. Esperando confirmación de pago.`);
        }

        return { pedido_id: pedidoId, monto_total: montoTotal, estado: 'PENDIENTE' };
    }

    getPedidosComprador(compradorUsuarioId) {
        const db = getConnection();
        const comprador = db.prepare('SELECT id FROM compradores WHERE usuario_id = ?').get(compradorUsuarioId);
        if (!comprador) return [];

        const pedidos = db.prepare(`
            SELECT p.id, p.estado, p.monto_total, p.fecha_pedido,
                   pq.estado as pago_estado, pq.referencia,
                   hr.estado as ruta_estado,
                   u_t.nombre_completo as transportista_nombre
            FROM pedidos p
            LEFT JOIN pagos_qr pq ON pq.pedido_id = p.id
            LEFT JOIN hojas_ruta hr ON hr.pedido_id = p.id
            LEFT JOIN transportistas t ON hr.transportista_id = t.id
            LEFT JOIN usuarios u_t ON t.usuario_id = u_t.id
            WHERE p.comprador_id = ?
            ORDER BY p.fecha_pedido DESC
        `).all(comprador.id);

        return pedidos.map(p => ({
            ...p,
            estado_label: this._estadoLabel(p.estado),
            detalles: this.getDetallesPedido(p.id),
        }));
    }

    getDetallesPedido(pedidoId) {
        const db = getConnection();
        return db.prepare(`
            SELECT pd.*, pr.nombre, pr.unidad_medida, prod.nombre_finca, prod.provincia, prod.localidad,
                   (SELECT ruta_imagen FROM producto_imagenes WHERE producto_id = pr.id ORDER BY id ASC LIMIT 1) as imagen
            FROM pedido_detalles pd
            JOIN productos pr ON pd.producto_id = pr.id
            JOIN productores prod ON pr.productor_id = prod.id
            WHERE pd.pedido_id = ?
        `).all(pedidoId);
    }

    getPedidoById(pedidoId, compradorUsuarioId) {
        const db = getConnection();
        const comprador = db.prepare('SELECT id FROM compradores WHERE usuario_id = ?').get(compradorUsuarioId);
        if (!comprador) throw { status: 403, message: 'Acceso denegado' };

        const pedido = db.prepare(`
            SELECT p.*, pq.codigo_qr, pq.referencia, pq.estado as pago_estado, pq.fecha_expiracion
            FROM pedidos p
            LEFT JOIN pagos_qr pq ON pq.pedido_id = p.id
            WHERE p.id = ? AND p.comprador_id = ?
        `).get(pedidoId, comprador.id);

        if (!pedido) throw { status: 404, message: 'Pedido no encontrado' };
        pedido.detalles = this.getDetallesPedido(pedidoId);
        pedido.estado_label = this._estadoLabel(pedido.estado);
        return pedido;
    }

    _estadoLabel(estado) {
        const map = {
            PENDIENTE: 'Pendiente',
            PAGO_PENDIENTE: 'Pendiente de Pago',
            LISTO_DESPACHO: 'Pagado',
            EN_CAMINO: 'Enviado',
            COMPLETADO: 'Completado',
            CANCELADO: 'Cancelado',
        };
        return map[estado] || estado;
    }

    confirmarEntrega(compradorUsuarioId, pedidoId) {
        const db = getConnection();
        const comprador = db.prepare('SELECT id FROM compradores WHERE usuario_id = ?').get(compradorUsuarioId);
        if (!comprador) throw { status: 403, message: 'Acceso denegado' };

        const pedido = db.prepare('SELECT * FROM pedidos WHERE id = ? AND comprador_id = ?').get(pedidoId, comprador.id);
        if (!pedido) throw { status: 404, message: 'Pedido no encontrado' };
        if (pedido.estado !== 'EN_CAMINO') {
            throw { status: 400, message: 'El pedido aún no ha sido enviado' };
        }

        db.prepare("UPDATE pedidos SET estado = 'COMPLETADO' WHERE id = ?").run(pedidoId);
        db.prepare("UPDATE entregas SET estado = 'ENTREGADO', fecha_entrega = CURRENT_TIMESTAMP WHERE pedido_id = ?").run(pedidoId);
        db.prepare("UPDATE hojas_ruta SET estado = 'FINALIZADA' WHERE pedido_id = ?").run(pedidoId);
        this._registrarHistorial(db, pedidoId, 'COMPLETADO', 'Entrega confirmada por comprador');

        const productores = db.prepare(`
            SELECT DISTINCT prod.id, u.id as usuario_id
            FROM pedido_detalles pd
            JOIN productos p ON pd.producto_id = p.id
            JOIN productores prod ON p.productor_id = prod.id
            JOIN usuarios u ON prod.usuario_id = u.id
            WHERE pd.pedido_id = ?
        `).all(pedidoId);

        for (const prod of productores) {
            db.prepare('UPDATE productores SET total_ventas = total_ventas + 1 WHERE id = ?').run(prod.id);
            db.prepare(`INSERT INTO notificaciones (usuario_id, titulo, mensaje) VALUES (?, ?, ?)`)
                .run(prod.usuario_id, 'Entrega Completada',
                    `El pedido #${pedidoId} fue entregado y confirmado por el comprador.`);
        }

        return { mensaje: 'Entrega confirmada exitosamente' };
    }
}

module.exports = new PedidosService();
