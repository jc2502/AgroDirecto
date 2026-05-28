const documentoService = require('../services/documentoService');

const documentoController = {
    subir(req, res, next) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'Debe seleccionar un archivo para subir' });
            }

            const { tipo_documento } = req.body;
            if (!tipo_documento) {
                return res.status(400).json({ error: 'El tipo de documento es requerido' });
            }

            const archivo = `uploads/documentos/${req.file.filename}`;
            const result = documentoService.subirDocumento(req.user.id, tipo_documento, archivo);

            res.status(201).json({
                message: 'Documento subido correctamente',
                documento: { id: result.id, archivo: result.archivo },
            });
        } catch (error) {
            next(error);
        }
    },

    listarMisDocumentos(req, res, next) {
        try {
            const documentos = documentoService.listarPorUsuario(req.user.id);
            res.json(documentos);
        } catch (error) {
            next(error);
        }
    },

    listarPendientes(req, res, next) {
        try {
            const documentos = documentoService.listarPendientes();
            res.json(documentos);
        } catch (error) {
            next(error);
        }
    },

    listarTodos(req, res, next) {
        try {
            const documentos = documentoService.listarTodos();
            res.json(documentos);
        } catch (error) {
            next(error);
        }
    },

    aprobar(req, res, next) {
        try {
            const { id } = req.params;
            const db = require('../database/connection').getConnection();
            const documento = db.prepare('SELECT * FROM documentos WHERE id = ?').get(id);

            if (!documento) {
                return res.status(404).json({ error: 'Documento no encontrado' });
            }

            const result = documentoService.aprobar(parseInt(id), documento.usuario_id);
            res.json(result);
        } catch (error) {
            next(error);
        }
    },

    rechazar(req, res, next) {
        try {
            const { id } = req.params;
            const { comentario } = req.body;

            const db = require('../database/connection').getConnection();
            const documento = db.prepare('SELECT * FROM documentos WHERE id = ?').get(id);

            if (!documento) {
                return res.status(404).json({ error: 'Documento no encontrado' });
            }

            const result = documentoService.rechazar(parseInt(id), documento.usuario_id, comentario);
            res.json(result);
        } catch (error) {
            next(error);
        }
    },
};

module.exports = documentoController;
