const { buildAccessControl } = require('../config/rbac');

const authorize = (resource, action, possession = 'any') => {
    return async (req, res, next) => {
        try {
            //Cargar las reglas desde la base de datos
            const ac = await buildAccessControl();

            // Extraer el rol del token
            const userRole = req.auth?.role || req.user?.role;

            if (!userRole) {
                return res.status(403).json({ message: '403 Forbidden: Sin rol asignado en el token' });
            }

            const grantMethod = `${action}${possession.charAt(0).toUpperCase() + possession.slice(1)}`;

            //debuggear
            console.log("===== DEBUG RBAC =====");
            console.log("Rol extraído:", userRole);
            console.log("Permiso evaluado:", grantMethod, "sobre el recurso:", resource);
            
            //Evalua si AccessControl otorga el permiso
            const permission = ac.can(String(userRole))[grantMethod]?.(resource);

            console.log("Concedido:", permission ? permission.granted : false);
            console.log("======================");

            if (!permission || !permission.granted) {
                return res.status(403).json({ message: '403 Forbidden: No tienes permiso' });
            }

            // Si todo está bien, pasa al controlador
            next();
        } catch (error) {
            console.error("Error en middleware RBAC:", error);
            return res.status(500).json({ message: "Error interno verificando permisos" });
        }
    };
};

module.exports = authorize;