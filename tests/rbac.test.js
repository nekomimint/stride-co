// Creamos los roles falsos para el test
// Se necesita actualizar node a la versión 24.9 y usar el comando "npm i accesscontrol@2.2.1"
jest.mock('../models/relationals', () => {
    const roles = [
        {name: 'ADMIN', permissions: [{key: 'orders:delete:any'}]},
        {name: 'SALES', permissions: [{key: 'orders:read:any'}]},
        {name: 'USER', permissions: [{key: 'orders:read:own'}]},
    ];
    return {
        Role: {
            findAll: jest.fn().mockResolvedValue(
                roles.map((r) => ({toJSON: () => r}))
            ),
        },
        Permission: {},
    };
});

// Modelos falsos para el controlador (Order y Customer)
jest.mock('../models/documents', () => ({
    Order: {
        findByPk: jest.fn(),
        findById: jest.fn()
    },
    Customer: {
        findOne: jest.fn()
    }
}));


// Definir el conjunto de pruebas
describe('authorize (RBAC)', () => {
    let authorize, ordersController, Order, Customer, req, res, next, logSpy;

    beforeEach(() => {
        // Reiniciar el cache de pruebas para mantenerlas aisladas
        jest.resetModules();
        authorize = require('../middlewares/authorize');
        ordersController = require('../controllers/orders');
        Order = require('../models/documents').Order;
        Customer = require('../models/documents').Customer;

        // Objetos de request, response y next
        req = {params: {}, body: {}, user: {}};
        res = {status: jest.fn().mockReturnThis(), json: jest.fn()};
        next = jest.fn();

        logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });
    afterEach(() => logSpy.mockRestore());

    test('Acceso permitido', async () => {
        req.user = {role: 'ADMIN'};

        await authorize('orders', 'delete', 'any')(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    test('Acceso denegado', async () => {
        req.user = {role: 'SALES'};
        // Espera autorización con el rol
        await authorize('orders', 'delete', 'any')(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    test('Recurso propio', async () => {
        req.user = {id: 7, role: 'USER'};

        await authorize('orders', 'read', 'own')(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.canAny).toBe(false);
    });

    test('Recurso de otro usuario', async () => {
        const customReq = {
            user: { id: 7, role: 'USER' },
            auth: { sub: 'customer-id-7' },
            params: { id: '1' }
        };

        const customRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        
        const customNext = jest.fn();

        // Ejecutamos el middleware authorize primero
        await authorize('orders', 'read', 'own')(customReq, customRes, customNext);

        // Mock de la orden (pertenece a otro customerId)
        Order.findById.mockResolvedValue({ id: 1, customerId: 'customer-id-99' });

        // Mock de Customer para que devuelva el cliente del token
        Customer.findOne.mockResolvedValue({ _id: 'customer-id-7' });

        // Ejecutamos el controlador pasando los objetos personalizados
        await ordersController.find(customReq, customRes, customNext);

        // Verificamos que responda con 403 porque los IDs no coinciden
        expect(customRes.status).toHaveBeenCalledWith(403);
        expect(customRes.json).toHaveBeenCalledWith({ message: 'La orden no pertenece al usuario actual' });
    });

    test('Permiso any no asignado', async () => {
        req.user = {role: 'USER'};

        await authorize('orders', 'read', 'any')(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });
});