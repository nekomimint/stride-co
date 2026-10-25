//Creamos los roles falsos para el test
jest.mock('../models/relationals', () =>{
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

//Modelo de ordenes falso para el controlador
jest.mock('../models/documents', () =>({
    Order: {findByPk: jest.fn()},
}));

//Definir el conjunto de pruebas
describe('authorize (RBAC)', () => {
    let authorize, ordersController, Order, req, res, next, logSpy;

    beforeEach(() => {
        //Reiniciar el cache de pruebas para mantenerlas aisladas
        jest.resetModules()
        authorize = require('../middlewares/authorize');
        ordersController = require('../controllers/orders');
        Order = require('../models/documents').Order;

        //Objetos de request, response y next
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
        //Espera autorización con el rol
        await authorize('orders', 'delete', 'any')(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    test('Recurso propio', async () => {
        req.user = {id:7, role: 'USER'};

        await authorize('orders', 'read', 'own')(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.canAny).toBe(false);
    });

    test('Recurso de otro usuario', async () => {
        req.user = {id:7, role: 'USER'};

        await authorize('orders', 'read', 'own')(req, res, next);
        expect(next).toHaveBeenCalled();

        //El controlador rechaza porque la orden es de otro usuario
        Order.findByPk.mockResolvedValue({id: 1, userId: 99});
        req.params = {id: '1'}

        await ordersController.find(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
    });

    test('Permiso any no asignado', async () => {
        req.user = {role: 'USER'};

        await authorize('orders', 'read', 'any')(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

});