/* global describe, test, expect, jest, beforeEach, afterEach */
const request = require('supertest');
const app = require('../app');
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

// Helper para envolver objetos planos con .toJSON() para que Sequelize y config/rbac.js no fallen
const createMockRole = (id, name, description, permissions = []) => ({
  id,
  name,
  description,
  permissions,
  toJSON: function () {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      permissions: this.permissions
    };
  }
});

describe('Suite de Roles con Mocks (tests/roles.test.js)', () => {
  beforeEach(() => {
    // Garantizamos que AccessControl SIEMPRE encuentre el rol ADMIN con los permisos de la ruta
    jest.spyOn(Role, 'findAll').mockResolvedValue([
      createMockRole(1, 'ADMIN', 'Administrador general', [
        { key: 'roles:read:any' },
        { key: 'roles:create:any' },
        { key: 'roles:update:any' },
        { key: 'roles:delete:any' }
      ]),
      createMockRole(2, 'USER', 'Usuario estándar', [])
    ]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('GET /api/roles debe retornar la lista de roles (200)', async () => {
    const res = await request(app)
      .get('/api/roles')
      .set('Authorization', `Bearer ${mockAdminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data[0].name).toBe('ADMIN');
  });

  test('GET /api/roles/:id debe responder 404 si el rol no existe', async () => {
    jest.spyOn(Role, 'findByPk').mockResolvedValue(null);

    const res = await request(app)
      .get('/api/roles/999')
      .set('Authorization', `Bearer ${mockAdminToken}`);

    expect(res.statusCode).toBe(404);
  });
});