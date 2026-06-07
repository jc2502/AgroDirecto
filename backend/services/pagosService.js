const crypto = require('crypto');
const { getConnection } = require('../database/connection');

class PagosService {
    _registrarHistorial(db, pedidoId, estado, comentario) {
        db.prepare(
            'INSERT INTO historial_pedidos (pedido_id, estado, comentario) VALUES (?, ?, ?)'
        ).run(pedidoId, estado, comentario || null);
    }

    generarQR(compradorUsuarioId, pedidoId) {
        const db = getConnection();
        const comprador = db.prepare('SELECT id FROM compradores WHERE usuario_id = ?').get(compradorUsuarioId);
        if (!comprador) throw { status: 403, message: 'Acceso denegado' };

        const pedido = db.prepare('SELECT * FROM pedidos WHERE id = ? AND comprador_id = ?').get(pedidoId, comprador.id);
        if (!pedido) throw { status: 404, message: 'Pedido no encontrado' };
        if (!['PENDIENTE', 'PAGO_PENDIENTE'].includes(pedido.estado)) {
            throw { status: 400, message: `El pedido no puede generar QR en estado: ${pedido.estado}` };
        }

        const existente = db.prepare('SELECT * FROM pagos_qr WHERE pedido_id = ?').get(pedidoId);
        if (existente && existente.estado === 'ACTIVO') {
            return {
                pedido_id: pedidoId,
                referencia: existente.referencia,
                codigo_qr: existente.codigo_qr,
                monto: existente.monto,
                fecha_expiracion: existente.fecha_expiracion,
                estado: existente.estado,
            };
        }

        const referencia = `AGRO-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
        const expiracion = new Date(Date.now() + 30 * 60 * 1000).toISOString();
        const codigoQR = JSON.stringify({
            app: 'AgroDirecto',
            ref: referencia,
            pedido_id: pedidoId,
            monto: pedido.monto_total,
            moneda: 'BOB',
            expira: expiracion,
        });

        db.prepare(`
            INSERT INTO pagos_qr (pedido_id, codigo_qr, referencia, monto, fecha_expiracion, estado)
            VALUES (?, ?, ?, ?, ?, 'ACTIVO')
        `).run(pedidoId, codigoQR, referencia, pedido.monto_total, expiracion);

        db.prepare("UPDATE pedidos SET estado = 'PAGO_PENDIENTE' WHERE id = ?").run(pedidoId);
        this._registrarHistorial(db, pedidoId, 'PAGO_PENDIENTE', 'QR de pago generado');

        return {
            pedido_id: pedidoId,
            referencia,
            codigo_qr: codigoQR,
            monto: pedido.monto_total,
            fecha_expiracion: expiracion,
            estado: 'ACTIVO',
        };
    }

    simularPago(referencia) {
        const db = getConnection();
        const pago = db.prepare('SELECT * FROM pagos_qr WHERE referencia = ?').get(referencia);
        if (!pago) throw { status: 404, message: 'Referencia de pago no encontrada' };
        if (pago.estado === 'PAGADO') throw { status: 400, message: 'Este pago ya fue procesado' };
        if (pago.estado === 'VENCIDO') throw { status: 400, message: 'El código QR ha vencido' };

        if (new Date(pago.fecha_expiracion) < new Date()) {
            db.prepare("UPDATE pagos_qr SET estado = 'VENCIDO' WHERE id = ?").run(pago.id);
            throw { status: 400, message: 'El código QR ha vencido' };
        }

        db.prepare("UPDATE pagos_qr SET estado = 'PAGADO' WHERE id = ?").run(pago.id);
        db.prepare("UPDATE pedidos SET estado = 'LISTO_DESPACHO' WHERE id = ?").run(pago.pedido_id);
        this._registrarHistorial(db, pago.pedido_id, 'LISTO_DESPACHO', 'Pago confirmado vía QR simulado');

        db.prepare(`
            INSERT INTO entregas (pedido_id, estado) VALUES (?, 'PENDIENTE')
        `).run(pago.pedido_id);

        const pedido = db.prepare(`
            SELECT p.*, c.usuario_id as comprador_usuario_id, u.nombre_completo as comprador_nombre
            FROM pedidos p
            JOIN compradores c ON p.comprador_id = c.id
            JOIN usuarios u ON c.usuario_id = u.id
            WHERE p.id = ?
        `).get(pago.pedido_id);

        db.prepare(`INSERT INTO notificaciones (usuario_id, titulo, mensaje) VALUES (?, ?, ?)`)
            .run(pedido.comprador_usuario_id,
                '✅ Pago Exitoso',
                `Tu pago de Bs ${pago.monto.toFixed(2)} por el pedido #${pago.pedido_id} fue confirmado. Referencia: ${referencia}. Tu pedido será despachado pronto.`);

        const productores = db.prepare(`
            SELECT DISTINCT u.id as usuario_id
            FROM pedido_detalles pd
            JOIN productos pr ON pd.producto_id = pr.id
            JOIN productores prod ON pr.productor_id = prod.id
            JOIN usuarios u ON prod.usuario_id = u.id
            WHERE pd.pedido_id = ?
        `).all(pago.pedido_id);

        for (const prod of productores) {
            db.prepare(`INSERT INTO notificaciones (usuario_id, titulo, mensaje) VALUES (?, ?, ?)`)
                .run(prod.usuario_id, 'Pago Confirmado - Preparar Despacho',
                    `El pedido #${pago.pedido_id} fue pagado. Prepara los productos para recolección del transportista.`);
        }

        const transportistas = db.prepare(`
            SELECT u.id FROM transportistas t JOIN usuarios u ON t.usuario_id = u.id
        `).all();
        for (const t of transportistas) {
            db.prepare(`INSERT INTO notificaciones (usuario_id, titulo, mensaje) VALUES (?, ?, ?)`)
                .run(t.id, '🚚 Nueva Ruta Disponible',
                    `Hay un pedido #${pago.pedido_id} listo para despacho desde provincia hacia la ciudad. Revisa rutas disponibles.`);
        }

        return {
            mensaje: 'Pago procesado exitosamente',
            pedido_id: pago.pedido_id,
            referencia,
            monto: pago.monto,
            estado: 'LISTO_DESPACHO',
        };
    }

    getPagoByPedido(compradorUsuarioId, pedidoId) {
        const db = getConnection();
        const comprador = db.prepare('SELECT id FROM compradores WHERE usuario_id = ?').get(compradorUsuarioId);
        if (!comprador) throw { status: 403, message: 'Acceso denegado' };

        const pedido = db.prepare('SELECT id FROM pedidos WHERE id = ? AND comprador_id = ?').get(pedidoId, comprador.id);
        if (!pedido) throw { status: 404, message: 'Pedido no encontrado' };

        return db.prepare('SELECT * FROM pagos_qr WHERE pedido_id = ?').get(pedidoId) || null;
    }
}

module.exports = new PagosService();
