const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const { app, request, login } = require('./helpers');
const {
  Product,
  Role,
  Permission,
  User,
  ProductVariant,
  Inventory,
  sequelize,
} = require('../../models/relationals');
const { Customer, Order } = require('../../models/documents');
const connectMongo = require('../../config/mongoose');
const i18n = require('../../config/i18n');

jest.setTimeout(45000);

/**
 * Función auxiliar para extraer recursivamente todas las claves en notación de puntos
 * @param {object} obj - Objeto de traducciones
 * @param {string} prefix - Prefijo acumulado
 * @returns {string[]} Lista ordenada de claves
 */
function extractKeys(obj, prefix = '') {
  let keys = [];
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(extractKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys.sort();
}

describe('Internacionalización (i18n) E2E', () => {
  const adminCredentials = {
    email: process.env.ADMIN_EMAIL || 'jesus@gmail.com',
    password: process.env.ADMIN_PASSWORD || 'admin123',
  };

  const restrictedCredentials = {
    email: process.env.RESTRICTED_EMAIL || 'sofia@gmail.com',
    password: process.env.RESTRICTED_PASSWORD || 'usuario123',
  };

  let adminToken;
  let restrictedToken;

  // Seguimiento de registros para limpieza garantizada
  const createdProductIds = [];
  const createdRoleIds = [];
  const createdPermissionIds = [];
  const createdUserIds = [];
  const createdVariantIds = [];
  const createdInventoryIds = [];
  const createdCustomerIds = [];
  const createdOrderIds = [];

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await connectMongo();
    }
    adminToken = await login(adminCredentials.email, adminCredentials.password);
    restrictedToken = await login(restrictedCredentials.email, restrictedCredentials.password);
  });

  afterAll(async () => {
    // Limpieza de órdenes y clientes en MongoDB
    if (createdOrderIds.length > 0) {
      try {
        await Order.deleteMany({ _id: { $in: createdOrderIds } });
      } catch (err) {
        // Ignorar
      }
    }

    if (createdCustomerIds.length > 0) {
      try {
        await Customer.deleteMany({ _id: { $in: createdCustomerIds } });
      } catch (err) {
        // Ignorar
      }
    }

    // Limpieza de inventarios
    if (createdInventoryIds.length > 0) {
      try {
        await Inventory.destroy({ where: { id: createdInventoryIds } });
      } catch (err) {
        // Ignorar
      }
    }

    // Limpieza de variantes
    if (createdVariantIds.length > 0) {
      try {
        await ProductVariant.destroy({ where: { id: createdVariantIds } });
      } catch (err) {
        // Ignorar
      }
    }

    // Limpieza de productos
    if (createdProductIds.length > 0) {
      try {
        await Product.destroy({ where: { id: createdProductIds } });
      } catch (err) {
        // Ignorar
      }
    }

    // Limpieza de usuarios
    if (createdUserIds.length > 0) {
      try {
        await User.destroy({ where: { id: createdUserIds } });
      } catch (err) {
        // Ignorar
      }
    }

    // Limpieza de permisos
    if (createdPermissionIds.length > 0) {
      try {
        await Permission.destroy({ where: { id: createdPermissionIds } });
      } catch (err) {
        // Ignorar
      }
    }

    // Limpieza de roles
    if (createdRoleIds.length > 0) {
      try {
        await Role.destroy({ where: { id: createdRoleIds } });
      } catch (err) {
        // Ignorar
      }
    }

    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    if (sequelize && typeof sequelize.close === 'function') {
      await sequelize.close();
    }
  });

  describe('Paridad estructural de archivos de traducción (locales)', () => {
    it('debe comprobar que en.json y es.json existan y tengan exactamente las mismas claves', () => {
      const enPath = path.join(__dirname, '../../locales/en.json');
      const esPath = path.join(__dirname, '../../locales/es.json');

      expect(fs.existsSync(enPath)).toBe(true);
      expect(fs.existsSync(esPath)).toBe(true);

      const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
      const esData = JSON.parse(fs.readFileSync(esPath, 'utf8'));

      const enKeys = extractKeys(enData);
      const esKeys = extractKeys(esData);

      expect(enKeys).toEqual(esKeys);
      expect(enKeys.length).toBeGreaterThan(0);
    });
  });

  describe('Idioma por defecto y resolución con fallback', () => {
    it('debe responder en inglés por defecto cuando no se envía la cookie lang', async () => {
      const response = await request
        .get('/api/products')
        .expect(401);

      expect(response.body.message).toBe('Unauthorized');
      expect(response.body.error).toBe('Unauthorized');
    });

    it('debe usar inglés como fallback cuando se envía un idioma no registrado como lang=fr', async () => {
      const response = await request
        .get('/api/products')
        .set('Cookie', 'lang=fr')
        .expect(401);

      expect(response.body.message).toBe('Unauthorized');
      expect(response.body.error).toBe('Unauthorized');
    });

    it('debe usar fallback a español (es) cuando se envía la variante lang=es-MX', async () => {
      const response = await request
        .get('/api/products')
        .set('Cookie', 'lang=es-MX')
        .expect(401);

      expect(response.body.message).toBe('No autorizado');
      expect(response.body.error).toBe('No autorizado');
    });

    it('debe usar fallback a inglés (en) cuando se envía la variante lang=en-EU', async () => {
      const response = await request
        .get('/api/products')
        .set('Cookie', 'lang=en-EU')
        .expect(401);

      expect(response.body.message).toBe('Unauthorized');
      expect(response.body.error).toBe('Unauthorized');
    });
  });

  describe('Mensajes de error HTTP traducidos (401, 403, 404, 500)', () => {
    it('Error 401 Unauthorized debe traducirse según la cookie lang (en vs es)', async () => {
      const resEn = await request
        .get('/api/products')
        .set('Cookie', 'lang=en')
        .expect(401);

      expect(resEn.body.message).toBe('Unauthorized');
      expect(resEn.body.error).toBe('Unauthorized');

      const resEs = await request
        .get('/api/products')
        .set('Cookie', 'lang=es')
        .expect(401);

      expect(resEs.body.message).toBe('No autorizado');
      expect(resEs.body.error).toBe('No autorizado');
    });

    it('Error 403 Forbidden debe traducirse según la cookie lang (en vs es)', async () => {
      const resEn = await request
        .get('/api/inventory')
        .set('Authorization', `Bearer ${restrictedToken}`)
        .set('Cookie', 'lang=en')
        .expect(403);

      expect(resEn.body.message).toBe('Forbidden');

      const resEs = await request
        .get('/api/inventory')
        .set('Authorization', `Bearer ${restrictedToken}`)
        .set('Cookie', 'lang=es')
        .expect(403);

      expect(resEs.body.message).toBe('Acceso denegado');
    });

    it('Error 404 Not Found debe traducirse según la cookie lang (en vs es)', async () => {
      const resEn = await request
        .get('/api/nonexistent-route-for-testing-404')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .expect(404);

      expect(resEn.body.message).toBe('Not found');

      const resEs = await request
        .get('/api/nonexistent-route-for-testing-404')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .expect(404);

      expect(resEs.body.message).toBe('No encontrado');
    });

    it('Error 500 Internal Server Error debe traducirse según la cookie lang (en vs es)', async () => {
      const resEn = await request
        .get('/api/customers/invalid-cast-id-to-trigger-500')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .expect(500);

      expect(resEn.body.message).toBe('Internal server error');
      expect(resEn.body.error).toBe('Internal server error');

      const resEs = await request
        .get('/api/customers/invalid-cast-id-to-trigger-500')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .expect(500);

      expect(resEs.body.message).toBe('Error interno del servidor');
      expect(resEs.body.error).toBe('Error interno del servidor');
    });
  });

  describe('Traducciones del ciclo CRUD completo en TODOS los controladores y funciones especiales', () => {
    // -------------------------------------------------------------------------
    // 1. AUTH CONTROLLER
    // -------------------------------------------------------------------------
    it('[Controlador: auth] debe responder con mensajes de éxito y fallo de login traducidos', async () => {
      const resLoginEn = await request
        .post('/api/auth/login')
        .set('Cookie', 'lang=en')
        .send(adminCredentials)
        .expect(200);
      expect(resLoginEn.body.message).toBe('Login successful');

      const resLoginEs = await request
        .post('/api/auth/login')
        .set('Cookie', 'lang=es')
        .send(adminCredentials)
        .expect(200);
      expect(resLoginEs.body.message).toBe('Inicio de sesión exitoso');

      const resFailEn = await request
        .post('/api/auth/login')
        .set('Cookie', 'lang=en')
        .send({ email: 'fake@example.com', password: 'wrong_password' })
        .expect(401);
      expect(resFailEn.body.message).toBe('Invalid credentials');

      const resFailEs = await request
        .post('/api/auth/login')
        .set('Cookie', 'lang=es')
        .send({ email: 'fake@example.com', password: 'wrong_password' })
        .expect(401);
      expect(resFailEs.body.message).toBe('Credenciales Inválidas');
    });

    // -------------------------------------------------------------------------
    // 2. INDEX CONTROLLER / ROUTE
    // -------------------------------------------------------------------------
    it('[Controlador: index] GET / debe responder con mensaje traducido', async () => {
      const resEn = await request
        .get('/')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .expect(200);
      expect(resEn.body.message).toBe('API working');

      const resEs = await request
        .get('/')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .expect(200);
      expect(resEs.body.message).toBe('API funcionando');
    });

    // -------------------------------------------------------------------------
    // 3. PRODUCTS CONTROLLER (CRUD Completo)
    // -------------------------------------------------------------------------
    it('[Controlador: products] ciclo CRUD completo debe responder con mensajes traducidos', async () => {
      // CREATE (POST)
      const resCreateEn = await request
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .send({ name: 'Producto i18n CRUD EN', price: 100.0, description: 'Test EN' })
        .expect(201);
      expect(resCreateEn.body.message).toBe('Product created succesfully');
      const prodIdEn = resCreateEn.body.data.id;
      createdProductIds.push(prodIdEn);

      const resCreateEs = await request
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .send({ name: 'Producto i18n CRUD ES', price: 100.0, description: 'Test ES' })
        .expect(201);
      expect(resCreateEs.body.message).toBe('Producto creado exitosamente');
      const prodIdEs = resCreateEs.body.data.id;
      createdProductIds.push(prodIdEs);

      // READ LIST (GET)
      const resListEn = await request
        .get('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .expect(200);
      expect(resListEn.body.message).toBe('Show product list');

      const resListEs = await request
        .get('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .expect(200);
      expect(resListEs.body.message).toBe('Mostrar la lista de productos');

      // READ BY ID (GET /:id)
      const resFindEn = await request
        .get(`/api/products/${prodIdEn}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .expect(200);
      expect(resFindEn.body.message).toBe('Product found');

      const resFindEs = await request
        .get(`/api/products/${prodIdEs}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .expect(200);
      expect(resFindEs.body.message).toBe('Producto encontrado');

      // READ NOT FOUND (GET /:id)
      const resNotFoundEn = await request
        .get('/api/products/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .expect(404);
      expect(resNotFoundEn.body.message).toBe('Product not found');

      const resNotFoundEs = await request
        .get('/api/products/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .expect(404);
      expect(resNotFoundEs.body.message).toBe('No se encontró el producto');

      // UPDATE (PUT /:id)
      const resUpdateEn = await request
        .put(`/api/products/${prodIdEn}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .send({ price: 120.0 })
        .expect(200);
      expect(resUpdateEn.body.message).toBe('Product updated');

      const resUpdateEs = await request
        .put(`/api/products/${prodIdEs}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .send({ price: 120.0 })
        .expect(200);
      expect(resUpdateEs.body.message).toBe('Producto actualizado');

      // DELETE (DELETE /:id)
      const resDeleteEn = await request
        .delete(`/api/products/${prodIdEn}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .expect(200);
      expect(resDeleteEn.body.message).toBe('Product deleted');

      const resDeleteEs = await request
        .delete(`/api/products/${prodIdEs}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .expect(200);
      expect(resDeleteEs.body.message).toBe('Producto eliminado');
    });

    // -------------------------------------------------------------------------
    // 4. ROLES CONTROLLER (CRUD Completo)
    // -------------------------------------------------------------------------
    it('[Controlador: roles] ciclo CRUD completo debe responder con mensajes traducidos', async () => {
      // CREATE
      const resCreateEn = await request
        .post('/api/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .send({ name: 'role_i18n_crud_en', description: 'Testing role en' })
        .expect(201);
      expect(resCreateEn.body.message).toBe('Role created succesfully');
      const roleIdEn = resCreateEn.body.data.id;
      createdRoleIds.push(roleIdEn);

      const resCreateEs = await request
        .post('/api/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .send({ name: 'role_i18n_crud_es', description: 'Probando rol es' })
        .expect(201);
      expect(resCreateEs.body.message).toBe('Rol creado exitosamente');
      const roleIdEs = resCreateEs.body.data.id;
      createdRoleIds.push(roleIdEs);

      // READ LIST
      const resListEn = await request
        .get('/api/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .expect(200);
      expect(resListEn.body.message).toBe('Show available roles');

      const resListEs = await request
        .get('/api/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .expect(200);
      expect(resListEs.body.message).toBe('Mostrar los roles disponibles');

      // READ BY ID
      const resFindEn = await request
        .get(`/api/roles/${roleIdEn}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .expect(200);
      expect(resFindEn.body.message).toBe('Role found');

      const resFindEs = await request
        .get(`/api/roles/${roleIdEs}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .expect(200);
      expect(resFindEs.body.message).toBe('Rol encontrado');

      // NOT FOUND
      const res404En = await request
        .get('/api/roles/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .expect(404);
      expect(res404En.body.message).toBe('Role not found');

      const res404Es = await request
        .get('/api/roles/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .expect(404);
      expect(res404Es.body.message).toBe('No se encontró el rol');

      // UPDATE
      const resUpdateEn = await request
        .put(`/api/roles/${roleIdEn}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .send({ description: 'Updated role en' })
        .expect(200);
      expect(resUpdateEn.body.message).toBe('Role updated');

      const resUpdateEs = await request
        .put(`/api/roles/${roleIdEs}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .send({ description: 'Rol actualizado es' })
        .expect(200);
      expect(resUpdateEs.body.message).toBe('Rol actualizado');

      // DELETE
      const resDeleteEn = await request
        .delete(`/api/roles/${roleIdEn}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .expect(200);
      expect(resDeleteEn.body.message).toBe('Role deleted');

      const resDeleteEs = await request
        .delete(`/api/roles/${roleIdEs}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .expect(200);
      expect(resDeleteEs.body.message).toBe('Rol eliminado');
    });

    // -------------------------------------------------------------------------
    // 5. PERMISSIONS CONTROLLER (CRUD Completo)
    // -------------------------------------------------------------------------
    it('[Controlador: permissions] ciclo CRUD completo debe responder con mensajes traducidos', async () => {
      // CREATE
      const resCreateEn = await request
        .post('/api/permissions')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .send({ key: 'crud_i18n:test:en', description: 'Testing permission en' })
        .expect(201);
      expect(resCreateEn.body.message).toBe('Permission created succesfully');
      const permIdEn = resCreateEn.body.data.id;
      createdPermissionIds.push(permIdEn);

      const resCreateEs = await request
        .post('/api/permissions')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .send({ key: 'crud_i18n:test:es', description: 'Probando permiso es' })
        .expect(201);
      expect(resCreateEs.body.message).toBe('Permiso creado exitosamente');
      const permIdEs = resCreateEs.body.data.id;
      createdPermissionIds.push(permIdEs);

      // READ LIST
      const resListEn = await request
        .get('/api/permissions')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .expect(200);
      expect(resListEn.body.message).toBe('Show permissions that can be granted');

      const resListEs = await request
        .get('/api/permissions')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .expect(200);
      expect(resListEs.body.message).toBe('Mostrar los permissos que se pueden otorgar a los usuarios');

      // READ BY ID
      const resFindEn = await request
        .get(`/api/permissions/${permIdEn}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .expect(200);
      expect(resFindEn.body.message).toBe('Permission found');

      const resFindEs = await request
        .get(`/api/permissions/${permIdEs}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .expect(200);
      expect(resFindEs.body.message).toBe('Permiso encontrado');

      // NOT FOUND
      const res404En = await request
        .get('/api/permissions/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .expect(404);
      expect(res404En.body.message).toBe('Permission not found');

      const res404Es = await request
        .get('/api/permissions/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .expect(404);
      expect(res404Es.body.message).toBe('No se encontró el permiso');

      // UPDATE
      const resUpdateEn = await request
        .put(`/api/permissions/${permIdEn}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .send({ description: 'Updated permission en' })
        .expect(200);
      expect(resUpdateEn.body.message).toBe('Permission updated');

      const resUpdateEs = await request
        .put(`/api/permissions/${permIdEs}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .send({ description: 'Permiso actualizado es' })
        .expect(200);
      expect(resUpdateEs.body.message).toBe('Permiso actualizado');

      // DELETE
      const resDeleteEn = await request
        .delete(`/api/permissions/${permIdEn}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .expect(200);
      expect(resDeleteEn.body.message).toBe('Permission deleted');

      const resDeleteEs = await request
        .delete(`/api/permissions/${permIdEs}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .expect(200);
      expect(resDeleteEs.body.message).toBe('Permiso eliminado');
    });

    // -------------------------------------------------------------------------
    // 6. USERS CONTROLLER (CRUD Completo)
    // -------------------------------------------------------------------------
    it('[Controlador: users] ciclo CRUD completo debe responder con mensajes traducidos', async () => {
      // CREATE
      const resCreateEn = await request
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .send({
          name: 'UserEN',
          lastName: 'Test',
          email: 'user_i18n_crud_en@example.com',
          password: 'Password123!',
          roleId: 1,
        })
        .expect(201);
      expect(resCreateEn.body.message).toBe('User created succesfully');
      const userIdEn = resCreateEn.body.data.id;
      createdUserIds.push(userIdEn);

      const resCreateEs = await request
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .send({
          name: 'UserES',
          lastName: 'Test',
          email: 'user_i18n_crud_es@example.com',
          password: 'Password123!',
          roleId: 1,
        })
        .expect(201);
      expect(resCreateEs.body.message).toBe('Usuario creado exitosamente');
      const userIdEs = resCreateEs.body.data.id;
      createdUserIds.push(userIdEs);

      // READ LIST
      const resListEn = await request
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .expect(200);
      expect(resListEn.body.message).toBe('Show users');

      const resListEs = await request
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .expect(200);
      expect(resListEs.body.message).toBe('Mostrar la lista de usuarios');

      // READ BY ID
      const resFindEn = await request
        .get(`/api/users/${userIdEn}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .expect(200);
      expect(resFindEn.body.message).toBe('User found');

      const resFindEs = await request
        .get(`/api/users/${userIdEs}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .expect(200);
      expect(resFindEs.body.message).toBe('Usuario encontrado');

      // NOT FOUND
      const res404En = await request
        .get('/api/users/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .expect(404);
      expect(res404En.body.message).toBe('User not found');

      const res404Es = await request
        .get('/api/users/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .expect(404);
      expect(res404Es.body.message).toBe('Usuario no encontrado');

      // UPDATE
      const resUpdateEn = await request
        .put(`/api/users/${userIdEn}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .send({ name: 'UserENUpdated' })
        .expect(200);
      expect(resUpdateEn.body.message).toBe('User updated');

      const resUpdateEs = await request
        .put(`/api/users/${userIdEs}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .send({ name: 'UserESActualizado' })
        .expect(200);
      expect(resUpdateEs.body.message).toBe('Usuario actualizado');

      // DELETE
      const resDeleteEn = await request
        .delete(`/api/users/${userIdEn}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .expect(200);
      expect(resDeleteEn.body.message).toBe('User deleted');

      const resDeleteEs = await request
        .delete(`/api/users/${userIdEs}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .expect(200);
      expect(resDeleteEs.body.message).toBe('Usuario eliminado');
    });

    // -------------------------------------------------------------------------
    // 7. VARIANTS CONTROLLER (CRUD Completo)
    // -------------------------------------------------------------------------
    it('[Controlador: variants] ciclo CRUD completo debe responder con mensajes traducidos', async () => {
      // Usar producto existente para asociar variante
      const existingProduct = await Product.findOne();
      const parentProductId = existingProduct.id;

      // CREATE
      const resCreateEn = await request
        .post('/api/variants')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .send({
          sku: 'VAR-CRUD-I18N-EN',
          size: '27',
          color: 'Blanco',
          product_id: parentProductId,
        })
        .expect(201);
      expect(resCreateEn.body.message).toBe('Variant created succesfully');
      const varIdEn = resCreateEn.body.data.id;
      createdVariantIds.push(varIdEn);

      const resCreateEs = await request
        .post('/api/variants')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .send({
          sku: 'VAR-CRUD-I18N-ES',
          size: '27',
          color: 'Negro',
          product_id: parentProductId,
        })
        .expect(201);
      expect(resCreateEs.body.message).toBe('Variante creada exitosamente');
      const varIdEs = resCreateEs.body.data.id;
      createdVariantIds.push(varIdEs);

      // READ LIST
      const resListEn = await request
        .get('/api/variants')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .expect(200);
      expect(resListEn.body.message).toBe('Show product variants');

      const resListEs = await request
        .get('/api/variants')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .expect(200);
      expect(resListEs.body.message).toBe('Mostrar la lista de variantes de productos');

      // READ BY ID
      const resFindEn = await request
        .get(`/api/variants/${varIdEn}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .expect(200);
      expect(resFindEn.body.message).toBe('Variant found');

      const resFindEs = await request
        .get(`/api/variants/${varIdEs}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .expect(200);
      expect(resFindEs.body.message).toBe('Variante encontrada');

      // NOT FOUND
      const res404En = await request
        .get('/api/variants/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .expect(404);
      expect(res404En.body.message).toBe('Variant not found');

      const res404Es = await request
        .get('/api/variants/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .expect(404);
      expect(res404Es.body.message).toBe('Variante no encontrada');

      // UPDATE
      const resUpdateEn = await request
        .put(`/api/variants/${varIdEn}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .send({ color: 'Gris' })
        .expect(200);
      expect(resUpdateEn.body.message).toBe('Variant updated');

      const resUpdateEs = await request
        .put(`/api/variants/${varIdEs}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .send({ color: 'Gris' })
        .expect(200);
      expect(resUpdateEs.body.message).toBe('Variante actualizada');

      // DELETE
      const resDeleteEn = await request
        .delete(`/api/variants/${varIdEn}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .expect(200);
      expect(resDeleteEn.body.message).toBe('Variant deleted');

      const resDeleteEs = await request
        .delete(`/api/variants/${varIdEs}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .expect(200);
      expect(resDeleteEs.body.message).toBe('Variante eliminada');
    });

    // -------------------------------------------------------------------------
    // 8. INVENTORY CONTROLLER (CRUD Completo + Funciones Especiales)
    // -------------------------------------------------------------------------
    it('[Controlador: inventory] ciclo CRUD completo y funciones especiales deben responder con mensajes traducidos', async () => {
      // Crear variantes auxiliares dedicadas para probar inventario
      const existingProduct = await Product.findOne();
      const tempVarEn = await ProductVariant.create({
        sku: 'INV-AUX-VAR-EN',
        size: '26',
        color: 'Azul',
        product_id: existingProduct.id,
      });
      createdVariantIds.push(tempVarEn.id);

      const tempVarEs = await ProductVariant.create({
        sku: 'INV-AUX-VAR-ES',
        size: '26',
        color: 'Rojo',
        product_id: existingProduct.id,
      });
      createdVariantIds.push(tempVarEs.id);

      // --- FUNCIONES ESPECIALES DE INVENTORY ---

      // Función especial 1: Variante inexistente al agregar inventario (404)
      const resVarNotFoundEn = await request
        .post('/api/inventory')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .send({ variant_id: 999999, stock: 10, reserved: 0 })
        .expect(404);
      expect(resVarNotFoundEn.body.message).toBe('Variant not found');

      const resVarNotFoundEs = await request
        .post('/api/inventory')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .send({ variant_id: 999999, stock: 10, reserved: 0 })
        .expect(404);
      expect(resVarNotFoundEs.body.message).toBe('Variante no encontrada');

      // Función especial 2: Reserva mayor que el stock al crear (400)
      const resResGreaterEn = await request
        .post('/api/inventory')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .send({ variant_id: tempVarEn.id, stock: 5, reserved: 20 })
        .expect(400);
      expect(resResGreaterEn.body.message).toBe('The reservation cannot be greater than the stock');

      const resResGreaterEs = await request
        .post('/api/inventory')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .send({ variant_id: tempVarEs.id, stock: 5, reserved: 20 })
        .expect(400);
      expect(resResGreaterEs.body.message).toBe('La reserva no puede ser mayor que el stock');

      // CREATE (POST) de inventario válido
      const resCreateEn = await request
        .post('/api/inventory')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .send({ variant_id: tempVarEn.id, stock: 25, reserved: 5 })
        .expect(201);
      expect(resCreateEn.body.message).toBe('Product inventory created succesfully');
      const invIdEn = resCreateEn.body.data.id;
      createdInventoryIds.push(invIdEn);

      const resCreateEs = await request
        .post('/api/inventory')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .send({ variant_id: tempVarEs.id, stock: 25, reserved: 5 })
        .expect(201);
      expect(resCreateEs.body.message).toBe('Inventario del producto creado exitosamente');
      const invIdEs = resCreateEs.body.data.id;
      createdInventoryIds.push(invIdEs);

      // Función especial 3: Variante duplicada en inventario (409 Conflict)
      const resDupEn = await request
        .post('/api/inventory')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .send({ variant_id: tempVarEn.id, stock: 10, reserved: 0 })
        .expect(409);
      expect(resDupEn.body.message).toBe('This variant is already in an inventory');

      const resDupEs = await request
        .post('/api/inventory')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .send({ variant_id: tempVarEs.id, stock: 10, reserved: 0 })
        .expect(409);
      expect(resDupEs.body.message).toBe('Esta variante ya está en un inventario');

      // READ LIST
      const resListEn = await request
        .get('/api/inventory')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .expect(200);
      expect(resListEn.body.message).toBe('Show product inventories');

      const resListEs = await request
        .get('/api/inventory')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .expect(200);
      expect(resListEs.body.message).toBe('Lista de inventarios de productos');

      // READ BY ID
      const resFindEn = await request
        .get(`/api/inventory/${invIdEn}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .expect(200);
      expect(resFindEn.body.message).toBe('Product inventory found');

      const resFindEs = await request
        .get(`/api/inventory/${invIdEs}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .expect(200);
      expect(resFindEs.body.message).toBe('Inventario de producto encontrado');

      // NOT FOUND
      const res404En = await request
        .get('/api/inventory/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .expect(404);
      expect(res404En.body.message).toBe('Product inventory not found');

      const res404Es = await request
        .get('/api/inventory/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .expect(404);
      expect(res404Es.body.message).toBe('Inventario de producto no encontrado');

      // Función especial 4: Reserva mayor que el stock al actualizar (400)
      const resUpdate400En = await request
        .put(`/api/inventory/${invIdEn}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .send({ reserved: 50 })
        .expect(400);
      expect(resUpdate400En.body.message).toBe('The reservation cannot be greater than the stock');

      const resUpdate400Es = await request
        .put(`/api/inventory/${invIdEs}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .send({ reserved: 50 })
        .expect(400);
      expect(resUpdate400Es.body.message).toBe('La reserva no puede ser mayor que el stock');

      // UPDATE VÁLIDO
      const resUpdateEn = await request
        .put(`/api/inventory/${invIdEn}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .send({ stock: 30, reserved: 10 })
        .expect(200);
      expect(resUpdateEn.body.message).toBe('Product inventory updated');

      const resUpdateEs = await request
        .put(`/api/inventory/${invIdEs}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .send({ stock: 30, reserved: 10 })
        .expect(200);
      expect(resUpdateEs.body.message).toBe('Inventario de producto actualizado');

      // DELETE
      const resDeleteEn = await request
        .delete(`/api/inventory/${invIdEn}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .expect(200);
      expect(resDeleteEn.body.message).toBe('Product inventory deleted');

      const resDeleteEs = await request
        .delete(`/api/inventory/${invIdEs}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .expect(200);
      expect(resDeleteEs.body.message).toBe('Inventario de producto eliminado');
    });

    // -------------------------------------------------------------------------
    // 9. CUSTOMERS CONTROLLER (CRUD Completo)
    // -------------------------------------------------------------------------
    it('[Controlador: customers] ciclo CRUD completo debe responder con mensajes traducidos', async () => {
      // CREATE
      const resCreateEn = await request
        .post('/api/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .send({
          userId: 701,
          phone: '6141010101',
          email: 'customer_crud_en@example.com',
          addresses: [{
            type: 'SHIPPING',
            street: 'Av. Test',
            number: '1',
            city: 'Chihuahua',
            state: 'Chihuahua',
            postalCode: '31000',
            country: 'Mexico',
          }],
        })
        .expect(201);
      expect(resCreateEn.body.message).toBe('Client created succesfully');
      const custIdEn = resCreateEn.body.data._id;
      createdCustomerIds.push(custIdEn);

      const resCreateEs = await request
        .post('/api/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .send({
          userId: 702,
          phone: '6142020202',
          email: 'customer_crud_es@example.com',
          addresses: [{
            type: 'SHIPPING',
            street: 'Av. Test',
            number: '2',
            city: 'Chihuahua',
            state: 'Chihuahua',
            postalCode: '31000',
            country: 'Mexico',
          }],
        })
        .expect(201);
      expect(resCreateEs.body.message).toBe('Cliente creado exitosamente');
      const custIdEs = resCreateEs.body.data._id;
      createdCustomerIds.push(custIdEs);

      // READ LIST
      const resListEn = await request
        .get('/api/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .expect(200);
      expect(resListEn.body.message).toBe('Show customer list');

      const resListEs = await request
        .get('/api/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .expect(200);
      expect(resListEs.body.message).toBe('Mostrar la lista de clientes');

      // READ BY ID
      const resFindEn = await request
        .get(`/api/customers/${custIdEn}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .expect(200);
      expect(resFindEn.body.message).toBe('Customer found');

      const resFindEs = await request
        .get(`/api/customers/${custIdEs}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .expect(200);
      expect(resFindEs.body.message).toBe('Cliente encontrado');

      // NOT FOUND
      const nonExistentId = '650c1f1e1c9d440000000000';
      const res404En = await request
        .get(`/api/customers/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .expect(404);
      expect(res404En.body.message).toBe('Customer not found');

      const res404Es = await request
        .get(`/api/customers/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .expect(404);
      expect(res404Es.body.message).toBe('No se encontró al cliente');

      // UPDATE
      const resUpdateEn = await request
        .put(`/api/customers/${custIdEn}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .send({ phone: '6149999999' })
        .expect(200);
      expect(resUpdateEn.body.message).toBe('Customer updated');

      const resUpdateEs = await request
        .put(`/api/customers/${custIdEs}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .send({ phone: '6148888888' })
        .expect(200);
      expect(resUpdateEs.body.message).toBe('Cliente actualizado');

      // DELETE
      const resDeleteEn = await request
        .delete(`/api/customers/${custIdEn}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .expect(200);
      expect(resDeleteEn.body.message).toBe('Customer deleted');

      const resDeleteEs = await request
        .delete(`/api/customers/${custIdEs}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .expect(200);
      expect(resDeleteEs.body.message).toBe('Cliente eliminado');
    });

    // -------------------------------------------------------------------------
    // 10. ORDERS CONTROLLER (Operaciones CRUD de órdenes)
    // -------------------------------------------------------------------------
    it('[Controlador: orders] ciclo de órdenes debe responder con mensajes traducidos', async () => {
      // Crear un cliente auxiliar para vincular la orden
      const tempCustomer = await Customer.create({
        userId: 901,
        phone: '6143333333',
        email: 'customer_order_i18n@example.com',
        addresses: [{
          type: 'SHIPPING',
          street: 'Av. Ordenes',
          number: '10',
          city: 'Chihuahua',
          state: 'Chihuahua',
          postalCode: '31000',
          country: 'Mexico',
        }],
      });
      createdCustomerIds.push(tempCustomer._id);

      // CREATE
      const orderData = {
        customerId: tempCustomer._id,
        paymentMethod: 'card',
        totals: { subtotal: 100, shipping: 10, discount: 0, total: 110 },
        shippingAddress: {
          street: 'Av. Ordenes',
          number: '10',
          city: 'Chihuahua',
          state: 'Chihuahua',
          postalCode: '31000',
          country: 'Mexico',
        },
        items: [{ productId: 1, quantity: 1, unitPrice: 100 }],
      };

      const resCreateEn = await request
        .post('/api/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .send(orderData)
        .expect(201);
      expect(resCreateEn.body.message).toBe('Order created succesfully');
      const orderIdEn = resCreateEn.body.data._id;
      createdOrderIds.push(orderIdEn);

      const resCreateEs = await request
        .post('/api/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .send(orderData)
        .expect(201);
      expect(resCreateEs.body.message).toBe('Orden creada exitosamente');
      const orderIdEs = resCreateEs.body.data._id;
      createdOrderIds.push(orderIdEs);

      // READ LIST
      const resListEn = await request
        .get('/api/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .expect(200);
      expect(resListEn.body.message).toBe('Show orders');

      const resListEs = await request
        .get('/api/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .expect(200);
      expect(resListEs.body.message).toBe('Mostrar la lista de órdenes');

      // READ BY ID
      const resFindEn = await request
        .get(`/api/orders/${orderIdEn}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .expect(200);
      expect(resFindEn.body.message).toBe('Order found');

      const resFindEs = await request
        .get(`/api/orders/${orderIdEs}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .expect(200);
      expect(resFindEs.body.message).toBe('Orden encontrada');

      // NOT FOUND
      const nonExistentOrderId = '650c1f1e1c9d440000000000';
      const res404En = await request
        .get(`/api/orders/${nonExistentOrderId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .expect(404);
      expect(res404En.body.message).toBe('Order not found');

      const res404Es = await request
        .get(`/api/orders/${nonExistentOrderId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .expect(404);
      expect(res404Es.body.message).toBe('No se encontró la orden');

      // UPDATE
      const resUpdateEn = await request
        .put(`/api/orders/${orderIdEn}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=en')
        .send({ paymentMethod: 'cash' })
        .expect(200);
      expect(resUpdateEn.body.message).toBe('Order updated');

      const resUpdateEs = await request
        .put(`/api/orders/${orderIdEs}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', 'lang=es')
        .send({ paymentMethod: 'cash' })
        .expect(200);
      expect(resUpdateEs.body.message).toBe('Orden actualizada');
    });
  });

  describe('Traducciones en TODOS los templates Pug (error.pug, index.pug y layout.pug)', () => {
    // 1. error.pug & layout.pug (vía petición HTTP a vista de error)
    it('debe renderizar error.pug y layout.pug con traducciones en inglés (lang=en)', async () => {
      const response = await request
        .get('/web-nonexistent-page-pug')
        .set('Accept', 'text/html')
        .set('Cookie', 'lang=en')
        .expect(401);

      expect(response.headers['content-type']).toContain('text/html');
      // layout.pug: <head lang="en">
      expect(response.text).toContain('<head lang="en">');
      // error.pug: h1= message
      expect(response.text).toContain('<h1>Unauthorized</h1>');
      // error.pug: h2= __("error.statusLabel", status)
      expect(response.text).toContain('<h2>Status: 401</h2>');
    });

    it('debe renderizar error.pug y layout.pug con traducciones en español (lang=es)', async () => {
      const response = await request
        .get('/web-nonexistent-page-pug')
        .set('Accept', 'text/html')
        .set('Cookie', 'lang=es')
        .expect(401);

      expect(response.headers['content-type']).toContain('text/html');
      // layout.pug: <head lang="es">
      expect(response.text).toContain('<head lang="es">');
      // error.pug: h1= message
      expect(response.text).toContain('<h1>No autorizado</h1>');
      // error.pug: h2= __("error.statusLabel", status)
      expect(response.text).toContain('<h2>Estado: 401</h2>');
    });

    // 2. index.pug & layout.pug (vía renderizado del motor Pug de la aplicación)
    it('debe renderizar index.pug y layout.pug con traducciones en inglés (lang=en)', (done) => {
      const dummyReq = { headers: {}, cookies: { lang: 'en' } };
      i18n.init(dummyReq);

      app.render(
        'index',
        {
          title: 'Stride Co',
          __: dummyReq.__.bind(dummyReq),
          locale: dummyReq.getLocale(),
        },
        (err, html) => {
          expect(err).toBeNull();
          // layout.pug: <head lang="en">
          expect(html).toContain('<head lang="en">');
          // index.pug: h1= title
          expect(html).toContain('<h1>Stride Co</h1>');
          // index.pug: p= __("index.welcome", title)
          expect(html).toContain('<p>Welcome to Stride Co</p>');
          done();
        }
      );
    });

    it('debe renderizar index.pug y layout.pug con traducciones en español (lang=es)', (done) => {
      const dummyReq = { headers: {}, cookies: { lang: 'es' } };
      i18n.init(dummyReq);

      app.render(
        'index',
        {
          title: 'Stride Co',
          __: dummyReq.__.bind(dummyReq),
          locale: dummyReq.getLocale(),
        },
        (err, html) => {
          expect(err).toBeNull();
          // layout.pug: <head lang="es">
          expect(html).toContain('<head lang="es">');
          // index.pug: h1= title
          expect(html).toContain('<h1>Stride Co</h1>');
          // index.pug: p= __("index.welcome", title)
          expect(html).toContain('<p>Bienvenido a Stride Co</p>');
          done();
        }
      );
    });
  });
});
