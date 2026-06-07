const { getConnection } = require('../database/connection');

class TransportistaService {
    _getTransportista(transportistaUsuarioId) {
        const db = getConnection();
        const transportista = db.prepare('SELECT * FROM transportistas WHERE usuario_id = ?').get(transportistaUsuarioId);
        if (!transportista) throw { status: 403, message: 'Perfil de transportista requerido' };
        return transportista;
    }

    getRutasDisponibles(transportistaUsuarioId) {
        const db = getConnection();
        this._getTransportista(transportistaUsuarioId);

        const pedidos = db.prepare(`
            SELECT p.id, p.monto_total, p.fecha_pedido, p.estado,
                   comp.ciudad_compra as ciudad_destino,
                   u.nombre_completo as comprador_nombre
            FROM pedidos p
            JOIN compradores comp ON p.comprador_id = comp.id
            JOIN usuarios u ON comp.usuario_id = u.id
            LEFT JOIN hojas_ruta hr ON hr.pedido_id = p.id
            WHERE p.estado = 'LISTO_DESPACHO' AND hr.id IS NULL
            ORDER BY p.fecha_pedido ASC
        `).all();

        return pedidos.map(p => {
            const paradas = db.prepare(`
                SELECT DISTINCT prod.provincia, prod.municipio, prod.localidad, prod.nombre_finca,
                       u.nombre_completo as productor_nombre, pd.cantidad, pr.nombre as producto_nombre,
                       pr.unidad_medida
                FROM pedido_detalles pd
                JOIN productos pr ON pd.producto_id = pr.id
                JOIN productores prod ON pr.productor_id = prod.id
                JOIN usuarios u ON prod.usuario_id = u.id
                WHERE pd.pedido_id = ?
            `).all(p.id);

            const provincias = [...new Set(paradas.map(x => x.provincia).filter(Boolean))];
            return {
                ...p,
                paradas,
                provincias_origen: provincias,
                ruta_descripcion: `${provincias.join(', ') || 'Provincia'} → ${p.ciudad_destino || 'Santa Cruz'}`,
            };
        });
    }

    aceptarRuta(transportistaUsuarioId, pedidoId) {
        const db = getConnection();
        const transportista = this._getTransportista(transportistaUsuarioId);

        const pedido = db.prepare(`
            SELECT p.*, comp.ciudad_compra, comp.usuario_id as comprador_usuario_id
            FROM pedidos p
            JOIN compradores comp ON p.comprador_id = comp.id
            WHERE p.id = ?
        `).get(pedidoId);

        if (!pedido) throw { status: 404, message: 'Pedido no encontrado' };
        if (pedido.estado !== 'LISTO_DESPACHO') {
            throw { status: 400, message: 'El pedido no está listo para despacho' };
        }

        const rutaExistente = db.prepare('SELECT id FROM hojas_ruta WHERE pedido_id = ?').get(pedidoId);
        if (rutaExistente) throw { status: 400, message: 'Este pedido ya tiene transportista asignado' };

        const paradas = db.prepare(`
            SELECT DISTINCT prod.id as productor_id, prod.provincia, prod.municipio, prod.localidad
            FROM pedido_detalles pd
            JOIN productos pr ON pd.producto_id = pr.id
            JOIN productores prod ON pr.productor_id = prod.id
            WHERE pd.pedido_id = ?
        `).all(pedidoId);

        const provincias = [...new Set(paradas.map(p => p.provincia).filter(Boolean))];
        const rutaMaps = `${provincias.join(' → ')} → ${pedido.ciudad_compra || 'Santa Cruz de la Sierra'}`;

        db.prepare(`
            INSERT INTO postulaciones_flete (pedido_id, transportista_id, estado)
            VALUES (?, ?, 'ACEPTADO')
        `).run(pedidoId, transportista.id);

        const resRuta = db.prepare(`
            INSERT INTO hojas_ruta (pedido_id, transportista_id, ruta_maps, estado)
            VALUES (?, ?, ?, 'EN_PROCESO')
        `).run(pedidoId, transportista.id, rutaMaps);
        const hojaRutaId = resRuta.lastInsertRowid;

        paradas.forEach((parada, index) => {
            db.prepare(`
                INSERT INTO ruta_paradas (hoja_ruta_id, productor_id, orden_parada)
                VALUES (?, ?, ?)
            `).run(hojaRutaId, parada.productor_id, index + 1);
        });

        db.prepare("UPDATE pedidos SET estado = 'EN_CAMINO' WHERE id = ?").run(pedidoId);
        db.prepare(`
            INSERT INTO historial_pedidos (pedido_id, estado, comentario)
            VALUES (?, 'EN_CAMINO', 'Transportista asignado - ruta iniciada')
        `).run(pedidoId);

        db.prepare(`INSERT INTO notificaciones (usuario_id, titulo, mensaje) VALUES (?, ?, ?)`)
            .run(pedido.comprador_usuario_id, '🚚 Pedido Enviado',
                `Tu pedido #${pedidoId} fue recogido y está en camino. Ruta: ${rutaMaps}`);

        const productores = db.prepare(`
            SELECT DISTINCT u.id as usuario_id
            FROM pedido_detalles pd
            JOIN productos pr ON pd.producto_id = pr.id
            JOIN productores prod ON pr.productor_id = prod.id
            JOIN usuarios u ON prod.usuario_id = u.id
            WHERE pd.pedido_id = ?
        `).all(pedidoId);

        for (const prod of productores) {
            db.prepare(`INSERT INTO notificaciones (usuario_id, titulo, mensaje) VALUES (?, ?, ?)`)
                .run(prod.usuario_id, 'Transportista en Camino',
                    `El transportista recogerá los productos del pedido #${pedidoId}.`);
        }

        return { mensaje: 'Ruta aceptada exitosamente', hoja_ruta_id: hojaRutaId, ruta: rutaMaps };
    }

    getMisRutas(transportistaUsuarioId) {
        const db = getConnection();
        const transportista = this._getTransportista(transportistaUsuarioId);

        const rutas = db.prepare(`
            SELECT hr.*, p.monto_total, p.estado as pedido_estado, p.fecha_pedido,
                   comp.ciudad_compra, u.nombre_completo as comprador_nombre
            FROM hojas_ruta hr
            JOIN pedidos p ON hr.pedido_id = p.id
            JOIN compradores comp ON p.comprador_id = comp.id
            JOIN usuarios u ON comp.usuario_id = u.id
            WHERE hr.transportista_id = ?
            ORDER BY hr.fecha_creacion DESC
        `).all(transportista.id);

        return rutas.map(r => ({
            ...r,
            paradas: db.prepare(`
                SELECT rp.*, prod.nombre_finca, prod.provincia, prod.localidad,
                       u.nombre_completo as productor_nombre
                FROM ruta_paradas rp
                JOIN productores prod ON rp.productor_id = prod.id
                JOIN usuarios u ON prod.usuario_id = u.id
                WHERE rp.hoja_ruta_id = ?
                ORDER BY rp.orden_parada
            `).all(r.id),
        }));
    }

    completarRuta(transportistaUsuarioId, hojaRutaId) {
        const db = getConnection();
        const transportista = this._getTransportista(transportistaUsuarioId);

        const ruta = db.prepare(`
            SELECT hr.*, p.comprador_id, comp.usuario_id as comprador_usuario_id
            FROM hojas_ruta hr
            JOIN pedidos p ON hr.pedido_id = p.id
            JOIN compradores comp ON p.comprador_id = comp.id
            WHERE hr.id = ? AND hr.transportista_id = ?
        `).get(hojaRutaId, transportista.id);

        if (!ruta) throw { status: 404, message: 'Ruta no encontrada' };
        if (ruta.estado === 'FINALIZADA') throw { status: 400, message: 'La ruta ya fue finalizada' };

        db.prepare(`
            UPDATE ruta_paradas SET hora_recoleccion = CURRENT_TIMESTAMP
            WHERE hoja_ruta_id = ? AND hora_recoleccion IS NULL
        `).run(hojaRutaId);

        db.prepare(`INSERT INTO notificaciones (usuario_id, titulo, mensaje) VALUES (?, ?, ?)`)
            .run(ruta.comprador_usuario_id, '📦 Pedido en Destino',
                `Tu pedido #${ruta.pedido_id} llegó a destino. Confirma la recepción en Mis Pedidos.`);

        return { mensaje: 'Entrega registrada. Esperando confirmación del comprador.' };
    }
}

module.exports = new TransportistaService();
