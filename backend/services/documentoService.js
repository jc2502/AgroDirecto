const { getConnection } = require('../database/connection');

class DocumentoService {
    subirDocumento(usuarioId, tipoDocumento, archivo) {
        const db = getConnection();

        const result = db.prepare(`
            INSERT INTO documentos (usuario_id, tipo_documento, archivo)
            VALUES (?, ?, ?)
        `).run(usuarioId, tipoDocumento, archivo);

        db.prepare(`
            UPDATE usuarios SET estado_verificacion = 'PENDIENTE'
            WHERE id = ? AND estado_verificacion = 'REGISTRADO'
        `).run(usuarioId);

        return { id: result.id, archivo };
    }

    listarPorUsuario(usuarioId) {
        const db = getConnection();
        return db.prepare(`
            SELECT * FROM documentos WHERE usuario_id = ? ORDER BY fecha_subida DESC
        `).all(usuarioId);
    }

    listarPendientes() {
        const db = getConnection();
        return db.prepare(`
            SELECT d.*, u.nombre_completo, u.correo, u.celular
            FROM documentos d
            JOIN usuarios u ON d.usuario_id = u.id
            WHERE d.estado = 'PENDIENTE'
            ORDER BY d.fecha_subida ASC
        `).all();
    }

    listarTodos() {
        const db = getConnection();
        return db.prepare(`
            SELECT d.*, u.nombre_completo, u.correo
            FROM documentos d
            JOIN usuarios u ON d.usuario_id = u.id
            ORDER BY d.fecha_subida DESC
        `).all();
    }

    aprobar(documentoId, usuarioId) {
        const db = getConnection();

        db.prepare(`
            UPDATE documentos
            SET estado = 'APROBADO', fecha_revision = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(documentoId);

        const todosAprobados = db.prepare(`
            SELECT COUNT(*) as pendientes FROM documentos
            WHERE usuario_id = ? AND estado != 'APROBADO'
        `).get(usuarioId);

        if (todosAprobados.pendientes === 0) {
            db.prepare(`
                UPDATE usuarios SET estado_verificacion = 'VERIFICADO'
                WHERE id = ?
            `).run(usuarioId);
        }

        return { message: 'Documento aprobado correctamente' };
    }

    rechazar(documentoId, usuarioId, comentario) {
        const db = getConnection();

        if (!comentario || comentario.trim() === '') {
            throw { status: 400, message: 'Debe proporcionar un comentario al rechazar el documento' };
        }

        db.prepare(`
            UPDATE documentos
            SET estado = 'RECHAZADO', comentario_admin = ?, fecha_revision = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(comentario, documentoId);

        db.prepare(`
            UPDATE usuarios SET estado_verificacion = 'RECHAZADO'
            WHERE id = ?
        `).run(usuarioId);

        return { message: 'Documento rechazado' };
    }
}

module.exports = new DocumentoService();
