//Transforma los datos de la matriz rbac de la base de datos para que sea posible leerlos por la libreria

const { AccessControl } = require('accesscontrol');
const { Role, Permission } = require('../models/relationals'); 

async function buildAccessControl() {
    const ac = new AccessControl();

    const rolesDB = await Role.findAll({
        include: [{
            model: Permission,
            as: 'permissions', 
            attributes: ['key'],
            through: { attributes: [] }
        }]
    });

    rolesDB.forEach(roleInstance => {
        const role = roleInstance.toJSON();
        
        if (role.permissions && Array.isArray(role.permissions)) {
            role.permissions.forEach(perm => {
                // Separa 'products:create:any' en sus partes
                const [resource, action, possession] = perm.key.split(':');
                const grantMethod = `${action}${possession.charAt(0).toUpperCase() + possession.slice(1)}`;

                // Usa grant() para asignar el permiso al rol, no can()
                ac.grant(role.name)[grantMethod](resource);
            });
        }
    });

    return ac;
}

module.exports = { buildAccessControl };