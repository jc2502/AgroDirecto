const authService = require('../services/authService');
const { validateRegistrationInput, sanitizeString } = require('../utils/validators');
const { getConnection } = require('../database/connection');

const authController = {
    register(req, res, next) {
        try {
            const data = {
                rol_id: parseInt(req.body.rol_id),
                nombre_completo: sanitizeString(req.body.nombre_completo),
                correo: sanitizeString(req.body.correo),
                password: req.body.password,
                celular: sanitizeString(req.body.celular),
                tipo_productor: sanitizeString(req.body.tipo_productor),
                nombre_finca: sanitizeString(req.body.nombre_finca),
                experiencia_anios: parseInt(req.body.experiencia_anios) || 0,
                tipo_documento: sanitizeString(req.body.tipo_documento),
                numero_documento: sanitizeString(req.body.numero_documento),
                tipo_comprador: sanitizeString(req.body.tipo_comprador),
                nombre_negocio: sanitizeString(req.body.nombre_negocio),
                ciudad_compra: sanitizeString(req.body.ciudad_compra),
                tipo_transporte: sanitizeString(req.body.tipo_transporte),
                capacidad_carga: parseFloat(req.body.capacidad_carga) || 0,
                zona_operacion: sanitizeString(req.body.zona_operacion),
                licencia_conducir: sanitizeString(req.body.licencia_conducir),
                placa_vehiculo: sanitizeString(req.body.placa_vehiculo),
            };

            const validationErrors = validateRegistrationInput(data);
            if (validationErrors) {
                return res.status(400).json({ errors: validationErrors });
            }

            const db = getConnection();
            const existingUser = db.prepare('SELECT id FROM usuarios WHERE correo = ?').get(data.correo);
            if (existingUser) {
                return res.status(409).json({ error: 'El correo ya está registrado' });
            }

            const result = authService.register(data);
            res.status(201).json({ message: 'Registro exitoso', id: result.id });
        } catch (error) {
            next(error);
        }
    },

    login(req, res, next) {
        try {
            const { correo, password } = req.body;

            if (!correo || !password) {
                return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
            }

            const result = authService.login(correo, password);
            res.json(result);
        } catch (error) {
            next(error);
        }
    },

    profile(req, res, next) {
        try {
            const profile = authService.getProfile(req.user.id);
            res.json(profile);
        } catch (error) {
            next(error);
        }
    },
};

module.exports = authController;
