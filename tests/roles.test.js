// definimos el conjunto de pruebas para roles

describe('rolesController', () => {
  let rolesController;
  let req;
  let res;

  beforeEach(() => {
    // para borrar la lista cada inicia una prueba
    jest.resetModules();
    rolesController = require('../controllers/roles');

    // estas estructuras nos sirven para poder simular
    // los objetos que van a representar el request y el response
    req = { params: {}, body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  test('crear un rol', () => {
    req.body = {
      name: "Administrador",
      description: "Rol con permisos administrativos"
    };

    rolesController.create(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "Rol creado",
      data: {
        id: 1,
        name: "Administrador",
        description: "Rol con permisos administrativos"
      }
    });
  });

  test('listar todos los roles', () => {
    // creamos dos roles primero para llenar la lista
    req.body = {
      name: "Administrador",
      description: "Rol con permisos administrativos"
    };

    rolesController.create(req, res);

    req.body = {
      name: "Usuario",
      description: "Rol para usuarios normales"
    };

    rolesController.create(req, res);

    // Ejecutamos list()
    rolesController.list(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "Role list",
      data: [
        {
          id: 1,
          name: "Administrador",
          description: "Rol con permisos administrativos"
        },
        {
          id: 2,
          name: "Usuario",
          description: "Rol para usuarios normales"
        }
      ]
    });
  });

  test('obtener un rol por id', () => {
    req.body = {
      name: "Administrador",
      description: "Rol con permisos administrativos"
    };

    rolesController.create(req, res);

    req.params = { id: "1" };

    // llamamos al get de roles, o sea nuestra funcion find
    rolesController.find(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "Rol por id",
      data: {
        id: 1,
        name: "Administrador",
        description: "Rol con permisos administrativos"
      }
    });
  });

  test('actualizar un rol', () => {
    req.body = {
      name: "Administrador",
      description: "Rol con permisos administrativos"
    };

    rolesController.create(req, res);

    req.params = { id: "1" };

    req.body = {
      name: "Administrador Updated"
    };

    // llamamos a nuestra funcion update y le pasamos el request simulado
    rolesController.update(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "se ha actualizado el rol",
      data: {
        id: 1,
        name: "Administrador Updated",
        description: "Rol con permisos administrativos"
      }
    });
  });

  test('eliminar un rol', () => {
    req.body = {
      name: "Administrador",
      description: "Rol con permisos administrativos"
    };

    rolesController.create(req, res);

    req.params = { id: "1" };

    // igual llamamos a nuestra funcion delete y le pasamos nuestro request que simulamos
    rolesController.destroy(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "Se ha eliminado el rol",
      data: {
        id: 1,
        name: "Administrador",
        description: "Rol con permisos administrativos"
      }
    });
  });
});