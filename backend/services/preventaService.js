const { getConnection } = require('../database/connection');

class PreventaService {
    reservar(compradorUsuarioId, productoId, cantidad) {
        const db = getConnection();

        // 1. Obtener el ID del comprador
        const comprador = db.prepare('SELECT id FROM compradores WHERE usuario_id = ?').get(compradorUsuarioId);
        if (!comprador) {
            throw { status: 403, message: 'Debe tener perfil de comprador para realizar reservas' };
        }

        // 2. Obtener el producto
        const producto = db.prepare(`
            SELECT p.*, u.id as productor_usuario_id, u.nombre_completo as productor_nombre
            FROM productos p
            JOIN productores pr ON p.productor_id = pr.id
            JOIN usuarios u ON pr.usuario_id = u.id
            WHERE p.id = ?
        `).get(productoId);

        if (!producto) {
            throw { status: 404, message: 'Producto no encontrado' };
        }

        if (producto.estado !== 'PREVENTA') {
            throw { status: 400, message: 'Este producto no se encuentra en preventa' };
        }

        if (parseFloat(cantidad) <= 0) {
            throw { status: 400, message: 'La cantidad a reservar debe ser mayor a 0' };
        }

        if (producto.cantidad_disponible < cantidad) {
            throw { status: 400, message: `Stock insuficiente. Disponible: ${producto.cantidad_disponible} ${producto.unidad_medida}` };
        }

        // 3. Transacción para actualizar inventario y registrar reserva
        const nuevaCantidad = producto.cantidad_disponible - cantidad;
        const nuevoEstado = nuevaCantidad === 0 ? 'AGOTADO' : 'PREVENTA';

        // Actualizar stock del producto
        db.prepare('UPDATE productos SET cantidad_disponible = ?, estado = ? WHERE id = ?')
            .run(nuevaCantidad, nuevoEstado, productoId);

        // Crear la reserva
        const res = db.prepare(`
            INSERT INTO reservas_preventa (producto_id, comprador_id, cantidad, estado)
            VALUES (?, ?, ?, 'PENDIENTE')
        `).run(productoId, comprador.id, cantidad);

        // 4. Crear notificaciones
        // Notificación para el productor
        db.prepare(`
            INSERT INTO notificaciones (usuario_id, titulo, mensaje)
            VALUES (?, 'Nueva Reserva de Preventa', ?)
        `).run(
            producto.productor_usuario_id,
            `El comprador ha reservado ${cantidad} ${producto.unidad_medida} de tu cosecha en preventa "${producto.nombre}".`
        );

        // Notificación para el comprador
        db.prepare(`
            INSERT INTO notificaciones (usuario_id, titulo, mensaje)
            VALUES (?, 'Reserva de Preventa Exitosa', ?)
        `).run(
            compradorUsuarioId,
            `Has reservado ${cantidad} ${producto.unidad_medida} de "${producto.nombre}" de la finca ${producto.productor_nombre} exitosamente.`
        );

        return {
            reserva_id: res.lastInsertRowid,
            mensaje: 'Reserva registrada exitosamente',
            stock_restante: nuevaCantidad,
            estado_producto: nuevoEstado
        };
    }

    confirmar(productorUsuarioId, productoId) {
        const db = getConnection();

        // 1. Obtener productor
        const productor = db.prepare('SELECT id FROM productores WHERE usuario_id = ?').get(productorUsuarioId);
        if (!productor) {
            throw { status: 403, message: 'Debe tener perfil de productor' };
        }

        // 2. Obtener producto y validar que pertenezca a este productor
        const producto = db.prepare('SELECT * FROM productos WHERE id = ? AND productor_id = ?').get(productoId, productor.id);
        if (!producto) {
            throw { status: 404, message: 'Producto no encontrado o no autorizado' };
        }

        // Nota: Permitir confirmar incluso si está en AGOTADO si el stock fue reservado completamente
        if (producto.estado !== 'PREVENTA' && producto.estado !== 'AGOTADO') {
            throw { status: 400, message: 'El producto no se encuentra en estado de preventa' };
        }

        // 3. Confirmar disponibilidad: cambiar estado a DISPONIBLE
        db.prepare("UPDATE productos SET estado = 'DISPONIBLE', fecha_disponibilidad = NULL WHERE id = ?")
            .run(productoId);

        // 4. Cambiar estado de todas las reservas de PENDIENTE a CONFIRMADA
        db.prepare("UPDATE reservas_preventa SET estado = 'CONFIRMADA' WHERE producto_id = ? AND estado = 'PENDIENTE'")
            .run(productoId);

        // 5. Notificar a todos los compradores con reservas pendientes de este producto
        const reservas = db.prepare(`
            SELECT r.id, c.usuario_id, r.cantidad
            FROM reservas_preventa r
            JOIN compradores c ON r.comprador_id = c.id
            WHERE r.producto_id = ? AND r.estado = 'CONFIRMADA'
        `).all(productoId);

        const insertNotification = db.prepare(`
            INSERT INTO notificaciones (usuario_id, titulo, mensaje)
            VALUES (?, 'Disponibilidad Confirmada', ?)
        `);

        for (const res of reservas) {
            insertNotification.run(
                res.usuario_id,
                `¡Buenas noticias! El productor ha confirmado la disponibilidad de la cosecha "${producto.nombre}". Tu reserva de ${res.cantidad} ${producto.unidad_medida} ya está lista.`
            );
        }

        // Notificación al productor
        db.prepare(`
            INSERT INTO notificaciones (usuario_id, titulo, mensaje)
            VALUES (?, 'Disponibilidad Confirmada', ?)
        `).run(
            productorUsuarioId,
            `Has confirmado la disponibilidad de tu cosecha "${producto.nombre}". Los compradores han sido notificados.`
        );

        return { mensaje: 'Disponibilidad confirmada y compradores notificados' };
    }

    cancelar(productorUsuarioId, productoId) {
        const db = getConnection();

        // 1. Obtener productor
        const productor = db.prepare('SELECT id FROM productores WHERE usuario_id = ?').get(productorUsuarioId);
        if (!productor) {
            throw { status: 403, message: 'Debe tener perfil de productor' };
        }

        // 2. Obtener producto y validar
        const producto = db.prepare('SELECT * FROM productos WHERE id = ? AND productor_id = ?').get(productoId, productor.id);
        if (!producto) {
            throw { status: 404, message: 'Producto no encontrado o no autorizado' };
        }

        if (producto.estado !== 'PREVENTA' && producto.estado !== 'AGOTADO') {
            throw { status: 400, message: 'El producto no se encuentra en preventa' };
        }

        // Obtener reservas pendientes para este producto para poder sumar el stock de vuelta
        const reservasPendientes = db.prepare(`
            SELECT id, comprador_id, cantidad
            FROM reservas_preventa
            WHERE producto_id = ? AND estado = 'PENDIENTE'
        `).all(productoId);

        let stockARestaurar = 0;
        for (const res of reservasPendientes) {
            stockARestaurar += res.cantidad;
        }

        // 3. Cancelar preventa: Poner producto en AGOTADO y stock a 0
        db.prepare("UPDATE productos SET estado = 'AGOTADO', cantidad_disponible = 0, fecha_disponibilidad = NULL WHERE id = ?")
            .run(productoId);

        // 4. Cambiar estado de todas las reservas de PENDIENTE a CANCELADA
        db.prepare("UPDATE reservas_preventa SET estado = 'CANCELADA' WHERE producto_id = ? AND estado = 'PENDIENTE'")
            .run(productoId);

        // 5. Notificar a los compradores con reservas canceladas
        const insertNotification = db.prepare(`
            INSERT INTO notificaciones (usuario_id, titulo, mensaje)
            VALUES (?, 'Preventa Cancelada', ?)
        `);

        for (const res of reservasPendientes) {
            const comprador = db.prepare('SELECT usuario_id FROM compradores WHERE id = ?').get(res.comprador_id);
            if (comprador) {
                insertNotification.run(
                    comprador.usuario_id,
                    `La preventa de la cosecha "${producto.nombre}" ha sido cancelada por el productor. Tu reserva de ${res.cantidad} ${producto.unidad_medida} ha sido anulada.`
                );
            }
        }

        // Notificación al productor
        db.prepare(`
            INSERT INTO notificaciones (usuario_id, titulo, mensaje)
            VALUES (?, 'Preventa Cancelada', ?)
        `).run(
            productorUsuarioId,
            `Has cancelado la preventa de tu cosecha "${producto.nombre}". Todas las reservas han sido anuladas.`
        );

        return { mensaje: 'Preventa cancelada y reservas anuladas exitosamente' };
    }

    getReservasPorProductor(productorUsuarioId) {
        const db = getConnection();
        return db.prepare(`
            SELECT r.id, r.producto_id, r.cantidad, r.estado, r.fecha_reserva,
                   p.nombre as producto_nombre, p.unidad_medida, p.precio,
                   u.nombre_completo as comprador_nombre, u.celular as comprador_celular
            FROM reservas_preventa r
            JOIN productos p ON r.producto_id = p.id
            JOIN compradores c ON r.comprador_id = c.id
            JOIN usuarios u ON c.usuario_id = u.id
            WHERE p.productor_id = (SELECT id FROM productores WHERE usuario_id = ?)
            ORDER BY r.fecha_reserva DESC
        `).all(productorUsuarioId);
    }

    getReservasPorComprador(compradorUsuarioId) {
        const db = getConnection();
        return db.prepare(`
            SELECT r.id, r.producto_id, r.cantidad, r.estado, r.fecha_reserva,
                   p.nombre as producto_nombre, p.unidad_medida, p.precio,
                   pr.nombre_finca, pr.localidad, pr.municipio,
                   u.nombre_completo as productor_nombre, u.celular as productor_celular
            FROM reservas_preventa r
            JOIN productos p ON r.producto_id = p.id
            JOIN productores pr ON p.productor_id = pr.id
            JOIN usuarios u ON pr.usuario_id = u.id
            WHERE r.comprador_id = (SELECT id FROM compradores WHERE usuario_id = ?)
            ORDER BY r.fecha_reserva DESC
        `).all(compradorUsuarioId);
    }
}

module.exports = new PreventaService();
