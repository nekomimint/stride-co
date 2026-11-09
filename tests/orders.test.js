/* global describe, test, expect, jest, beforeEach, afterEach */
const request = require('supertest');
const app = require('../app');
const { Order } = require('../models/documents');
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

describe('Suite de Órdenes con Mocks MongoDB (tests/orders.test.js)', () => {
  beforeEach(() => {
    jest.spyOn(Role, 'findAll').mockResolvedValue([
      {
        toJSON: () => ({
          name: 'ADMIN',
          permissions: [
            { key: 'orders:read:any' },
            { key: 'orders:create:any' },
            { key: 'orders:update:any' },
            { key: 'orders:delete:any' }
          ]
        })
      }
    ]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('GET /api/orders debe listar todas las órdenes para Admin (200)', async () => {
    const mockOrders = [
      { _id: '650c1f1e1c9d440000000010', status: 'pending', totals: { total: 1500 } }
    ];
    jest.spyOn(Order, 'find').mockResolvedValue(mockOrders);

    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${mockAdminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data[0].status).toBe('pending');
  });

  test('GET /api/orders/:id debe responder 404 si la orden no existe', async () => {
    jest.spyOn(Order, 'findById').mockResolvedValue(null);

    const res = await request(app)
      .get('/api/orders/650c1f1e1c9d440000000099')
      .set('Authorization', `Bearer ${mockAdminToken}`);

    expect(res.statusCode).toBe(404);
  });
});