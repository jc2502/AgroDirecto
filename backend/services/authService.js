const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getConnection } = require('../database/connection');

class AuthService {
    register(data) {
        const db = getConnection();

        const usuario = db.prepare(`
            INSERT INTO usuarios (rol_id, nombre_completo, correo, password, celular)
            VALUES (?, ?, ?, ?, ?)
        `).run(
            data.rol_id,
            data.nombre_completo,
            data.correo,
            bcrypt.hashSync(data.password, 10),
            data.celular
        );

        if (data.rol_id === 1) {
            db.prepare(`
                INSERT INTO productores (usuario_id, tipo_productor, nombre_finca, experiencia_anios, tipo_documento, numero_documento)
                VALUES (?, ?, ?, ?, ?, ?)
            `).run(usuario.lastInsertRowid, data.tipo_productor, data.nombre_finca, data.experiencia_anios || 0, data.tipo_documento || '', data.numero_documento || '');
        } else if (data.rol_id === 2) {
            db.prepare(`
                INSERT INTO compradores (usuario_id, tipo_comprador, nombre_negocio, ciudad_compra)
                VALUES (?, ?, ?, ?)
            `).run(usuario.lastInsertRowid, data.tipo_comprador, data.nombre_negocio || '', data.ciudad_compra || '');
        } else if (data.rol_id === 3) {
            db.prepare(`
                INSERT INTO transportistas (usuario_id, tipo_transporte, capacidad_carga, zona_operacion, licencia_conducir, placa_vehiculo)
                VALUES (?, ?, ?, ?, ?, ?)
            `).run(usuario.lastInsertRowid, data.tipo_transporte, data.capacidad_carga || 0, data.zona_operacion || '', data.licencia_conducir || '', data.placa_vehiculo || '');
        }

        return { id: usuario.lastInsertRowid, correo: data.correo };
    }

    login(correo, password) {
        const db = getConnection();

        const usuario = db.prepare(`
            SELECT u.*, r.nombre as rol_nombre
            FROM usuarios u
            JOIN roles r ON u.rol_id = r.id
            WHERE u.correo = ?
        `).get(correo);

        if (!usuario) {
            throw { status: 401, message: 'Credenciales inválidas' };
        }

        if (!bcrypt.compareSync(password, usuario.password)) {
            throw { status: 401, message: 'Credenciales inválidas' };
        }

        const token = jwt.sign(
            {
                id: usuario.id,
                rol_id: usuario.rol_id,
                rol_nombre: usuario.rol_nombre,
                correo: usuario.correo,
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        return {
            token,
            user: {
                id: usuario.id,
                nombre_completo: usuario.nombre_completo,
                correo: usuario.correo,
                celular: usuario.celular,
                rol_id: usuario.rol_id,
                rol_nombre: usuario.rol_nombre,
                estado_verificacion: usuario.estado_verificacion,
                foto_perfil: usuario.foto_perfil,
            },
        };
    }

    getProfile(usuarioId) {
        const db = getConnection();

        const usuario = db.prepare(`
            SELECT u.id, u.nombre_completo, u.correo, u.celular, u.foto_perfil,
                   u.estado_verificacion, u.fecha_registro, r.nombre as rol_nombre, r.id as rol_id
            FROM usuarios u
            JOIN roles r ON u.rol_id = r.id
            WHERE u.id = ?
        `).get(usuarioId);

        if (!usuario) {
            throw { status: 404, message: 'Usuario no encontrado' };
        }

        let perfil = null;
        if (usuario.rol_id === 1) {
            perfil = db.prepare('SELECT * FROM productores WHERE usuario_id = ?').get(usuarioId);
        } else if (usuario.rol_id === 2) {
            perfil = db.prepare('SELECT * FROM compradores WHERE usuario_id = ?').get(usuarioId);
        } else if (usuario.rol_id === 3) {
            perfil = db.prepare('SELECT * FROM transportistas WHERE usuario_id = ?').get(usuarioId);
        }

        return { ...usuario, perfil };
    }
}

module.exports = new AuthService();
