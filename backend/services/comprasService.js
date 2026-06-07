const { getConnection } = require('../database/connection');

class ComprasService {

    // ==================================================
    // COMPRA DIRECTA (producto DISPONIBLE)
    // ==================================================
    comprar(compradorUsuarioId, productoId, cantidad, notas) {
        const db = getConnection();

        const comprador = db.prepare('SELECT id FROM compradores WHERE usuario_id = ?').get(compradorUsuarioId);
        if (!comprador) throw { status: 403, message: 'Debe tener perfil de comprador' };

        const producto = db.prepare(`
            SELECT p.*, pr.id as productor_id,
                   u.id as productor_usuario_id, u.nombre_completo as productor_nombre
            FROM productos p
            JOIN productores pr ON p.productor_id = pr.id
            JOIN usuarios u ON pr.usuario_id = u.id
            WHERE p.id = ? AND p.activo = 1
        `).get(productoId);

        if (!producto) throw { status: 404, message: 'Producto no encontrado' };
        if (producto.estado === 'AGOTADO') throw { status: 400, message: 'Este producto está agotado' };
        if (producto.estado === 'PREVENTA') throw { status: 400, message: 'Este producto es de preventa, usa la opción de reserva' };
        if (parseFloat(cantidad) <= 0) throw { status: 400, message: 'La cantidad debe ser mayor a 0' };
        if (producto.cantidad_disponible < parseFloat(cantidad)) {
            throw { status: 400, message: `Stock insuficiente. Disponible: ${producto.cantidad_disponible} ${producto.unidad_medida}` };
        }

        const nuevaCantidad = producto.cantidad_disponible - parseFloat(cantidad);
        const nuevoEstado = nuevaCantidad === 0 ? 'AGOTADO' : 'DISPONIBLE';
        const total = parseFloat(cantidad) * producto.precio;

        // Descontar stock
        db.prepare('UPDATE productos SET cantidad_disponible = ?, estado = ? WHERE id = ?')
            .run(nuevaCantidad, nuevoEstado, productoId);

        // Registrar compra
        const res = db.prepare(`
            INSERT INTO compras (comprador_id, producto_id, cantidad, precio_unitario, total, estado, notas)
            VALUES (?, ?, ?, ?, ?, 'PENDIENTE', ?)
        `).run(comprador.id, productoId, parseFloat(cantidad), producto.precio, total, notas || null);

        // Notificaciones
        db.prepare(`INSERT INTO notificaciones (usuario_id, titulo, mensaje) VALUES (?, ?, ?)`)
            .run(producto.productor_usuario_id,
                'Nueva Compra Recibida',
                `Recibiste una compra de ${cantidad} ${producto.unidad_medida} de "${producto.nombre}". Total: Bs ${total.toFixed(2)}.`);

        db.prepare(`INSERT INTO notificaciones (usuario_id, titulo, mensaje) VALUES (?, ?, ?)`)
            .run(compradorUsuarioId,
                'Compra Registrada Exitosamente',
                `Tu compra de ${cantidad} ${producto.unidad_medida} de "${producto.nombre}" fue registrada. El productor coordinará el envío.`);

        return { compra_id: res.lastInsertRowid, total, mensaje: 'Compra registrada exitosamente' };
    }

    // ==================================================
    // PRODUCTOR: Marcar compra como ENVIADO
    // ==================================================
    marcarEnviado(productorUsuarioId, compraId) {
        const db = getConnection();

        const productor = db.prepare('SELECT id FROM productores WHERE usuario_id = ?').get(productorUsuarioId);
        if (!productor) throw { status: 403, message: 'Perfil de productor requerido' };

        const compra = db.prepare(`
            SELECT c.*, p.nombre as producto_nombre, p.unidad_medida,
                   u.id as comprador_usuario_id
            FROM compras c
            JOIN productos p ON c.producto_id = p.id
            JOIN productores pr ON p.productor_id = pr.id
            JOIN compradores comp ON c.comprador_id = comp.id
            JOIN usuarios u ON comp.usuario_id = u.id
            WHERE c.id = ? AND pr.id = ?
        `).get(compraId, productor.id);

        if (!compra) throw { status: 404, message: 'Compra no encontrada o no autorizada' };
        if (compra.estado !== 'PENDIENTE') throw { status: 400, message: `La compra ya está en estado: ${compra.estado}` };

        db.prepare(`UPDATE compras SET estado = 'ENVIADO', fecha_envio = CURRENT_TIMESTAMP WHERE id = ?`).run(compraId);

        db.prepare(`INSERT INTO notificaciones (usuario_id, titulo, mensaje) VALUES (?, ?, ?)`)
            .run(compra.comprador_usuario_id,
                '¡Tu pedido fue enviado! 🚚',
                `El productor marcó como enviado tu compra de ${compra.cantidad} ${compra.unidad_medida} de "${compra.producto_nombre}". Confirma cuando lo recibas.`);

        return { mensaje: 'Compra marcada como enviada' };
    }

    // ==================================================
    // COMPRADOR: Confirmar entrega de compra
    // ==================================================
    confirmarEntrega(compradorUsuarioId, compraId) {
        const db = getConnection();

        const comprador = db.prepare('SELECT id FROM compradores WHERE usuario_id = ?').get(compradorUsuarioId);
        if (!comprador) throw { status: 403, message: 'Perfil de comprador requerido' };

        const compra = db.prepare(`
            SELECT c.*, p.nombre as producto_nombre, p.unidad_medida,
                   u.id as productor_usuario_id
            FROM compras c
            JOIN productos p ON c.producto_id = p.id
            JOIN productores pr ON p.productor_id = pr.id
            JOIN usuarios u ON pr.usuario_id = u.id
            WHERE c.id = ? AND c.comprador_id = ?
        `).get(compraId, comprador.id);

        if (!compra) throw { status: 404, message: 'Compra no encontrada' };
        if (compra.estado !== 'ENVIADO') throw { status: 400, message: 'La compra aún no ha sido enviada' };

        db.prepare(`UPDATE compras SET estado = 'ENTREGADO', fecha_entrega = CURRENT_TIMESTAMP WHERE id = ?`).run(compraId);

        // Sumar venta al productor
        db.prepare(`UPDATE productores SET total_ventas = total_ventas + 1 WHERE id = (
            SELECT productor_id FROM productos WHERE id = ?
        )`).run(compra.producto_id);

        db.prepare(`INSERT INTO notificaciones (usuario_id, titulo, mensaje) VALUES (?, ?, ?)`)
            .run(compra.productor_usuario_id,
                '¡Entrega Confirmada! ✅',
                `El comprador confirmó la entrega de ${compra.cantidad} ${compra.unidad_medida} de "${compra.producto_nombre}". ¡Venta completada!`);

        return { mensaje: 'Entrega confirmada exitosamente' };
    }

    // ==================================================
    // PRODUCTOR: Marcar preventa/reserva como ENVIADA
    // ==================================================
    marcarReservaEnviada(productorUsuarioId, reservaId) {
        const db = getConnection();

        const productor = db.prepare('SELECT id FROM productores WHERE usuario_id = ?').get(productorUsuarioId);
        if (!productor) throw { status: 403, message: 'Perfil de productor requerido' };

        const reserva = db.prepare(`
            SELECT r.*, p.nombre as producto_nombre, p.unidad_medida,
                   u.id as comprador_usuario_id
            FROM reservas_preventa r
            JOIN productos p ON r.producto_id = p.id
            JOIN productores pr ON p.productor_id = pr.id
            JOIN compradores c ON r.comprador_id = c.id
            JOIN usuarios u ON c.usuario_id = u.id
            WHERE r.id = ? AND pr.id = ?
        `).get(reservaId, productor.id);

        if (!reserva) throw { status: 404, message: 'Reserva no encontrada o no autorizada' };
        if (!['PENDIENTE', 'CONFIRMADA'].includes(reserva.estado)) {
            throw { status: 400, message: `La reserva ya está en estado: ${reserva.estado}` };
        }

        db.prepare(`UPDATE reservas_preventa SET estado = 'ENVIADO' WHERE id = ?`).run(reservaId);

        db.prepare(`INSERT INTO notificaciones (usuario_id, titulo, mensaje) VALUES (?, ?, ?)`)
            .run(reserva.comprador_usuario_id,
                '¡Tu reserva fue enviada! 🚚',
                `El productor marcó como enviada tu reserva de ${reserva.cantidad} ${reserva.unidad_medida} de "${reserva.producto_nombre}". Confirma cuando lo recibas.`);

        return { mensaje: 'Reserva marcada como enviada' };
    }

    // ==================================================
    // COMPRADOR: Confirmar entrega de reserva/preventa
    // ==================================================
    confirmarEntregaReserva(compradorUsuarioId, reservaId) {
        const db = getConnection();

        const comprador = db.prepare('SELECT id FROM compradores WHERE usuario_id = ?').get(compradorUsuarioId);
        if (!comprador) throw { status: 403, message: 'Perfil de comprador requerido' };

        const reserva = db.prepare(`
            SELECT r.*, p.nombre as producto_nombre, p.unidad_medida, p.productor_id,
                   u.id as productor_usuario_id
            FROM reservas_preventa r
            JOIN productos p ON r.producto_id = p.id
            JOIN productores pr ON p.productor_id = pr.id
            JOIN usuarios u ON pr.usuario_id = u.id
            WHERE r.id = ? AND r.comprador_id = ?
        `).get(reservaId, comprador.id);

        if (!reserva) throw { status: 404, message: 'Reserva no encontrada' };
        if (reserva.estado !== 'ENVIADO') throw { status: 400, message: 'La reserva aún no fue enviada' };

        db.prepare(`UPDATE reservas_preventa SET estado = 'ENTREGADO' WHERE id = ?`).run(reservaId);

        db.prepare(`UPDATE productores SET total_ventas = total_ventas + 1 WHERE id = ?`).run(reserva.productor_id);

        db.prepare(`INSERT INTO notificaciones (usuario_id, titulo, mensaje) VALUES (?, ?, ?)`)
            .run(reserva.productor_usuario_id,
                '¡Entrega de Preventa Confirmada! ✅',
                `El comprador confirmó la entrega de tu reserva de ${reserva.cantidad} ${reserva.unidad_medida} de "${reserva.producto_nombre}".`);

        return { mensaje: 'Entrega de reserva confirmada' };
    }

    // ==================================================
    // HISTORIAL UNIFICADO del Comprador
    // ==================================================
    getHistorialComprador(compradorUsuarioId) {
        const db = getConnection();

        const comprador = db.prepare('SELECT id FROM compradores WHERE usuario_id = ?').get(compradorUsuarioId);
        if (!comprador) return [];

        // Compras directas
        const compras = db.prepare(`
            SELECT c.id, c.cantidad, c.precio_unitario, c.total, c.estado,
                   c.notas, c.fecha_compra as fecha, c.fecha_envio, c.fecha_entrega,
                   'COMPRA' as tipo,
                   p.nombre as producto_nombre, p.unidad_medida, p.id as producto_id,
                   (SELECT ruta_imagen FROM producto_imagenes WHERE producto_id = p.id ORDER BY id ASC LIMIT 1) as imagen,
                   pr.nombre_finca, pr.localidad,
                   u.nombre_completo as productor_nombre, u.celular as productor_celular
            FROM compras c
            JOIN productos p ON c.producto_id = p.id
            JOIN productores pr ON p.productor_id = pr.id
            JOIN usuarios u ON pr.usuario_id = u.id
            WHERE c.comprador_id = ?
            ORDER BY c.fecha_compra DESC
        `).all(comprador.id);

        // Reservas de preventa
        const reservas = db.prepare(`
            SELECT r.id, r.cantidad, p.precio as precio_unitario,
                   (r.cantidad * p.precio) as total, r.estado,
                   NULL as notas, r.fecha_reserva as fecha,
                   NULL as fecha_envio, NULL as fecha_entrega,
                   'PREVENTA' as tipo,
                   p.nombre as producto_nombre, p.unidad_medida, p.id as producto_id,
                   (SELECT ruta_imagen FROM producto_imagenes WHERE producto_id = p.id ORDER BY id ASC LIMIT 1) as imagen,
                   pr.nombre_finca, pr.localidad,
                   u.nombre_completo as productor_nombre, u.celular as productor_celular
            FROM reservas_preventa r
            JOIN productos p ON r.producto_id = p.id
            JOIN productores pr ON p.productor_id = pr.id
            JOIN usuarios u ON pr.usuario_id = u.id
            WHERE r.comprador_id = ?
            ORDER BY r.fecha_reserva DESC
        `).all(comprador.id);

        // Unir y ordenar por fecha descendente
        const todo = [...compras, ...reservas].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        return todo;
    }

    // ==================================================
    // VENTAS del Productor (compras + reservas entregables)
    // ==================================================
    getVentasProductor(productorUsuarioId) {
        const db = getConnection();

        const productor = db.prepare('SELECT id FROM productores WHERE usuario_id = ?').get(productorUsuarioId);
        if (!productor) return [];

        const compras = db.prepare(`
            SELECT c.id, c.cantidad, c.precio_unitario, c.total, c.estado,
                   c.notas, c.fecha_compra as fecha, c.fecha_envio, c.fecha_entrega,
                   'COMPRA' as tipo,
                   p.nombre as producto_nombre, p.unidad_medida,
                   u.nombre_completo as comprador_nombre, u.celular as comprador_celular
            FROM compras c
            JOIN productos p ON c.producto_id = p.id
            JOIN compradores comp ON c.comprador_id = comp.id
            JOIN usuarios u ON comp.usuario_id = u.id
            WHERE p.productor_id = ?
            ORDER BY c.fecha_compra DESC
        `).all(productor.id);

        const reservas = db.prepare(`
            SELECT r.id, r.cantidad, p.precio as precio_unitario,
                   (r.cantidad * p.precio) as total, r.estado,
                   NULL as notas, r.fecha_reserva as fecha,
                   NULL as fecha_envio, NULL as fecha_entrega,
                   'PREVENTA' as tipo,
                   p.nombre as producto_nombre, p.unidad_medida,
                   u.nombre_completo as comprador_nombre, u.celular as comprador_celular
            FROM reservas_preventa r
            JOIN productos p ON r.producto_id = p.id
            JOIN compradores c ON r.comprador_id = c.id
            JOIN usuarios u ON c.usuario_id = u.id
            WHERE p.productor_id = ?
            AND r.estado NOT IN ('CANCELADA')
            ORDER BY r.fecha_reserva DESC
        `).all(productor.id);

        return [...compras, ...reservas].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }

    // ==================================================
    // PRODUCTOR: Rechazar compra pendiente (restaura stock)
    // ==================================================
    rechazar(productorUsuarioId, compraId) {
        const db = getConnection();

        const productor = db.prepare('SELECT id FROM productores WHERE usuario_id = ?').get(productorUsuarioId);
        if (!productor) throw { status: 403, message: 'Perfil de productor requerido' };

        const compra = db.prepare(`
            SELECT c.*, p.productor_id, p.cantidad_disponible, p.unidad_medida,
                   p.nombre as producto_nombre, u.id as comprador_usuario_id
            FROM compras c
            JOIN productos p ON c.producto_id = p.id
            JOIN compradores comp ON c.comprador_id = comp.id
            JOIN usuarios u ON comp.usuario_id = u.id
            WHERE c.id = ? AND p.productor_id = ?
        `).get(compraId, productor.id);

        if (!compra) throw { status: 404, message: 'Compra no encontrada o no autorizada' };
        if (compra.estado !== 'PENDIENTE') {
            throw { status: 400, message: `No se puede rechazar una compra en estado: ${compra.estado}` };
        }

        // Restaurar stock del producto
        const nuevoStock = compra.cantidad_disponible + compra.cantidad;
        const nuevoEstado = 'DISPONIBLE';
        db.prepare('UPDATE productos SET cantidad_disponible = ?, estado = ? WHERE id = ?')
            .run(nuevoStock, nuevoEstado, compra.producto_id);

        // Marcar compra como rechazada
        db.prepare("UPDATE compras SET estado = 'RECHAZADA' WHERE id = ?").run(compraId);

        db.prepare(`INSERT INTO notificaciones (usuario_id, titulo, mensaje) VALUES (?, ?, ?)`)
            .run(compra.comprador_usuario_id,
                'Compra Rechazada',
                `El productor rechazó tu compra de ${compra.cantidad} ${compra.unidad_medida} de "${compra.producto_nombre}". El producto vuelve a estar disponible.`);

        return { mensaje: 'Compra rechazada, stock restaurado' };
    }

    getCompraById(compraId) {
        const db = getConnection();
        return db.prepare('SELECT * FROM compras WHERE id = ?').get(compraId);
    }
}

module.exports = new ComprasService();
