/* global describe, test, expect, jest, beforeEach, afterEach */
const request = require('supertest');
const app = require('../app');
const { User, Role } = require('../models/relationals');
const jwt = require('jsonwebtoken');
const config = require('config');

jest.setTimeout(30000);

const secretKey = config.has('auth.jwtSecret')
  ? config.get('auth.jwtSecret')
  : (config.has('jwt.secret') ? config.get('jwt.secret') : 'test-secret');

const mockAdminToken = jwt.sign(
  { 
    sub: '1', 
    id: 1, 
    role: 'ADMIN',
    permissions: ['users:read:any', 'users:read:own', 'users:update:any', 'users:delete:any']
  },
  secretKey,
  { algorithm: 'HS256' }
);

describe('Suite de Usuarios con Mocks (tests/users.test.js)', () => {
  beforeEach(() => {
    // mock de los roles en cada test para alimentar AccessControl RBAC antes de pasar por authorize
    jest.spyOn(Role, 'findAll').mockResolvedValue([
      {
        toJSON: () => ({
          name: 'ADMIN',
          permissions: [
            { key: 'users:read:any' },
            { key: 'users:read:own' },
            { key: 'users:create:any' },
            { key: 'users:update:any' },
            { key: 'users:delete:any' }
          ]
        })
      }
    ]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('GET /api/users debe listar los usuarios (200)', async () => {
    const mockUsers = [
      { id: 1, first_name: 'Juan', last_name: 'Pérez', email: 'juan@example.com', role: { name: 'ADMIN' } }
    ];

    jest.spyOn(User, 'findAll').mockResolvedValue(mockUsers);

    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${mockAdminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data[0].first_name).toBe('Juan');
  });

  test('GET /api/users/:id debe responder 404 si el usuario no existe', async () => {
    jest.spyOn(User, 'findByPk').mockResolvedValue(null);

    const res = await request(app)
      .get('/api/users/999')
      .set('Authorization', `Bearer ${mockAdminToken}`);

    expect(res.statusCode).toBe(404);
  });
});