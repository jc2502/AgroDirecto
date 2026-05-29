const { getConnection } = require('../database/connection');

// Calcular distancia real mediante la Fórmula Haversine
function calculateDistance(lat1, lon1, lat2, lon2) {
    if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined ||
        lat1 === null || lon1 === null || lat2 === null || lon2 === null) {
        return null;
    }
    const R = 6371; // Radio de la Tierra en kilómetros
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return Math.round(d * 10) / 10; // Redondear a 1 decimal
}

const busquedaController = {
    async buscar(req, res, next) {
        try {
            const db = getConnection();
            const {
                lat,
                lng,
                radio,
                categoria_id,
                precio_min,
                precio_max,
                estado,
                search
            } = req.query;

            // Coordenadas del comprador
            let compradorLat = lat ? parseFloat(lat) : null;
            let compradorLng = lng ? parseFloat(lng) : null;

            // Si el comprador está autenticado y no envió coordenadas por query,
            // intentamos obtener sus coordenadas guardadas en el perfil.
            if (req.user && (!compradorLat || !compradorLng)) {
                const comp = db.prepare('SELECT latitud, longitud FROM compradores WHERE usuario_id = ?').get(req.user.id);
                if (comp && comp.latitud && comp.longitud) {
                    compradorLat = comp.latitud;
                    compradorLng = comp.longitud;
                }
            }

            // Construir consulta SQL base
            let sql = `
                SELECT p.id, p.nombre, p.variedad, p.cantidad_disponible, p.unidad_medida,
                       p.precio, p.estado, p.fecha_disponibilidad, p.fecha_publicacion, p.descripcion,
                       c.nombre as categoria_nombre, p.categoria_id,
                       pr.nombre_finca, pr.localidad, pr.municipio, pr.latitud, pr.longitud,
                       u.nombre_completo as productor_nombre,
                       (SELECT ruta_imagen FROM producto_imagenes WHERE producto_id = p.id ORDER BY id ASC LIMIT 1) as imagen_principal
                FROM productos p
                JOIN categorias c ON p.categoria_id = c.id
                JOIN productores pr ON p.productor_id = pr.id
                JOIN usuarios u ON pr.usuario_id = u.id
                WHERE p.estado != 'AGOTADO'
            `;
            const params = [];

            // Filtros no geográficos
            if (categoria_id) {
                sql += ' AND p.categoria_id = ?';
                params.push(parseInt(categoria_id));
            }

            if (precio_min) {
                sql += ' AND p.precio >= ?';
                params.push(parseFloat(precio_min));
            }

            if (precio_max) {
                sql += ' AND p.precio <= ?';
                params.push(parseFloat(precio_max));
            }

            if (estado) {
                sql += ' AND p.estado = ?';
                params.push(estado);
            }

            if (search) {
                sql += ' AND (p.nombre LIKE ? OR p.variedad LIKE ? OR p.descripcion LIKE ?)';
                const term = `%${search}%`;
                params.push(term, term, term);
            }

            // Ejecutar la consulta en SQLite
            const rawProductos = db.prepare(sql).all(...params);

            // Mapear productos, calcular distancia y precio referencial
            let productosFiltrados = rawProductos.map(p => {
                const distancia = calculateDistance(compradorLat, compradorLng, p.latitud, p.longitud);

                // Obtener precio referencial de la base de datos o generar un mock (15% - 25% más caro)
                const ref = db.prepare('SELECT precio_referencia FROM precios_referencia WHERE producto_nombre = ?').get(p.nombre);
                const precioReferencial = ref ? ref.precio_referencia : Math.round(p.precio * 1.2 * 10) / 10;

                return {
                    ...p,
                    distancia_km: distancia,
                    precio_referencial: precioReferencial
                };
            });

            // Filtrar por radio de distancia si aplica
            if (radio && radio !== 'unlimited' && compradorLat && compradorLng) {
                const radioMax = parseFloat(radio);
                productosFiltrados = productosFiltrados.filter(p => p.distancia_km !== null && p.distancia_km <= radioMax);
            }

            // Ordenar por distancia (menor a mayor) si se tienen coordenadas de búsqueda
            if (compradorLat && compradorLng) {
                productosFiltrados.sort((a, b) => {
                    if (a.distancia_km === null) return 1;
                    if (b.distancia_km === null) return -1;
                    return a.distancia_km - b.distancia_km;
                });
            } else {
                // Si no hay coordenadas, ordenar por fecha de publicación descendente
                productosFiltrados.sort((a, b) => new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion));
            }

            res.json(productosFiltrados);
        } catch (error) {
            next(error);
        }
    }
};

module.exports = busquedaController;
