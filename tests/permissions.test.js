/* global describe, test, expect, jest, beforeEach, afterEach */
const request = require('supertest');
const app = require('../app');
const { Permission, Role } = require('../models/relationals');
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

describe('Suite de Permisos con Mocks (tests/permissions.test.js)', () => {
  beforeEach(() => {
    jest.spyOn(Role, 'findAll').mockResolvedValue([
      {
        toJSON: () => ({
          name: 'ADMIN',
          permissions: [
            { key: 'permissions:read:any' }
          ]
        })
      }
    ]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('GET /api/permissions debe retornar la lista de permisos (200)', async () => {
    const mockPermissionsList = [
      { id: 1, key: 'products:read:any', description: 'Leer productos' },
      { id: 2, key: 'users:create:any', description: 'Crear usuarios' }
    ];

    jest.spyOn(Permission, 'findAll').mockResolvedValue(mockPermissionsList);

    const res = await request(app)
      .get('/api/permissions')
      .set('Authorization', `Bearer ${mockAdminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data[0].key).toBe('products:read:any');
  });
});