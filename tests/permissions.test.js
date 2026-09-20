describe('permisionsController', () => {
    let permissionsController;
    let req;
    let res;

    beforeEach(() => {
        // para borrar la lista cada inicia una prueba
        jest.resetModules();
        permissionsController = require('../controllers/permissions');

        // estas estructuras nos sirven para poder simular
        // los objetos que van a representar el request y  el response
        req = { params: {}, body: {} };
        res = {status: jest.fn().mockReturnThis(),json: jest.fn() };
    });

   test('listar permisos', () => {
        permissionsController.list(req, res);

        // tenemos que obtener todo lo que haya:
        expect(res.json).toHaveBeenCalledWith({
            message: "Lista de permisos",
            data: [
                {
                    id: 1,
                    name: "users.read",
                    description: "Permiso para consultar usuarios"
                },
                {
                    id: 2,
                    name: "users.create",
                    description: "Permiso para crear usuarios"
                }
            ]
        });
    });

    test('obtener permiso por id', () => {
        
        req.params = { id: 1 };
        permissionsController.find(req, res);

        // lo que obtenemos tiene que tener esta estructura:
        expect(res.json).toHaveBeenCalledWith({
            message: "permisos por id",
            data: {
                id: 1,
                name: "users.read",
                description: "Permiso para consultar usuarios"
            }
        });
    });
});



  
