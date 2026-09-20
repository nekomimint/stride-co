// definimos el conjutno de pruebas para usuario s
describe('usersController', () => {
  let usersController;
  let req;
  let res;

  beforeEach(() => {
    // para borrar la lista cada inicia una prueba
    jest.resetModules();
    usersController = require('../controllers/users');


    // estas estructuras nos sirven para poder simular
    // los objetos que van a representar el request y  el response
    req = { params: {}, body: {} };
    res = {status: jest.fn().mockReturnThis(),json: jest.fn() };

  });

  test('crear un usuario', () => 
    {
    req.body = { name: "Sofia", email: "sofia@gmail.com"

    };

    usersController.create(req, res);

    // en  res.json.mock.calls[0][0] se encuentra el objeto recibido 
    // en la respuesta res.json(), esto gracias a jest.fn()

    //dentro de .mock se encuentra un arreglo llamado calls, 
    //su trabajo es guardar el historial completo de llamadas que ha recibido esa función durante la prueba.

    const response = res.json.mock.calls[0][0];

    expect(response.data).toMatchObject({
      name: "Sofia",
      email: "sofia@gmail.com"
    });
    expect(response.data.id).toBeDefined();
  });

  test('listar todos los usuarios', () => {
    // creamos dos usuarios primero para llenar la lista
    req.body = { name: "Amir", email: "amir@gmail.com" };
    usersController.create(req, res);

    req.body = { name: "Alan", email: "alan@gmail.com" };
    usersController.create(req, res);

    // Ejecutamos list()
    usersController.list(req, res);

    // la respuesta que de nuestra funcion list estara en [call.length-1] 
    // (la ultima respuesta)
    const calls = res.json.mock.calls;
    const response = calls[calls.length - 1][0];

    expect(response.data).toHaveLength(2);
    expect(response.data[0]).toMatchObject({ name: "Amir" });
    expect(response.data[1]).toMatchObject({ name: "Alan" });
  });


  test('obtener un usuario por id', () => 
    {
    req.body = { name: "Sofia", email: "sofia@gmail.com" };
    usersController.create(req, res);

    req.params = { id: "1" };
    // llamamos al get de users, o sea nuestra funcion find
    usersController.find(req, res);

    const calls = res.json.mock.calls;
    const response = calls[calls.length - 1][0];

    expect(response.data).toMatchObject({
      id: 1,
      name: "Sofia",
      email: "sofia@gmail.com"
    });
  });

  test('actualizar un usuario', () => {
    req.body = { name: "Sofia", email: "sofia@gmail.com" };
    usersController.create(req, res);

    req.params = { id: "1" };
    req.body = { name: "Sofia Updated" };
    // llamamos a nuestra funcion update y le pasamos el request simulado
    usersController.update(req, res);

    const calls = res.json.mock.calls;
    const response = calls[calls.length - 1][0];

    expect(response.data).toMatchObject({
      id: 1,
      name: "Sofia Updated",
      email: "sofia@gmail.com"
    });
  });

  test('eliminar un usuario', () => {
    req.body = { name: "Sofia", email: "sofia@gmail.com" };
    usersController.create(req, res);

    req.params = { id: "1" };
     // igual llamamos a nuestra funcion delete y le pasamos nuestr request que simulamos
    usersController.destroy(req, res);

    const calls = res.json.mock.calls;
    const response = calls[calls.length - 1][0];

    // verificamos que lo que regresa, o sea lo que borro, sea igual a lo que queriamos borrar
    expect(response.data).toMatchObject({
      id: 1,
      name: "Sofia",
      email: "sofia@gmail.com"
    });
  });
});


  
