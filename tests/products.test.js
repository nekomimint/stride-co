// definimos el conjunto de pruebas para productos

describe('productsController', () => {
  let productsController;
  let req;
  let res;

  beforeEach(() => {
    // para borrar la lista cada inicia una prueba
    jest.resetModules();
    productsController = require('../controllers/products');

    // estas estructuras nos sirven para poder simular
    // los objetos que van a representar el request y el response
    req = { params: {}, body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  test('crear un producto', () => {
    req.body = {
      name: "Tenis Nike Air",
      price: 2500
    };

    productsController.create(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "Producto creado",
      data: {
        id: 1,
        name: "Tenis Nike Air",
        price: 2500
      }
    });
  });

  test('listar todos los productos', () => {
    // creamos dos productos primero para llenar la lista
    req.body = {
      name: "Tenis Nike Air",
      price: 2500
    };

    productsController.create(req, res);

    req.body = {
      name: "Tenis Adidas",
      price: 2200
    };

    productsController.create(req, res);

    // Ejecutamos list()
    productsController.list(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "Lista de productos",
      data: [
        {
          id: 1,
          name: "Tenis Nike Air",
          price: 2500
        },
        {
          id: 2,
          name: "Tenis Adidas",
          price: 2200
        }
      ]
    });
  });

  test('obtener un producto por id', () => {
    req.body = {
      name: "Tenis Nike Air",
      price: 2500
    };

    productsController.create(req, res);

    req.params = { id: "1" };

    // llamamos al get de products, o sea nuestra funcion find
    productsController.find(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "Product by id",
      data: {
        id: 1,
        name: "Tenis Nike Air",
        price: 2500
      }
    });
  });

  test('actualizar un producto', () => {
    req.body = {
      name: "Tenis Nike Air",
      price: 2500
    };

    productsController.create(req, res);

    req.params = { id: "1" };

    req.body = {
      name: "Tenis Nike Air Max Plus"
    };

    // llamamos a nuestra funcion update y le pasamos el request simulado
    productsController.update(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "producto actualizado",
      data: {
        id: 1,
        name: "Tenis Nike Air Max Plus",
        price: 2500
      }
    });
  });

  test('eliminar un producto', () => {
    req.body = {
      name: "Tenis Nike Air",
      price: 2500
    };

    productsController.create(req, res);

    req.params = { id: "1" };

    // igual llamamos a nuestra funcion delete y le pasamos nuestro request que simulamos
    productsController.destroy(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "producto eliminado",
      data: {
        id: 1,
        name: "Tenis Nike Air",
        price: 2500
      }
    });
  });
});
