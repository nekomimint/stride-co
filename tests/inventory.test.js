/* global describe, test, expect, jest, beforeEach, afterEach */
const request = require('supertest');
const app = require('../app');
const Inventory = require('../models/relationals/Inventory');
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

describe('Suite de Inventario con Mocks (tests/inventory.test.js)', () => {
  beforeEach(() => {
    jest.spyOn(Role, 'findAll').mockResolvedValue([
      {
        toJSON: () => ({
          name: 'ADMIN',
          permissions: [
            { key: 'inventory:read:any' },
            { key: 'inventory:update:any' }
          ]
        })
      }
    ]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('GET /api/inventory debe retornar los registros de inventario (200)', async () => {
    const mockInventoryList = [
      { id: 1, variant_id: 1, stock_quantity: 50, reorder_level: 10 }
    ];

    jest.spyOn(Inventory, 'findAll').mockResolvedValue(mockInventoryList);

    const res = await request(app)
      .get('/api/inventory')
      .set('Authorization', `Bearer ${mockAdminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data[0].stock_quantity).toBe(50);
  });

  test('GET /api/inventory/:id debe responder 404 si el registro no existe', async () => {
    jest.spyOn(Inventory, 'findByPk').mockResolvedValue(null);

    const res = await request(app)
      .get('/api/inventory/999')
      .set('Authorization', `Bearer ${mockAdminToken}`);

    expect(res.statusCode).toBe(404);
  });
});