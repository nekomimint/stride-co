const { request, login } = require('./helpers');
const { Product, ProductVariant, Inventory, sequelize } = require('../../models/relationals');

jest.setTimeout(30000);

describe('Inventory Resource & RBAC Control (E2E)', () => {
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
  let testProductId;
  let createdProductId;
  let testVariantId;
  let createdInventoryId;

  const testSku = 'E2E-INV-VAR-SKU-01';

  beforeAll(async () => {
    adminToken = await login(adminCredentials.email, adminCredentials.password);
    restrictedToken = await login(restrictedCredentials.email, restrictedCredentials.password);

    // Obtener un producto existente o crear uno auxiliar
    const existingProduct = await Product.findOne();
    if (existingProduct) {
      testProductId = existingProduct.id;
    } else {
      const auxiliaryProduct = await Product.create({
        name: 'Producto Auxiliar E2E Inventario',
        price: 89.99,
        description: 'Creado para asociar variantes en pruebas de inventario',
      });
      testProductId = auxiliaryProduct.id;
      createdProductId = auxiliaryProduct.id;
    }

    // Limpieza preventiva si existía variante previa
    const priorVariant = await ProductVariant.findOne({ where: { sku: testSku } });
    if (priorVariant) {
      await Inventory.destroy({ where: { variant_id: priorVariant.id } });
      await priorVariant.destroy();
    }

    // Crear una variante dedicada para las pruebas de inventario
    const newVariant = await ProductVariant.create({
      sku: testSku,
      size: '27',
      color: 'Gris Espacial',
      product_id: testProductId,
      active: true,
    });
    testVariantId = newVariant.id;
  });

  afterAll(async () => {
    if (createdInventoryId) {
      try {
        await Inventory.destroy({ where: { id: createdInventoryId } });
      } catch (err) {
        // Ignorar si ya fue eliminado
      }
    }

    if (testVariantId) {
      try {
        await Inventory.destroy({ where: { variant_id: testVariantId } });
        await ProductVariant.destroy({ where: { id: testVariantId } });
      } catch (err) {
        // Ignorar
      }
    }

    try {
      const v = await ProductVariant.findOne({ where: { sku: testSku } });
      if (v) {
        await Inventory.destroy({ where: { variant_id: v.id } });
        await v.destroy();
      }
    } catch (err) {
      // Ignorar
    }

    if (createdProductId) {
      try {
        await Product.destroy({ where: { id: createdProductId } });
      } catch (err) {
        // Ignorar
      }
    }

    if (sequelize && typeof sequelize.close === 'function') {
      await sequelize.close();
    }
  });

  describe('Autenticación y Control de Acceso (Token & RBAC Verification)', () => {
    it('GET /api/inventory debe retornar 401 Unauthorized sin token', async () => {
      const response = await request
        .get('/api/inventory')
        .expect(401);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    it('POST /api/inventory debe retornar 401 Unauthorized sin token', async () => {
      const response = await request
        .post('/api/inventory')
        .send({
          variant_id: testVariantId,
          stock: 10,
          reserved: 0,
        })
        .expect(401);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    it('GET /api/inventory debe retornar 403 Forbidden con token de usuario restringido', async () => {
      const response = await request
        .get('/api/inventory')
        .set('Authorization', `Bearer ${restrictedToken}`)
        .expect(403);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
    });

    it('POST /api/inventory debe retornar 403 Forbidden con token de usuario restringido', async () => {
      const response = await request
        .post('/api/inventory')
        .set('Authorization', `Bearer ${restrictedToken}`)
        .send({
          variant_id: testVariantId,
          stock: 20,
          reserved: 5,
        })
        .expect(403);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
    });

    it('GET /api/inventory/1 debe retornar 403 Forbidden con token de usuario restringido', async () => {
      const response = await request
        .get('/api/inventory/1')
        .set('Authorization', `Bearer ${restrictedToken}`)
        .expect(403);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
    });

    it('PUT /api/inventory/1 debe retornar 403 Forbidden con token de usuario restringido', async () => {
      const response = await request
        .put('/api/inventory/1')
        .set('Authorization', `Bearer ${restrictedToken}`)
        .send({
          stock: 30,
        })
        .expect(403);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
    });

    it('DELETE /api/inventory/1 debe retornar 403 Forbidden con token de usuario restringido', async () => {
      const response = await request
        .delete('/api/inventory/1')
        .set('Authorization', `Bearer ${restrictedToken}`)
        .expect(403);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Reglas de Negocio y Relación con Variantes', () => {
    it('POST /api/inventory debe retornar 404 Not Found si la variante no existe al agregarse el variant_id', async () => {
      const nonExistentVariantId = 999999;

      const response = await request
        .post('/api/inventory')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          variant_id: nonExistentVariantId,
          stock: 20,
          reserved: 0,
        })
        .expect(404);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
    });

    it('POST /api/inventory debe retornar 400 Bad Request si reserved es mayor al stock en la creación', async () => {
      const response = await request
        .post('/api/inventory')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          variant_id: testVariantId,
          stock: 5,
          reserved: 15,
        })
        .expect(400);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Ciclo CRUD Completo (Con Token Admin)', () => {
    it('POST /api/inventory debe crear el inventario de la variante y retornar HTTP 201', async () => {
      const inventoryPayload = {
        variant_id: testVariantId,
        stock: 35,
        reserved: 5,
      };

      const response = await request
        .post('/api/inventory')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(inventoryPayload)
        .expect(201);

      expect(response.body).toHaveProperty('data.id');
      expect(response.body.data.variant_id).toBe(testVariantId);
      expect(response.body.data.stock).toBe(inventoryPayload.stock);
      expect(response.body.data.reserved).toBe(inventoryPayload.reserved);
      createdInventoryId = response.body.data.id;
    });

    it('POST /api/inventory debe retornar 409 Conflict al intentar asignar un inventario duplicado a la misma variante', async () => {
      const duplicatePayload = {
        variant_id: testVariantId,
        stock: 10,
        reserved: 2,
      };

      const response = await request
        .post('/api/inventory')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(duplicatePayload)
        .expect(409);

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('message');
    });

    it('GET /api/inventory debe listar los inventarios y retornar HTTP 200 con la variante asociada', async () => {
      const response = await request
        .get('/api/inventory')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      const found = response.body.data.find((inv) => inv.id === createdInventoryId);
      expect(found).toBeDefined();
      expect(found).toHaveProperty('variant');
      expect(found.variant).toHaveProperty('id', testVariantId);
      expect(found.variant.sku).toBe(testSku);
    });

    it('GET /api/inventory/:id debe consultar el inventario por su ID y retornar HTTP 200 con la variante asociada', async () => {
      const response = await request
        .get(`/api/inventory/${createdInventoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.id).toBe(createdInventoryId);
      expect(response.body.data.variant_id).toBe(testVariantId);
      expect(response.body.data).toHaveProperty('variant');
      expect(response.body.data.variant.id).toBe(testVariantId);
      expect(response.body.data.variant.sku).toBe(testSku);
    });

    it('GET /api/inventory/999999 debe consultar un ID inexistente y retornar HTTP 404', async () => {
      const response = await request
        .get('/api/inventory/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
    });

    it('PUT /api/inventory/:id debe retornar 400 Bad Request si el reserved actualizado supera el stock', async () => {
      const response = await request
        .put(`/api/inventory/${createdInventoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          reserved: 100, // stock actual es 35
        })
        .expect(400);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('PUT /api/inventory/:id debe actualizar stock y reservas válidas y retornar HTTP 200', async () => {
      const updatePayload = {
        stock: 50,
        reserved: 15,
      };

      const response = await request
        .put(`/api/inventory/${createdInventoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatePayload)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.id).toBe(createdInventoryId);
      expect(response.body.data.stock).toBe(updatePayload.stock);
      expect(response.body.data.reserved).toBe(updatePayload.reserved);
    });

    it('PUT /api/inventory/999999 debe retornar HTTP 404 al intentar actualizar un ID inexistente', async () => {
      const response = await request
        .put('/api/inventory/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          stock: 10,
        })
        .expect(404);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
    });

    it('DELETE /api/inventory/:id debe eliminar el inventario y retornar HTTP 200', async () => {
      const response = await request
        .delete(`/api/inventory/${createdInventoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('DELETE /api/inventory/999999 debe retornar HTTP 404 al intentar eliminar un ID inexistente', async () => {
      const response = await request
        .delete('/api/inventory/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
    });

    it('GET /api/inventory/:id (Post-eliminar) debe retornar HTTP 404 al consultar el ID eliminado', async () => {
      const response = await request
        .get(`/api/inventory/${createdInventoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
    });
  });
});
