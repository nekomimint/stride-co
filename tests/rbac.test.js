//Creamos los roles falsos para el test
jest.mock('../models/relationals', () =>{
    const roles = [
        {name: 'ADMIN', permissions: [{key: 'products:delete:any'}]},
        {name: 'SALES', permissions: [{key: 'products:read:any'}]},
        {name: 'USERS', permissions: [{key: 'products:read:own'}]},
    ];
    return {
        Role: {
            findAll: jest.fn().mockResolvedValue(
                roles.map((r) => ({toJSON: () => r}))
            ),
        },
        permission: {},
    };
});

//Definir el conjunto de pruebas
describe('authorize (RBAC)', () => {
    let authorize, req, res, next, logSpy;

    beforeEach(() => {
        //Reiniciar el cache de pruebas para mantenerlas aisladas
        jest.resetModules()
        authorize = require('../middlewares/authorize');

        //Objetos de request, response y next
        req = {params: {}, body: {}, user: {}};
        res = {status: jest.fn().mockReturnThis(), json: jest.fn()};
        next = jest.fn();

        //logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });
    //afterEach(() => logSpy.mockRestore());

    test('Acceso permitido', async () => {
        req.user = {role: 'ADMIN'};

        await authorize('products', 'delete', 'any')(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    test('Acceso denegado', async () => {
        req.user = {role: 'SALES'};
        //Espera autorización con el rol
        await authorize('products', 'delete', 'any')(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    test('Recurso propio', async () => {
        req.user = {role: 'USER'};

        await authorize('orders', 'read', 'own')(req, res, next);

        expect(next).toHaveBeenCalled();
    });



    test('Permiso any no asignado', async () => {
        req.user = {role: 'USER'};

        await authorize('orders', 'read', 'any')(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });


})