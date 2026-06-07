const { getConnection } = require('../database/connection');

class CarritoService {
    _getComprador(compradorUsuarioId) {
        const db = getConnection();
        const comprador = db.prepare('SELECT id FROM compradores WHERE usuario_id = ?').get(compradorUsuarioId);
        if (!comprador) throw { status: 403, message: 'Debe tener perfil de comprador' };
        return comprador;
    }

    _getOrCreateCarrito(compradorId) {
        const db = getConnection();
        let carrito = db.prepare('SELECT id FROM carritos WHERE comprador_id = ?').get(compradorId);
        if (!carrito) {
            const res = db.prepare('INSERT INTO carritos (comprador_id) VALUES (?)').run(compradorId);
            carrito = { id: res.lastInsertRowid };
        }
        return carrito;
    }

    getCarrito(compradorUsuarioId) {
        const db = getConnection();
        const comprador = this._getComprador(compradorUsuarioId);
        const carrito = this._getOrCreateCarrito(comprador.id);

        const items = db.prepare(`
            SELECT ci.id, ci.cantidad, ci.producto_id,
                   p.nombre, p.precio, p.unidad_medida, p.cantidad_disponible, p.estado,
                   pr.nombre_finca, pr.provincia, pr.localidad,
                   (SELECT ruta_imagen FROM producto_imagenes WHERE producto_id = p.id ORDER BY id ASC LIMIT 1) as imagen
            FROM carrito_items ci
            JOIN productos p ON ci.producto_id = p.id
            JOIN productores pr ON p.productor_id = pr.id
            WHERE ci.carrito_id = ?
        `).all(carrito.id);

        const total = items.reduce((sum, i) => sum + i.cantidad * i.precio, 0);
        return { carrito_id: carrito.id, items, total, cantidad_items: items.length };
    }

    addItem(compradorUsuarioId, productoId, cantidad) {
        const db = getConnection();
        const comprador = this._getComprador(compradorUsuarioId);
        const carrito = this._getOrCreateCarrito(comprador.id);

        const producto = db.prepare('SELECT * FROM productos WHERE id = ? AND activo = 1').get(productoId);
        if (!producto) throw { status: 404, message: 'Producto no encontrado' };
        if (producto.estado !== 'DISPONIBLE') {
            throw { status: 400, message: 'Solo productos disponibles pueden agregarse al carrito' };
        }
        if (parseFloat(cantidad) <= 0) throw { status: 400, message: 'La cantidad debe ser mayor a 0' };
        if (producto.cantidad_disponible < parseFloat(cantidad)) {
            throw { status: 400, message: `Stock insuficiente. Disponible: ${producto.cantidad_disponible}` };
        }

        const existing = db.prepare(
            'SELECT id, cantidad FROM carrito_items WHERE carrito_id = ? AND producto_id = ?'
        ).get(carrito.id, productoId);

        if (existing) {
            const nuevaCantidad = existing.cantidad + parseFloat(cantidad);
            if (producto.cantidad_disponible < nuevaCantidad) {
                throw { status: 400, message: `Stock insuficiente para la cantidad total en carrito` };
            }
            db.prepare('UPDATE carrito_items SET cantidad = ? WHERE id = ?').run(nuevaCantidad, existing.id);
        } else {
            db.prepare(
                'INSERT INTO carrito_items (carrito_id, producto_id, cantidad) VALUES (?, ?, ?)'
            ).run(carrito.id, productoId, parseFloat(cantidad));
        }

        return this.getCarrito(compradorUsuarioId);
    }

    updateItem(compradorUsuarioId, itemId, cantidad) {
        const db = getConnection();
        const comprador = this._getComprador(compradorUsuarioId);
        const carrito = this._getOrCreateCarrito(comprador.id);

        const item = db.prepare(`
            SELECT ci.*, p.cantidad_disponible FROM carrito_items ci
            JOIN productos p ON ci.producto_id = p.id
            WHERE ci.id = ? AND ci.carrito_id = ?
        `).get(itemId, carrito.id);

        if (!item) throw { status: 404, message: 'Ítem no encontrado en el carrito' };
        if (parseFloat(cantidad) <= 0) throw { status: 400, message: 'La cantidad debe ser mayor a 0' };
        if (item.cantidad_disponible < parseFloat(cantidad)) {
            throw { status: 400, message: 'Stock insuficiente' };
        }

        db.prepare('UPDATE carrito_items SET cantidad = ? WHERE id = ?').run(parseFloat(cantidad), itemId);
        return this.getCarrito(compradorUsuarioId);
    }

    removeItem(compradorUsuarioId, itemId) {
        const db = getConnection();
        const comprador = this._getComprador(compradorUsuarioId);
        const carrito = this._getOrCreateCarrito(comprador.id);

        const result = db.prepare('DELETE FROM carrito_items WHERE id = ? AND carrito_id = ?').run(itemId, carrito.id);
        if (result.changes === 0) throw { status: 404, message: 'Ítem no encontrado' };
        return this.getCarrito(compradorUsuarioId);
    }

    clearCarrito(compradorId) {
        const db = getConnection();
        const carrito = db.prepare('SELECT id FROM carritos WHERE comprador_id = ?').get(compradorId);
        if (carrito) {
            db.prepare('DELETE FROM carrito_items WHERE carrito_id = ?').run(carrito.id);
        }
    }
}

module.exports = new CarritoService();
