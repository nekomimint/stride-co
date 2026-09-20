// definimos el conjunto de pruebas para inventario

describe('inventoryController', () => {
  let inventoryController;
  let req;
  let res;

  beforeEach(() => {
    // para borrar la lista cada inicia una prueba
    jest.resetModules();
    inventoryController = require('../controllers/inventory');

    // estas estructuras nos sirven para poder simular
    // los objetos que van a representar el request y el response
    req = { params: {}, body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  test('crear un item de inventario', () => {
    req.body = {
      productId: 1,
      stock: 50
    };

    inventoryController.create(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "invetario craedo",
      data: {
        id: 1,
        productId: 1,
        stock: 50
      }
    });
  });

  test('listar todo el inventario', () => {
    // creamos dos items primero para llenar la lista
    req.body = {
      productId: 1,
      stock: 50
    };

    inventoryController.create(req, res);

    req.body = {
      productId: 2,
      stock: 25
    };

    inventoryController.create(req, res);

    // Ejecutamos list()
    inventoryController.list(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "Lista de inventario",
      data: [
        {
          id: 1,
          productId: 1,
          stock: 50
        },
        {
          id: 2,
          productId: 2,
          stock: 25
        }
      ]
    });
  });

  test('obtener un item de inventario por id', () => {
    req.body = {
      productId: 1,
      stock: 50
    };

    inventoryController.create(req, res);

    req.params = { id: "1" };

    // llamamos al get de inventory, o sea nuestra funcion find
    inventoryController.find(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "Inventario por id",
      data: {
        id: 1,
        productId: 1,
        stock: 50
      }
    });
  });

  test('actualizar un item de inventario', () => {
    req.body = {
      productId: 1,
      stock: 50
    };

    inventoryController.create(req, res);

    req.params = { id: "1" };

    req.body = {
      stock: 75
    };

    // llamamos a nuestra funcion update y le pasamos el request simulado
    inventoryController.update(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "Inventario actualizado",
      data: {
        id: 1,
        productId: 1,
        stock: 75
      }
    });
  });

  test('eliminar un item de inventario', () => {
    req.body = {
      productId: 1,
      stock: 50
    };

    inventoryController.create(req, res);

    req.params = { id: "1" };

    // igual llamamos a nuestra funcion delete y le pasamos nuestro request que simulamos
    inventoryController.destroy(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "Inventario eliminado",
      data: {
        id: 1,
        productId: 1,
        stock: 50
      }
    });
  });
});
