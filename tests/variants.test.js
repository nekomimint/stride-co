// definimos el conjunto de pruebas para variantes
describe('variantsController', () => {
  let variantsController;
  let req;
  let res;

  beforeEach(() => {
    // para borrar la lista cada inicia una prueba
    jest.resetModules();
    variantsController = require('../controllers/variants');

    // estas estructuras nos sirven para poder simular
    // los objetos que van a representar el request y el response
    req = { params: {}, body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  test('crear una variante', () => {
    req.body = {
      sku: "SKU-001",
      color: "Rojo"
    };

    variantsController.create(req, res);

    // en res.json.mock.calls[0][0] se encuentra el objeto recibido
    // en la respuesta res.json(), esto gracias a jest.fn()
    // dentro de .mock se encuentra un arreglo llamado calls,
    // su trabajo es guardar el historial completo de llamadas que ha recibido esa función durante la prueba.
    const response = res.json.mock.calls[0][0];

    expect(response.data).toMatchObject({
      sku: "SKU-001",
      color: "Rojo"
    });

    expect(response.data.id).toBeDefined();
  });

  test('listar todas las variantes', () => {
    // creamos dos variantes primero para llenar la lista
    req.body = {
      sku: "SKU-001",
      color: "Rojo"
    };

    variantsController.create(req, res);

    req.body = {
      sku: "SKU-002",
      color: "Azul"
    };

    variantsController.create(req, res);

    // Ejecutamos list()
    variantsController.list(req, res);

    // la respuesta que de nuestra funcion list estara en [call.length-1]
    // (la ultima respuesta)
    const calls = res.json.mock.calls;
    const response = calls[calls.length - 1][0];

    expect(response.data).toHaveLength(2);

    expect(response.data[0]).toMatchObject({
      sku: "SKU-001",
      color: "Rojo"
    });

    expect(response.data[1]).toMatchObject({
      sku: "SKU-002",
      color: "Azul"
    });
  });

  test('obtener una variante por id', () => {
    req.body = {
      sku: "SKU-001",
      color: "Rojo"
    };

    variantsController.create(req, res);

    req.params = { id: "1" };

    // llamamos al get de variants, o sea nuestra funcion find
    variantsController.find(req, res);

    const calls = res.json.mock.calls;
    const response = calls[calls.length - 1][0];

    expect(response.data).toMatchObject({
      id: 1,
      sku: "SKU-001",
      color: "Rojo"
    });
  });

  test('actualizar una variante', () => {
    req.body = {
      sku: "SKU-001",
      color: "Rojo"
    };

    variantsController.create(req, res);

    req.params = { id: "1" };

    req.body = {
      sku: "SKU-001-UPDATED"
    };

    // llamamos a nuestra funcion update y le pasamos el request simulado
    variantsController.update(req, res);

    const calls = res.json.mock.calls;
    const response = calls[calls.length - 1][0];

    expect(response.data).toMatchObject({
      id: 1,
      sku: "SKU-001-UPDATED",
      color: "Rojo"
    });
  });

  test('eliminar una variante', () => {
    req.body = {
      sku: "SKU-001",
      color: "Rojo"
    };

    variantsController.create(req, res);

    req.params = { id: "1" };

    // igual llamamos a nuestra funcion delete y le pasamos nuestro request que simulamos
    variantsController.destroy(req, res);

    const calls = res.json.mock.calls;
    const response = calls[calls.length - 1][0];

    // verificamos que lo que regresa, o sea lo que borro,
    // sea igual a lo que queriamos borrar
    expect(response.data).toMatchObject({
      id: 1,
      sku: "SKU-001",
      color: "Rojo"
    });
  });
});
