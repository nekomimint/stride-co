const { request, login } = require('./helpers');
const { Product, ProductVariant, sequelize } = require('../../models/relationals');

jest.setTimeout(30000);

describe('Variants Resource & RBAC Control (E2E)', () => {
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
  let createdVariantId;
  let testProductId;
  let createdProductId;

  const testSku = 'E2E-VAR-SKU-TEST-01';
  const testSkuUpdated = 'E2E-VAR-SKU-TEST-01-UPD';

  beforeAll(async () => {
    adminToken = await login(adminCredentials.email, adminCredentials.password);
    restrictedToken = await login(restrictedCredentials.email, restrictedCredentials.password);

    // Obtener un producto existente o crear uno auxiliar si la base está vacía
    const existingProduct = await Product.findOne();
    if (existingProduct) {
      testProductId = existingProduct.id;
    } else {
      const auxiliaryProduct = await Product.create({
        name: 'Producto Auxiliar E2E Variantes',
        price: 99.99,
        description: 'Creado para asociar variantes en pruebas E2E',
      });
      testProductId = auxiliaryProduct.id;
      createdProductId = auxiliaryProduct.id;
    }

    try {
      await ProductVariant.destroy({ where: { sku: [testSku, testSkuUpdated] } });
    } catch (err) {
      // Ignorar si no existen previamente
    }
  });

  afterAll(async () => {
    if (createdVariantId) {
      try {
        await ProductVariant.destroy({ where: { id: createdVariantId } });
      } catch (err) {
        // Ignorar si ya fue eliminado en la prueba
      }
    }

    try {
      await ProductVariant.destroy({ where: { sku: [testSku, testSkuUpdated] } });
    } catch (err) {
      // Ignorar si no existen
    }

    if (createdProductId) {
      try {
        await Product.destroy({ where: { id: createdProductId } });
      } catch (err) {
        // Ignorar si ya fue eliminado
      }
    }

    if (sequelize && typeof sequelize.close === 'function') {
      await sequelize.close();
    }
  });

  describe('Autenticación y Control de Acceso (Token & RBAC Verification)', () => {
    it('GET /api/variants debe retornar 401 Unauthorized sin token', async () => {
      const response = await request
        .get('/api/variants')
        .expect(401);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    it('POST /api/variants debe retornar 401 Unauthorized sin token', async () => {
      const response = await request
        .post('/api/variants')
        .send({
          sku: 'NO-TOKEN-SKU',
          size: '26',
          color: 'Negro',
          product_id: testProductId,
        })
        .expect(401);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    it('POST /api/variants debe retornar 403 Forbidden con token de usuario restringido', async () => {
      const response = await request
        .post('/api/variants')
        .set('Authorization', `Bearer ${restrictedToken}`)
        .send({
          sku: 'UNAUTHORIZED-SKU',
          size: '28',
          color: 'Azul',
          product_id: testProductId,
        })
        .expect(403);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
    });

    it('PUT /api/variants/1 debe retornar 403 Forbidden con token de usuario restringido', async () => {
      const response = await request
        .put('/api/variants/1')
        .set('Authorization', `Bearer ${restrictedToken}`)
        .send({
          color: 'Verde',
        })
        .expect(403);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
    });

    it('DELETE /api/variants/1 debe retornar 403 Forbidden con token de usuario restringido', async () => {
      const response = await request
        .delete('/api/variants/1')
        .set('Authorization', `Bearer ${restrictedToken}`)
        .expect(403);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
    });

    it('GET /api/variants debe retornar 200 OK con token de usuario restringido (permiso de lectura)', async () => {
      const response = await request
        .get('/api/variants')
        .set('Authorization', `Bearer ${restrictedToken}`)
        .expect(200);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Ciclo CRUD Completo (Con Token Admin)', () => {
    it('POST /api/variants debe crear una nueva variante y retornar HTTP 201', async () => {
      const variantPayload = {
        sku: testSku,
        size: '27',
        color: 'Rojo',
        product_id: testProductId,
        active: true,
      };

      const response = await request
        .post('/api/variants')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(variantPayload)
        .expect(201);

      expect(response.body).toHaveProperty('data.id');
      expect(response.body.data.sku).toBe(variantPayload.sku);
      expect(response.body.data.size).toBe(variantPayload.size);
      expect(response.body.data.color).toBe(variantPayload.color);
      expect(response.body.data.product_id).toBe(testProductId);
      createdVariantId = response.body.data.id;
    });

    it('GET /api/variants debe listar las variantes y retornar HTTP 200 con asociación de producto', async () => {
      const response = await request
        .get('/api/variants')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      const found = response.body.data.find((v) => v.id === createdVariantId);
      expect(found).toBeDefined();
      expect(found).toHaveProperty('product');
      expect(found.product).toHaveProperty('id', testProductId);
    });

    it('GET /api/variants/:id debe consultar la variante por su id y retornar HTTP 200', async () => {
      const response = await request
        .get(`/api/variants/${createdVariantId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.id).toBe(createdVariantId);
      expect(response.body.data.sku).toBe(testSku);
      expect(response.body.data).toHaveProperty('product');
    });

    it('GET /api/variants/999999 debe consultar un ID inexistente y retornar HTTP 404', async () => {
      const response = await request
        .get('/api/variants/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
    });

    it('PUT /api/variants/:id debe actualizar la variante y retornar HTTP 200', async () => {
      const updatePayload = {
        sku: testSkuUpdated,
        color: 'Negro Mate',
        size: '27.5',
      };

      const response = await request
        .put(`/api/variants/${createdVariantId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatePayload)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.id).toBe(createdVariantId);
      expect(response.body.data.sku).toBe(updatePayload.sku);
      expect(response.body.data.color).toBe(updatePayload.color);
      expect(response.body.data.size).toBe(updatePayload.size);
    });

    it('PUT /api/variants/999999 debe retornar HTTP 404 al intentar actualizar un ID inexistente', async () => {
      const response = await request
        .put('/api/variants/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          color: 'Blanco',
        })
        .expect(404);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
    });

    it('DELETE /api/variants/:id debe eliminar la variante y retornar HTTP 200', async () => {
      const response = await request
        .delete(`/api/variants/${createdVariantId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('DELETE /api/variants/999999 debe retornar HTTP 404 al intentar eliminar un ID inexistente', async () => {
      const response = await request
        .delete('/api/variants/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
    });

    it('GET /api/variants/:id (Post-eliminar) debe retornar HTTP 404 al consultar el ID eliminado', async () => {
      const response = await request
        .get(`/api/variants/${createdVariantId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
    });
  });
});
