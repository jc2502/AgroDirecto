const { getConnection } = require('../database/connection');

class NotificacionService {
    getByUsuario(usuarioId) {
        const db = getConnection();
        return db.prepare(`
            SELECT id, titulo, mensaje, leido, fecha_envio
            FROM notificaciones
            WHERE usuario_id = ?
            ORDER BY fecha_envio DESC
        `).all(usuarioId);
    }

    marcarLeido(notificacionId, usuarioId) {
        const db = getConnection();
        const result = db.prepare(
            'UPDATE notificaciones SET leido = 1 WHERE id = ? AND usuario_id = ?'
        ).run(notificacionId, usuarioId);
        if (result.changes === 0) {
            throw { status: 404, message: 'Notificación no encontrada' };
        }
        return { message: 'Notificación marcada como leída' };
    }

    marcarTodasLeido(usuarioId) {
        const db = getConnection();
        db.prepare('UPDATE notificaciones SET leido = 1 WHERE usuario_id = ?').run(usuarioId);
        return { message: 'Todas las notificaciones marcadas como leídas' };
    }

    contarNoLeidas(usuarioId) {
        const db = getConnection();
        const result = db.prepare(
            'SELECT COUNT(*) as total FROM notificaciones WHERE usuario_id = ? AND leido = 0'
        ).get(usuarioId);
        return result.total;
    }
}

module.exports = new NotificacionService();
