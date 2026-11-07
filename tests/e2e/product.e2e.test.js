const { request, login } = require('./helpers');
const { sequelize } = require('../../models/relationals');
const Product = require('../../models/relationals/Product');

jest.setTimeout(30000);

describe('Products Resource & RBAC (E2E)', () => {
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
  let createdProductId;

  beforeAll(async () => {
    adminToken = await login(adminCredentials.email, adminCredentials.password);
    restrictedToken = await login(restrictedCredentials.email, restrictedCredentials.password);
  });

  afterAll(async () => {
    if (createdProductId) {
      try {
        await Product.destroy({ where: { id: createdProductId } });
      } catch (err) {
        // Ignorar si ya fue eliminado en la prueba de DELETE
      }
    }

    if (sequelize && typeof sequelize.close === 'function') {
      await sequelize.close();
    }
  });

  describe('Control de Acceso (RBAC & Auth Verification)', () => {
    it('GET /api/products debe retornar 401 Unauthorized sin token', async () => {
      const response = await request
        .get('/api/products')
        .expect(401);

      expect(response.status).toBe(401);
    });

    it('POST /api/products debe retornar 403 Forbidden con token de usuario restringido', async () => {
      const response = await request
        .post('/api/products')
        .set('Authorization', `Bearer ${restrictedToken}`)
        .send({
          name: 'Producto No Autorizado',
          price: 99.99,
          description: 'Intento de creacion sin permisos',
        })
        .expect(403);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
    });

    it('PUT /api/products/:id debe retornar 403 Forbidden con token de usuario restringido', async () => {
      const response = await request
        .put('/api/products/1')
        .set('Authorization', `Bearer ${restrictedToken}`)
        .send({
          name: 'Producto Modificado Ilegalmente',
        })
        .expect(403);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
    });

    it('DELETE /api/products/:id debe retornar 403 Forbidden con token de usuario restringido', async () => {
      const response = await request
        .delete('/api/products/1')
        .set('Authorization', `Bearer ${restrictedToken}`)
        .expect(403);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Operaciones CRUD (Con Token Admin)', () => {
    it('POST /api/products debe crear un nuevo producto y retornar HTTP 201', async () => {
      const newProduct = {
        name: 'Producto E2E',
        price: 150.00,
        description: 'Test Product',
      };

      const response = await request
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newProduct)
        .expect(201);

      expect(response.body).toHaveProperty('data.id');
      expect(response.body.data.name).toBe(newProduct.name);
      createdProductId = response.body.data.id;
    });

    it('GET /api/products debe listar productos y retornar HTTP 200 con variantes', async () => {
      const response = await request
        .get('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);

      const found = response.body.data.find((p) => p.id === createdProductId);
      expect(found).toBeDefined();
      expect(found).toHaveProperty('variants');
    });

    it('GET /api/products/:id debe consultar el producto por ID y retornar HTTP 200', async () => {
      const response = await request
        .get(`/api/products/${createdProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.id).toBe(createdProductId);
      expect(response.body.data.name).toBe('Producto E2E');
    });

    it('GET /api/products/999999 debe consultar un ID inexistente y retornar HTTP 404', async () => {
      const response = await request
        .get('/api/products/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
    });

    it('PUT /api/products/:id debe actualizar el producto y retornar HTTP 200', async () => {
      const updateData = {
        name: 'Producto E2E Actualizado',
      };

      const response = await request
        .put(`/api/products/${createdProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.name).toBe(updateData.name);
    });

    it('DELETE /api/products/:id debe eliminar el producto y retornar HTTP 200', async () => {
      const response = await request
        .delete(`/api/products/${createdProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.status).toBe(200);
    });

    it('GET /api/products/:id (Post-eliminar) debe retornar HTTP 404 al buscar el ID eliminado', async () => {
      const response = await request
        .get(`/api/products/${createdProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
    });
  });
});
