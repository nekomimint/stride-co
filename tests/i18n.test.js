/* global beforeAll, afterAll, process, fetch, URLSearchParams */
const path = require('path');
const fs = require('fs');
const pug = require('pug');
const http = require('http');
const jwt = require('jsonwebtoken');
const i18n = require('../config/i18n');
const app = require('../app');

// Función auxiliar para obtener todas las claves de un objeto anidado en formato 'a.b.c'
function getNestedKeys(obj, prefix = '') {
  let keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys = keys.concat(getNestedKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

// Función auxiliar para inicializar un req/res simulado con el middleware i18n
function createMockContext(options = {}) {
  let url = options.url || '/';
  if (options.query && Object.keys(options.query).length > 0) {
    const params = new URLSearchParams(options.query).toString();
    url += (url.includes('?') ? '&' : '?') + params;
  }

  const req = {
    url,
    headers: options.headers || {},
    cookies: options.cookies || {},
    query: options.query || {},
    params: options.params || {},
    body: options.body || {}
  };
  const res = {
    locals: {},
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    render: jest.fn().mockReturnThis()
  };

  i18n.init(req, res);
  return { req, res };
}

describe('Pruebas de Internacionalización (i18n)', () => {
  let server;
  let baseUrl;
  let authToken;

  beforeAll((done) => {
    // Generar un token JWT válido para las peticiones de integración HTTP
    const secretKey = process.env.SECRET_KEY || 'LAPATATAPATA';
    authToken = jwt.sign({ user: 'testUser' }, secretKey, { algorithm: 'HS256' });

    // Iniciar servidor HTTP en un puerto libre efímero para pruebas de integración
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      done();
    });
  });

  afterAll((done) => {
    if (server) {
      server.close(done);
    } else {
      done();
    }
  });

  describe('Archivos de localización (en.json y es.json)', () => {
    const enPath = path.join(__dirname, '..', 'locales', 'en.json');
    const esPath = path.join(__dirname, '..', 'locales', 'es.json');

    test('ambos archivos deben existir y contener JSON válido', () => {
      expect(fs.existsSync(enPath)).toBe(true);
      expect(fs.existsSync(esPath)).toBe(true);

      const enRaw = fs.readFileSync(enPath, 'utf8');
      const esRaw = fs.readFileSync(esPath, 'utf8');

      expect(() => JSON.parse(enRaw)).not.toThrow();
      expect(() => JSON.parse(esRaw)).not.toThrow();
    });

    test('debe existir paridad total de claves entre en.json y es.json', () => {
      const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
      const esData = JSON.parse(fs.readFileSync(esPath, 'utf8'));

      const enKeys = getNestedKeys(enData).sort();
      const esKeys = getNestedKeys(esData).sort();

      expect(enKeys).toEqual(esKeys);
      expect(enKeys.length).toBeGreaterThan(0);
    });

    test('ninguna traducción debe estar vacía o indefinida', () => {
      const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
      const esData = JSON.parse(fs.readFileSync(esPath, 'utf8'));

      const enKeys = getNestedKeys(enData);
      enKeys.forEach((key) => {
        const enVal = key.split('.').reduce((o, i) => o[i], enData);
        const esVal = key.split('.').reduce((o, i) => o[i], esData);

        expect(typeof enVal).toBe('string');
        expect(typeof esVal).toBe('string');
        expect(enVal.trim().length).toBeGreaterThan(0);
        expect(esVal.trim().length).toBeGreaterThan(0);
      });
    });

    test('los textos en inglés y español deben ser distintos', () => {
      const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
      const esData = JSON.parse(fs.readFileSync(esPath, 'utf8'));

      const enKeys = getNestedKeys(enData);
      enKeys.forEach((key) => {
        const enVal = key.split('.').reduce((o, i) => o[i], enData);
        const esVal = key.split('.').reduce((o, i) => o[i], esData);
        expect(enVal).not.toEqual(esVal);
      });
    });
  });

  describe('Configuración y detección de idioma en el middleware', () => {
    test('debe usar "en" como idioma por defecto cuando no se especifica preferencia', () => {
      const { req } = createMockContext();
      expect(req.getLocale()).toBe('en');
    });

    test('debe detectar idioma mediante query parameter (?lang=es)', () => {
      const { req } = createMockContext({ query: { lang: 'es' } });
      expect(req.getLocale()).toBe('es');
      expect(req.__('index.apiWorking')).toBe('API funcionando');
    });

    test('debe detectar idioma mediante header Accept-Language', () => {
      const { req } = createMockContext({ headers: { 'accept-language': 'es' } });
      expect(req.getLocale()).toBe('es');
      expect(req.__('index.apiWorking')).toBe('API funcionando');
    });

    test('debe detectar idioma mediante cookie (lang=es)', () => {
      const { req } = createMockContext({ cookies: { lang: 'es' } });
      expect(req.getLocale()).toBe('es');
      expect(req.__('index.apiWorking')).toBe('API funcionando');
    });

    test('debe aplicar fallback de variaciones regionales a su idioma base', () => {
      const reqEsMx = createMockContext({ headers: { 'accept-language': 'es-MX,es;q=0.9' } }).req;
      expect(reqEsMx.getLocale()).toBe('es');

      const reqEnUs = createMockContext({ headers: { 'accept-language': 'en-US,en;q=0.9' } }).req;
      expect(reqEnUs.getLocale()).toBe('en');
    });

    test('debe soportar notación de objetos para acceder a claves anidadas', () => {
      const { req } = createMockContext({ query: { lang: 'en' } });
      expect(req.__('auth.loginSuccess')).toBe('Login successful');
      expect(req.__('errors.notFound')).toBe('Not found');

      req.setLocale('es');
      expect(req.__('auth.loginSuccess')).toBe('Inicio de sesión exitoso');
      expect(req.__('errors.notFound')).toBe('No encontrado');
    });

    test('debe interpolar parámetros correctamente con sprintf (%s)', () => {
      const { req } = createMockContext({ query: { lang: 'en' } });
      expect(req.__('index.welcome', 'Stride & Co')).toBe('Welcome to Stride & Co');
      expect(req.__('error.statusLabel', 404)).toBe('Status: 404');

      req.setLocale('es');
      expect(req.__('index.welcome', 'Stride & Co')).toBe('Bienvenido a Stride & Co');
      expect(req.__('error.statusLabel', 404)).toBe('Estado: 404');
    });
  });

  describe('Traducciones de todos los Controllers', () => {
    const modules = [
      {
        name: 'auth',
        keys: {
          invalidCredentials: ['Invalid credentials', 'Credenciales Inválidas'],
          loginSuccess: ['Login successful', 'Inicio de sesión exitoso'],
          unauthorized: ['Unauthorized', 'No autorizado']
        }
      },
      {
        name: 'customers',
        keys: {
          customerCreated: ['Client created succesfully', 'Cliente creado exitosamente'],
          findCustomers: ['Show customer list', 'Mostrar la lista de clientes'],
          customerNotFound: ['Customer not found', 'No se encontró al cliente'],
          customerFound: ['Customer found', 'Cliente encontrado'],
          customerUpdated: ['Customer updated', 'Cliente actualizado'],
          customerDeleted: ['Customer deleted', 'Cliente eliminado']
        }
      },
      {
        name: 'inventory',
        keys: {
          inventoryCreated: ['Product inventory created succesfully', 'Inventario del producto creado exitosamente'],
          findInventories: ['Show product inventories', 'Lista de inventarios de productos'],
          inventoryNotFound: ['Product inventory not found', 'Inventario de producto no encontrado'],
          inventoryFound: ['Product inventory found', 'Inventario de producto encontrado'],
          inventoryUpdated: ['Product inventory updated', 'Inventario de producto actualizado'],
          inventoryDeleted: ['Product inventory deleted', 'Inventario de producto eliminado']
        }
      },
      {
        name: 'order',
        keys: {
          orderCreated: ['Order created succesfully', 'Orden creada exitosamente'],
          findOrders: ['Show orders', 'Mostrar la lista de órdenes'],
          orderNotFound: ['Order not found', 'No se encontró la orden'],
          orderFound: ['Order found', 'Orden encontrada'],
          orderUpdated: ['Order updated', 'Orden actualizada'],
          orderDeleted: ['Order deleted', 'Orden eliminada']
        }
      },
      {
        name: 'permission',
        keys: {
          permissionCreated: ['Permission created succesfully', 'Permiso creado exitosamente'],
          findPermissions: ['Show permissions that can be granted', 'Mostrar los permissos que se pueden otorgar a los usuarios'],
          permissionNotFound: ['Permission not found', 'No se encontró el permiso'],
          permissionFound: ['Permission found', 'Permiso encontrado'],
          permissionUpdated: ['Permission updated', 'Permiso actualizado'],
          permissionDeleted: ['Permission deleted', 'Permiso eliminado']
        }
      },
      {
        name: 'product',
        keys: {
          productCreated: ['Product created succesfully', 'Producto creado exitosamente'],
          findProducts: ['Show product list', 'Mostrar la lista de productos'],
          productNotFound: ['Product not found', 'No se encontró el producto'],
          productFound: ['Product found', 'Producto encontrado'],
          productUpdated: ['Product updated', 'Producto actualizado'],
          productDeleted: ['Product deleted', 'Producto eliminado']
        }
      },
      {
        name: 'role',
        keys: {
          roleCreated: ['Role created succesfully', 'Rol creado exitosamente'],
          findRoles: ['Show available roles', 'Mostrar los roles disponibles'],
          roleNotFound: ['Role not found', 'No se encontró el rol'],
          roleFound: ['Role found', 'Rol encontrado'],
          roleUpdated: ['Role updated', 'Rol actualizado'],
          roleDeleted: ['Role deleted', 'Rol eliminado']
        }
      },
      {
        name: 'user',
        keys: {
          userCreated: ['User created succesfully', 'Usuario creado exitosamente'],
          findUsers: ['Show users', 'Mostrar la lista de usuarios'],
          userNotFound: ['User not found', 'Usuario no encontrado'],
          userFound: ['User found', 'Usuario encontrado'],
          userUpdated: ['User updated', 'Usuario actualizado'],
          userDeleted: ['User deleted', 'Usuario eliminado']
        }
      },
      {
        name: 'variant',
        keys: {
          variantCreated: ['Variant created succesfully', 'Variante creada exitosamente'],
          findVariant: ['Show product variants', 'Mostrar la lista de variantes de productos'],
          variantNotFound: ['Variant not found', 'Variante no encontrada'],
          variantFound: ['Variant found', 'Variante encontrada'],
          variantUpdated: ['Variant updated', 'Variante actualizada'],
          variantDeleted: ['Variant deleted', 'Variante eliminada']
        }
      }
    ];

    test.each(modules)('el módulo $name tiene todas sus traducciones correctas en inglés y español', ({ name, keys }) => {
      const { req } = createMockContext();

      // Probar en inglés
      req.setLocale('en');
      for (const [action, [enExpected]] of Object.entries(keys)) {
        expect(req.__(`${name}.${action}`)).toBe(enExpected);
      }

      // Probar en español
      req.setLocale('es');
      for (const [action, [, esExpected]] of Object.entries(keys)) {
        expect(req.__(`${name}.${action}`)).toBe(esExpected);
      }
    });
  });

  describe('Vistas Pug (index.pug, error.pug, layout.pug)', () => {
    const viewsDir = path.join(__dirname, '..', 'views');

    test('views/index.pug debe renderizar bienvenida y atributo de idioma en inglés', () => {
      const { req } = createMockContext({ query: { lang: 'en' } });
      const html = pug.renderFile(path.join(viewsDir, 'index.pug'), {
        title: 'Stride & Co',
        locale: req.getLocale(),
        __: req.__.bind(req)
      });

      expect(html).toContain('lang="en"');
      expect(html).toContain('<h1>Stride &amp; Co</h1>');
      expect(html).toContain('<p>Welcome to Stride &amp; Co</p>');
    });

    test('views/index.pug debe renderizar bienvenida y atributo de idioma en español', () => {
      const { req } = createMockContext({ query: { lang: 'es' } });
      const html = pug.renderFile(path.join(viewsDir, 'index.pug'), {
        title: 'Stride & Co',
        locale: req.getLocale(),
        __: req.__.bind(req)
      });

      expect(html).toContain('lang="es"');
      expect(html).toContain('<h1>Stride &amp; Co</h1>');
      expect(html).toContain('<p>Bienvenido a Stride &amp; Co</p>');
    });

    test('views/error.pug debe renderizar mensaje de error y código de estado traducido en inglés', () => {
      const { req } = createMockContext({ query: { lang: 'en' } });
      const html = pug.renderFile(path.join(viewsDir, 'error.pug'), {
        title: 'Error',
        message: req.__('errors.notFound'),
        status: 404,
        error: {},
        locale: req.getLocale(),
        __: req.__.bind(req)
      });

      expect(html).toContain('lang="en"');
      expect(html).toContain('<h1>Not found</h1>');
      expect(html).toContain('<h2>Status: 404</h2>');
    });

    test('views/error.pug debe renderizar mensaje de error y código de estado traducido en español', () => {
      const { req } = createMockContext({ query: { lang: 'es' } });
      const html = pug.renderFile(path.join(viewsDir, 'error.pug'), {
        title: 'Error',
        message: req.__('errors.notFound'),
        status: 404,
        error: {},
        locale: req.getLocale(),
        __: req.__.bind(req)
      });

      expect(html).toContain('lang="es"');
      expect(html).toContain('<h1>No encontrado</h1>');
      expect(html).toContain('<h2>Estado: 404</h2>');
    });
  });

  describe('Ruta Index (GET /)', () => {
    test('debe responder con mensaje traducido en inglés', () => {
      const indexRouter = require('../routes/index');
      const { req, res } = createMockContext({ query: { lang: 'en' } });

      const routeHandler = indexRouter.stack.find(
        (layer) => layer.route && layer.route.path === '/' && layer.route.methods.get
      ).route.stack[0].handle;

      routeHandler(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: 'API working'
      });
    });

    test('debe responder con mensaje traducido en español', () => {
      const indexRouter = require('../routes/index');
      const { req, res } = createMockContext({ query: { lang: 'es' } });

      const routeHandler = indexRouter.stack.find(
        (layer) => layer.route && layer.route.path === '/' && layer.route.methods.get
      ).route.stack[0].handle;

      routeHandler(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: 'API funcionando'
      });
    });
  });

  describe('Manejador central de errores (app.js error handler)', () => {
    const errorHandler = app._router.stack.find(
      (layer) => layer.handle && layer.handle.length === 4
    ).handle;

    test('debe traducir error 401 UnauthorizedError en inglés y español', () => {
      const err = new Error('No authorization token was found');
      err.name = 'UnauthorizedError';
      err.status = 401;

      // Inglés
      const ctxEn = createMockContext({ query: { lang: 'en' } });
      ctxEn.req.app = app;
      errorHandler(err, ctxEn.req, ctxEn.res, jest.fn());
      expect(ctxEn.res.locals.message).toBe('Unauthorized');
      expect(ctxEn.res.status).toHaveBeenCalledWith(401);

      // Español
      const ctxEs = createMockContext({ query: { lang: 'es' } });
      ctxEs.req.app = app;
      errorHandler(err, ctxEs.req, ctxEs.res, jest.fn());
      expect(ctxEs.res.locals.message).toBe('No autorizado');
      expect(ctxEs.res.status).toHaveBeenCalledWith(401);
    });

    test('debe traducir error 403 Forbidden en inglés y español', () => {
      const err = { status: 403, message: 'Forbidden' };

      const ctxEn = createMockContext({ query: { lang: 'en' } });
      ctxEn.req.app = app;
      errorHandler(err, ctxEn.req, ctxEn.res, jest.fn());
      expect(ctxEn.res.locals.message).toBe('Forbidden');
      expect(ctxEn.res.status).toHaveBeenCalledWith(403);

      const ctxEs = createMockContext({ query: { lang: 'es' } });
      ctxEs.req.app = app;
      errorHandler(err, ctxEs.req, ctxEs.res, jest.fn());
      expect(ctxEs.res.locals.message).toBe('Acceso denegado');
      expect(ctxEs.res.status).toHaveBeenCalledWith(403);
    });

    test('debe traducir error 404 Not Found en inglés y español', () => {
      const err = { status: 404, message: 'Not Found' };

      const ctxEn = createMockContext({ query: { lang: 'en' } });
      ctxEn.req.app = app;
      errorHandler(err, ctxEn.req, ctxEn.res, jest.fn());
      expect(ctxEn.res.locals.message).toBe('Not found');
      expect(ctxEn.res.status).toHaveBeenCalledWith(404);

      const ctxEs = createMockContext({ query: { lang: 'es' } });
      ctxEs.req.app = app;
      errorHandler(err, ctxEs.req, ctxEs.res, jest.fn());
      expect(ctxEs.res.locals.message).toBe('No encontrado');
      expect(ctxEs.res.status).toHaveBeenCalledWith(404);
    });

    test('debe traducir error 500 Internal Server Error en inglés y español', () => {
      const err = { status: 500, message: 'Internal Server Error' };

      const ctxEn = createMockContext({ query: { lang: 'en' } });
      ctxEn.req.app = app;
      errorHandler(err, ctxEn.req, ctxEn.res, jest.fn());
      expect(ctxEn.res.locals.message).toBe('Internal server error');
      expect(ctxEn.res.status).toHaveBeenCalledWith(500);

      const ctxEs = createMockContext({ query: { lang: 'es' } });
      ctxEs.req.app = app;
      errorHandler(err, ctxEs.req, ctxEs.res, jest.fn());
      expect(ctxEs.res.locals.message).toBe('Error interno del servidor');
      expect(ctxEs.res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('Pruebas de integración HTTP sobre la API Express', () => {
    test('GET /?lang=en con token devuelve mensaje traducido en inglés', async () => {
      const response = await fetch(`${baseUrl}/?lang=en`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ message: 'API working' });
    });

    test('GET /?lang=es con token devuelve mensaje traducido en español', async () => {
      const response = await fetch(`${baseUrl}/?lang=es`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ message: 'API funcionando' });
    });

    test('GET / con header Accept-Language: es devuelve mensaje en español', async () => {
      const response = await fetch(`${baseUrl}/`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Accept-Language': 'es'
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ message: 'API funcionando' });
    });

    test('GET / con cookie lang=es devuelve mensaje en español', async () => {
      const response = await fetch(`${baseUrl}/`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          Cookie: 'lang=es'
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ message: 'API funcionando' });
    });

    test('Petición sin token a /?lang=en devuelve 401 renderizando vista de error en inglés', async () => {
      const response = await fetch(`${baseUrl}/?lang=en`);

      expect(response.status).toBe(401);
      const html = await response.text();
      expect(html).toContain('lang="en"');
      expect(html).toContain('<h1>Unauthorized</h1>');
      expect(html).toContain('<h2>Status: 401</h2>');
    });

    test('Petición sin token a /?lang=es devuelve 401 renderizando vista de error en español', async () => {
      const response = await fetch(`${baseUrl}/?lang=es`);

      expect(response.status).toBe(401);
      const html = await response.text();
      expect(html).toContain('lang="es"');
      expect(html).toContain('<h1>No autorizado</h1>');
      expect(html).toContain('<h2>Estado: 401</h2>');
    });

    test('Petición a ruta inexistente con token a /ruta-inexistente?lang=en renderiza error 404 en inglés', async () => {
      const response = await fetch(`${baseUrl}/ruta-inexistente?lang=en`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).toBe(404);
      const html = await response.text();
      expect(html).toContain('lang="en"');
      expect(html).toContain('<h1>Not found</h1>');
      expect(html).toContain('<h2>Status: 404</h2>');
    });

    test('Petición a ruta inexistente con token a /ruta-inexistente?lang=es renderiza error 404 en español', async () => {
      const response = await fetch(`${baseUrl}/ruta-inexistente?lang=es`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).toBe(404);
      const html = await response.text();
      expect(html).toContain('lang="es"');
      expect(html).toContain('<h1>No encontrado</h1>');
      expect(html).toContain('<h2>Estado: 404</h2>');
    });
  });
});
