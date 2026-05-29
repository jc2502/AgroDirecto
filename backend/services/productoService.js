const { getConnection } = require('../database/connection');

class ProductoService {
    create(productorId, data, imagenes) {
        const db = getConnection();
        const producto = db.prepare(`
            INSERT INTO productos (productor_id, categoria_id, nombre, variedad,
                cantidad_disponible, unidad_medida, precio, descripcion, estado, fecha_disponibilidad)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            productorId, data.categoria_id, data.nombre, data.variedad || null,
            data.cantidad_disponible, data.unidad_medida, data.precio,
            data.descripcion || null,
            data.fecha_disponibilidad ? 'PREVENTA' : 'DISPONIBLE',
            data.fecha_disponibilidad || null
        );

        if (imagenes && imagenes.length > 0) {
            const insertImg = db.prepare(
                'INSERT INTO producto_imagenes (producto_id, ruta_imagen) VALUES (?, ?)'
            );
            for (const img of imagenes) {
                insertImg.run(producto.lastInsertRowid, img);
            }
        }

        return producto.lastInsertRowid;
    }

    update(productoId, productorId, data) {
        const db = getConnection();
        const producto = db.prepare(
            'SELECT * FROM productos WHERE id = ? AND productor_id = ?'
        ).get(productoId, productorId);

        if (!producto) {
            throw { status: 404, message: 'Producto no encontrado o no autorizado' };
        }

        const cantidad = data.cantidad_disponible !== undefined
            ? data.cantidad_disponible : producto.cantidad_disponible;

        let estado = producto.estado;
        if (parseFloat(cantidad) <= 0) {
            estado = 'AGOTADO';
        } else if (data.fecha_disponibilidad || producto.fecha_disponibilidad) {
            estado = 'PREVENTA';
        } else {
            estado = 'DISPONIBLE';
        }

        db.prepare(`
            UPDATE productos SET categoria_id = ?, nombre = ?, variedad = ?,
                cantidad_disponible = ?, unidad_medida = ?, precio = ?,
                descripcion = ?, estado = ?, fecha_disponibilidad = ?
            WHERE id = ? AND productor_id = ?
        `).run(
            data.categoria_id || producto.categoria_id,
            data.nombre || producto.nombre,
            data.variedad !== undefined ? data.variedad : producto.variedad,
            cantidad,
            data.unidad_medida || producto.unidad_medida,
            data.precio || producto.precio,
            data.descripcion !== undefined ? data.descripcion : producto.descripcion,
            estado,
            data.fecha_disponibilidad !== undefined ? data.fecha_disponibilidad : producto.fecha_disponibilidad,
            productoId, productorId
        );

        return { message: 'Producto actualizado' };
    }

    delete(productoId, productorId) {
        const db = getConnection();
        const producto = db.prepare(
            'SELECT * FROM productos WHERE id = ? AND productor_id = ?'
        ).get(productoId, productorId);

        if (!producto) {
            throw { status: 404, message: 'Producto no encontrado o no autorizado' };
        }

        db.prepare('DELETE FROM producto_imagenes WHERE producto_id = ?').run(productoId);
        db.prepare('DELETE FROM productos WHERE id = ?').run(productoId);

        return { message: 'Producto eliminado' };
    }

    getById(productoId) {
        const db = getConnection();
        const producto = db.prepare(`
            SELECT p.*, c.nombre as categoria_nombre,
                   pr.nombre_finca, pr.localidad, pr.municipio,
                   pr.latitud, pr.longitud,
                   u.nombre_completo as productor_nombre, u.celular
            FROM productos p
            JOIN categorias c ON p.categoria_id = c.id
            JOIN productores pr ON p.productor_id = pr.id
            JOIN usuarios u ON pr.usuario_id = u.id
            WHERE p.id = ?
        `).get(productoId);

        if (!producto) {
            throw { status: 404, message: 'Producto no encontrado' };
        }

        const imagenes = db.prepare(
            'SELECT * FROM producto_imagenes WHERE producto_id = ? ORDER BY id ASC'
        ).all(productoId);

        return { ...producto, imagenes };
    }

    getByProductor(usuarioId) {
        const db = getConnection();
        const productor = db.prepare('SELECT id FROM productores WHERE usuario_id = ?').get(usuarioId);
        if (!productor) {
            throw { status: 404, message: 'Perfil de productor no encontrado' };
        }

        const productos = db.prepare(`
            SELECT p.*, c.nombre as categoria_nombre,
                   (SELECT COUNT(*) FROM producto_imagenes WHERE producto_id = p.id) as total_imagenes
            FROM productos p
            JOIN categorias c ON p.categoria_id = c.id
            WHERE p.productor_id = ?
            ORDER BY p.fecha_publicacion DESC
        `).all(productor.id);

        return productos;
    }

    listAll(filters = {}) {
        const db = getConnection();
        let sql = `
            SELECT p.id, p.nombre, p.variedad, p.cantidad_disponible, p.unidad_medida,
                   p.precio, p.estado, p.fecha_disponibilidad, p.fecha_publicacion,
                   c.nombre as categoria_nombre,
                   pr.nombre_finca, pr.localidad, pr.municipio,
                   pr.latitud, pr.longitud,
                   u.nombre_completo as productor_nombre,
                   (SELECT ruta_imagen FROM producto_imagenes WHERE producto_id = p.id ORDER BY id ASC LIMIT 1) as imagen_principal
            FROM productos p
            JOIN categorias c ON p.categoria_id = c.id
            JOIN productores pr ON p.productor_id = pr.id
            JOIN usuarios u ON pr.usuario_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (filters.categoria_id) {
            sql += ' AND p.categoria_id = ?';
            params.push(filters.categoria_id);
        }

        if (filters.estado) {
            sql += ' AND p.estado = ?';
            params.push(filters.estado);
        }

        if (filters.disponible) {
            sql += " AND p.estado != 'AGOTADO'";
        }

        if (filters.search) {
            sql += ' AND (p.nombre LIKE ? OR p.variedad LIKE ? OR p.descripcion LIKE ?)';
            const term = `%${filters.search}%`;
            params.push(term, term, term);
        }

        sql += ' ORDER BY p.fecha_publicacion DESC';

        return db.prepare(sql).all(...params);
    }

    updateStock(productoId, productorId, cantidad) {
        const db = getConnection();
        const producto = db.prepare(
            'SELECT * FROM productos WHERE id = ? AND productor_id = ?'
        ).get(productoId, productorId);

        if (!producto) {
            throw { status: 404, message: 'Producto no encontrado' };
        }

        if (parseFloat(cantidad) < 0) {
            throw { status: 400, message: 'El stock no puede ser negativo' };
        }

        const estado = parseFloat(cantidad) === 0 ? 'AGOTADO' : producto.estado === 'AGOTADO' ? 'DISPONIBLE' : producto.estado;

        db.prepare('UPDATE productos SET cantidad_disponible = ?, estado = ? WHERE id = ?')
            .run(cantidad, estado, productoId);

        return { message: 'Stock actualizado', estado };
    }
}

module.exports = new ProductoService();
