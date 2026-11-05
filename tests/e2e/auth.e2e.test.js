const request = require('supertest');
const { baseURL } = require('./helpers');

describe('Auth & Protected Routes (E2E)', () => {
  const validCredentials = {
    email: process.env.TEST_USER_EMAIL || 'admin@stride.com', // Ajustado a un email real de la BD
    password: process.env.TEST_USER_PASSWORD || 'Password123',   // Ajustado a la contraseña real de la BD
  };

  let token;

  describe('POST /api/auth/login', () => {
    it('debe retornar 200 OK y response.body.data.token con credenciales correctas', async () => {
      const response = await request(baseURL)
        .post('/api/auth/login')
        .send(validCredentials)
        .expect(200);

      expect(response.body).toHaveProperty('data.token');
      expect(typeof response.body.data.token).toBe('string');
      token = response.body.data.token;
    });

    it('debe retornar 401 Unauthorized y { message: "Invalid credentials" } con credenciales incorrectas', async () => {
      const response = await request(baseURL)
        .post('/api/auth/login')
        .send({
          email: 'invalid_user@example.com',
          password: 'wrong_password',
        })
        .expect(401);

      expect(response.body).toEqual({ message: 'Invalid credentials' });
    });
  });

  describe('GET /api/auth/me', () => {
    it('debe retornar 200 OK y la información del usuario autenticado con Authorization: Bearer <token>', async () => {
      if (!token) {
        const loginRes = await request(baseURL)
          .post('/api/auth/login')
          .send(validCredentials);
        token = loginRes.body?.data?.token;
      }

      const response = await request(baseURL)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(validCredentials.email);
    });
  });

  describe('GET /api/products', () => {
    it('debe retornar 401 Unauthorized sin encabezado Authorization', async () => {
      const response = await request(baseURL)
        .get('/api/products')
        .expect(401);

      expect(response.status).toBe(401);
    });
  });
});