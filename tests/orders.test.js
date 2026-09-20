// definimos el conjunto de pruebas para ordenes

describe('ordersController', () => {
  let ordersController;
  let req;
  let res;

  beforeEach(() => {
    // para borrar la lista cada inicia una prueba
    jest.resetModules();
    ordersController = require('../controllers/orders');

    // estas estructuras nos sirven para poder simular
    // los objetos que van a representar el request y el response
    req = { params: {}, body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  test('crear una orden', () => {
    req.body = {
      customerId: 1,
      total: 1500,
      status: "pendiente"
    };

    ordersController.create(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "Orden creada",
      data: {
        id: 1,
        customerId: 1,
        total: 1500,
        status: "pendiente"
      }
    });
  });

  test('listar todas las ordenes', () => {
    // creamos dos ordenes primero para llenar la lista
    req.body = {
      customerId: 1,
      total: 1500,
      status: "pendiente"
    };

    ordersController.create(req, res);

    req.body = {
      customerId: 2,
      total: 2500,
      status: "enviada"
    };

    ordersController.create(req, res);

    // Ejecutamos list()
    ordersController.list(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "Lista de ordenes",
      data: [
        {
          id: 1,
          customerId: 1,
          total: 1500,
          status: "pendiente"
        },
        {
          id: 2,
          customerId: 2,
          total: 2500,
          status: "enviada"
        }
      ]
    });
  });

  test('obtener una orden por id', () => {
    req.body = {
      customerId: 1,
      total: 1500,
      status: "pendiente"
    };

    ordersController.create(req, res);

    req.params = { id: "1" };

    // llamamos al get de orders, o sea nuestra funcion find
    ordersController.find(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "Orden por id",
      data: {
        id: 1,
        customerId: 1,
        total: 1500,
        status: "pendiente"
      }
    });
  });

  test('actualizar una orden', () => {
    req.body = {
      customerId: 1,
      total: 1500,
      status: "pendiente"
    };

    ordersController.create(req, res);

    req.params = { id: "1" };

    req.body = {
      status: "enviada",
      total: 1700
    };

    // llamamos a nuestra funcion update y le pasamos el request simulado
    ordersController.update(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "Orden actualizada",
      data: {
        id: 1,
        customerId: 1,
        total: 1700,
        status: "enviada"
      }
    });
  });
});