/* global describe, test, expect, jest */
const request = require('supertest');
const jwt = require('jsonwebtoken');

// 1. Mock de los modelos relacionales
jest.mock('../models/relationals', () => {
  return {
    User: {
      findOne: jest.fn()
    },
    Role: {}
  };
});

// 2. Mock directo del archivo utilitario de contraseña
jest.mock('../utils/password', () => ({
  verifyPassword: jest.fn().mockResolvedValue(true),
  hashPassword: jest.fn()
}));

const { User } = require('../models/relationals');
const app = require('../app');

jest.setTimeout(30000);

describe('Suite de Autenticación con Mocks (tests/auth.test.js)', () => {

  test('POST /api/auth/login debe autenticar exitosamente y retornar un JWT (200)', async () => {
    const mockUser = {
      id: 1,
      first_name: 'Admin',
      last_name: 'User',
      email: 'admin@stride.com',
      password: 'hashed_password_secure',
      active: true,
      role: {
        id: 1,
        name: 'ADMIN'
      }
    };

    // Forzamos la respuesta del mock
    User.findOne.mockResolvedValue(mockUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@stride.com', password: 'Password123!' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('token');
  });

  test('POST /api/auth/login debe responder 401 si el usuario no existe', async () => {
    User.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'inexistente@stride.com', password: 'Password123!' });

    expect(res.statusCode).toBe(401);
  });

  test('POST /api/auth/login debe responder 401 si el usuario está inactivo', async () => {
    const inactiveUser = {
      id: 2,
      email: 'inactivo@stride.com',
      password: 'hashed_password',
      active: false
    };

    User.findOne.mockResolvedValue(inactiveUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'inactivo@stride.com', password: 'Password123!' });

    expect(res.statusCode).toBe(401);
  });
});