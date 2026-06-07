const { getConnection } = require('../database/connection');

class AnalyticsService {
    getKPIs() {
        const db = getConnection();

        const pedidosStats = db.prepare(`
            SELECT
                COUNT(*) as total_pedidos,
                COALESCE(SUM(monto_total), 0) as ingresos_totales,
                COALESCE(AVG(monto_total), 0) as ticket_promedio
            FROM pedidos
            WHERE estado NOT IN ('CANCELADO')
        `).get();

        const pedidosPorEstado = db.prepare(`
            SELECT estado, COUNT(*) as cantidad
            FROM pedidos GROUP BY estado
        `).all();

        const ventasPorProvincia = db.prepare(`
            SELECT prod.provincia, COUNT(DISTINCT p.id) as pedidos,
                   COALESCE(SUM(pd.subtotal), 0) as monto
            FROM pedido_detalles pd
            JOIN productos pr ON pd.producto_id = pr.id
            JOIN productores prod ON pr.productor_id = prod.id
            JOIN pedidos p ON pd.pedido_id = p.id
            WHERE p.estado IN ('LISTO_DESPACHO', 'EN_CAMINO', 'COMPLETADO')
            GROUP BY prod.provincia
            ORDER BY monto DESC
        `).all();

        const ventasPorCategoria = db.prepare(`
            SELECT c.nombre as categoria, COUNT(pd.id) as items,
                   COALESCE(SUM(pd.subtotal), 0) as monto
            FROM pedido_detalles pd
            JOIN productos pr ON pd.producto_id = pr.id
            JOIN categorias c ON pr.categoria_id = c.id
            JOIN pedidos p ON pd.pedido_id = p.id
            WHERE p.estado NOT IN ('CANCELADO', 'PENDIENTE', 'PAGO_PENDIENTE')
            GROUP BY c.nombre
            ORDER BY monto DESC
        `).all();

        const produccionGeografica = db.prepare(`
            SELECT prod.provincia, prod.municipio, prod.localidad,
                   prod.latitud, prod.longitud, prod.nombre_finca,
                   COUNT(DISTINCT pr.id) as productos_activos,
                   prod.total_ventas
            FROM productores prod
            LEFT JOIN productos pr ON pr.productor_id = prod.id AND pr.estado != 'AGOTADO'
            WHERE prod.latitud IS NOT NULL
            GROUP BY prod.id
        `).all();

        const comprasLegacy = db.prepare(`
            SELECT COUNT(*) as total, COALESCE(SUM(total), 0) as monto
            FROM compras WHERE estado = 'ENTREGADO'
        `).get();

        const ventasMensuales = db.prepare(`
            SELECT strftime('%Y-%m', fecha_pedido) as mes,
                   COUNT(*) as pedidos, COALESCE(SUM(monto_total), 0) as monto
            FROM pedidos
            WHERE estado NOT IN ('CANCELADO')
            GROUP BY mes ORDER BY mes DESC LIMIT 6
        `).all();

        const transportistasActivos = db.prepare(`
            SELECT COUNT(DISTINCT transportista_id) as total FROM hojas_ruta
        `).get();

        return {
            resumen: {
                total_pedidos: pedidosStats.total_pedidos + (comprasLegacy.total || 0),
                ingresos_totales: pedidosStats.ingresos_totales + (comprasLegacy.monto || 0),
                ticket_promedio: pedidosStats.ticket_promedio,
                transportistas_activos: transportistasActivos.total,
                productores_registrados: db.prepare('SELECT COUNT(*) as c FROM productores').get().c,
                compradores_registrados: db.prepare('SELECT COUNT(*) as c FROM compradores').get().c,
            },
            pedidos_por_estado: pedidosPorEstado,
            ventas_por_provincia: ventasPorProvincia,
            ventas_por_categoria: ventasPorCategoria,
            produccion_geografica: produccionGeografica,
            ventas_mensuales: ventasMensuales,
            generado_en: new Date().toISOString(),
        };
    }
}

module.exports = new AnalyticsService();
