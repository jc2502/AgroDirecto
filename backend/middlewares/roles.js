function authorize(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }

        if (!allowedRoles.includes(req.user.rol_nombre)) {
            return res.status(403).json({
                error: `Acceso denegado. Roles permitidos: ${allowedRoles.join(', ')}`,
            });
        }

        next();
    };
}

module.exports = { authorize };
