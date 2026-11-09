/* global describe, test, expect, jest, beforeEach, afterEach */
const request = require('supertest');
const app = require('../app');
const ProductVariant = require('../models/relationals/ProductVariant');
const { Role } = require('../models/relationals');
const jwt = require('jsonwebtoken');
const config = require('config');

jest.setTimeout(30000);

const secretKey = config.has('auth.jwtSecret')
  ? config.get('auth.jwtSecret')
  : (config.has('jwt.secret') ? config.get('jwt.secret') : 'test-secret');

const mockAdminToken = jwt.sign(
  { sub: '1', id: 1, role: 'ADMIN' },
  secretKey,
  { algorithm: 'HS256' }
);

describe('Suite de Variantes de Producto con Mocks (tests/variants.test.js)', () => {
  beforeEach(() => {
    jest.spyOn(Role, 'findAll').mockResolvedValue([
      {
        toJSON: () => ({
          name: 'ADMIN',
          permissions: [
            { key: 'variants:read:any' },
            { key: 'variants:create:any' },
            { key: 'variants:update:any' },
            { key: 'variants:delete:any' }
          ]
        })
      }
    ]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('GET /api/variants debe retornar el catálogo de variantes (200)', async () => {
    const mockVariantsList = [
      { id: 1, product_id: 1, sku: 'NK-AIR-27', price: 2500 },
      { id: 2, product_id: 1, sku: 'NK-AIR-28', price: 2500 }
    ];

    jest.spyOn(ProductVariant, 'findAll').mockResolvedValue(mockVariantsList);

    const res = await request(app)
      .get('/api/variants')
      .set('Authorization', `Bearer ${mockAdminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data[0].sku).toBe('NK-AIR-27');
  });

  test('GET /api/variants/:id debe responder 404 si la variante no existe', async () => {
    jest.spyOn(ProductVariant, 'findByPk').mockResolvedValue(null);

    const res = await request(app)
      .get('/api/variants/999')
      .set('Authorization', `Bearer ${mockAdminToken}`);

    expect(res.statusCode).toBe(404);
  });
});