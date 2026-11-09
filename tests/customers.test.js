/* global describe, test, expect, jest, beforeEach, afterEach */
const request = require('supertest');
const app = require('../app');
const { Customer } = require('../models/documents');
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

describe('Suite de Clientes con Mocks MongoDB (tests/customers.test.js)', () => {
  beforeEach(() => {
    jest.spyOn(Role, 'findAll').mockResolvedValue([
      {
        toJSON: () => ({
          name: 'ADMIN',
          permissions: [
            { key: 'customers:read:any' },
            { key: 'customers:create:any' },
            { key: 'customers:update:any' },
            { key: 'customers:delete:any' }
          ]
        })
      }
    ]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('GET /api/customers debe listar los clientes simulando Mongoose (200)', async () => {
    const mockCustomers = [
      { _id: '650c1f1e1c9d440000000001', userId: 1, phone: '6141234567' }
    ];
    jest.spyOn(Customer, 'find').mockResolvedValue(mockCustomers);

    const res = await request(app)
      .get('/api/customers')
      .set('Authorization', `Bearer ${mockAdminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data[0].phone).toBe('6141234567');
  });

  test('GET /api/customers/:id debe responder 404 si el cliente no existe', async () => {
    jest.spyOn(Customer, 'findById').mockResolvedValue(null);

    const res = await request(app)
      .get('/api/customers/650c1f1e1c9d440000000099')
      .set('Authorization', `Bearer ${mockAdminToken}`);

    expect(res.statusCode).toBe(404);
  });
});