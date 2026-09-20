// definimos el conjunto de pruebas para clientes

describe('customersController', () => {
  let customersController;
  let req;
  let res;

  beforeEach(() => {
    // para borrar la lista cada inicia una prueba
    jest.resetModules();
    customersController = require('../controllers/customers');

    // estas estructuras nos sirven para poder simular
    // los objetos que van a representar el request y el response
    req = { params: {}, body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  test('crear un cliente', () => {
    req.body = {
      name: "Sofia",
      email: "sofia@gmail.com"
    };

    customersController.create(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "Cliente creado",
      data: {
        id: 1,
        name: "Sofia",
        email: "sofia@gmail.com"
      }
    });
  });

  test('listar todos los clientes', () => {
    // creamos dos clientes primero para llenar la lista
    req.body = {
      name: "Sofia",
      email: "sofia@gmail.com"
    };

    customersController.create(req, res);

    req.body = {
      name: "Carlos",
      email: "carlos@gmail.com"
    };

    customersController.create(req, res);

    // Ejecutamos list()
    customersController.list(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "Lista de clientes",
      data: [
        {
          id: 1,
          name: "Sofia",
          email: "sofia@gmail.com"
        },
        {
          id: 2,
          name: "Carlos",
          email: "carlos@gmail.com"
        }
      ]
    });
  });

  test('obtener un cliente por id', () => {
    req.body = {
      name: "Sofia",
      email: "sofia@gmail.com"
    };

    customersController.create(req, res);

    req.params = { id: "1" };

    // llamamos al get de customers, o sea nuestra funcion find
    customersController.find(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "Clientes por id",
      data: {
        id: 1,
        name: "Sofia",
        email: "sofia@gmail.com"
      }
    });
  });

  test('actualizar un cliente', () => {
    req.body = {
      name: "Sofia",
      email: "sofia@gmail.com"
    };

    customersController.create(req, res);

    req.params = { id: "1" };

    req.body = {
      name: "Sofia Updated"
    };

    // llamamos a nuestra funcion update y le pasamos el request simulado
    customersController.update(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "Cliente actualizado",
      data: {
        id: 1,
        name: "Sofia Updated",
        email: "sofia@gmail.com"
      }
    });
  });

  test('eliminar un cliente', () => {
    req.body = {
      name: "Sofia",
      email: "sofia@gmail.com"
    };

    customersController.create(req, res);

    req.params = { id: "1" };

    // igual llamamos a nuestra funcion delete y le pasamos nuestro request que simulamos
    customersController.destroy(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "Cliente eliminado",
      data: {
        id: 1,
        name: "Sofia",
        email: "sofia@gmail.com"
      }
    });
  });
});
