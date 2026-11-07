const { request, login } = require('./helpers');
const { User, sequelize } = require('../../models/relationals');

jest.setTimeout(30000);

describe('Users Resource & Scope Access Control (E2E)', () => {
  const adminCredentials = {
    email: process.env.ADMIN_EMAIL || 'jesus@gmail.com',
    password: process.env.ADMIN_PASSWORD || 'admin123',
  };

  const userCredentials = {
    email: process.env.USER_EMAIL || 'sofia@gmail.com',
    password: process.env.USER_PASSWORD || 'usuario123',
  };

  let adminToken;
  let userToken;
  let createdUserId;
  const testEmail = 'user.e2e@example.com';

  beforeAll(async () => {
    adminToken = await login(adminCredentials.email, adminCredentials.password);
    userToken = await login(userCredentials.email, userCredentials.password);

    try {
      await User.destroy({ where: { email: testEmail } });
    } catch (err) {
      // Ignorar si no existe
    }
  });

  afterAll(async () => {
    if (createdUserId) {
      try {
        await User.destroy({ where: { id: createdUserId } });
      } catch (err) {
        // Ignorar si ya fue eliminado en la prueba
      }
    }

    if (sequelize && typeof sequelize.close === 'function') {
      await sequelize.close();
    }
  });

  describe('Control de Acceso (RBAC & Alcance own/any)', () => {
    it('POST /api/users debe responder 403 Forbidden con token restringido', async () => {
      const response = await request
        .post('/api/users')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'No',
          lastName: 'Autorizado',
          email: 'no.autorizado.user@example.com',
          password: 'Password123!',
          roleId: 1,
        })
        .expect(403);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
    });

    it('GET /api/users (Listado global) debe responder 403 Forbidden con token restringido', async () => {
      const response = await request
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
    });

    it('DELETE /api/users/:id debe responder 403 Forbidden con token restringido', async () => {
      const response = await request
        .delete('/api/users/1')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
    });

    it('GET /api/users/:id (Usuario Ajeno) debe responder 403 Forbidden al consultar un id ajeno', async () => {
      // Jesus tiene id 3, mientras que Sofia tiene id 5
      const alienUserId = 3;

      const response = await request
        .get(`/api/users/${alienUserId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Ciclo CRUD Completo (Con Token Admin)', () => {
    it('POST /api/users debe crear un usuario y retornar HTTP 201', async () => {
      const userData = {
        name: 'Usuario',
        lastName: 'E2E',
        email: testEmail,
        password: 'Password123!',
        roleId: 1,
      };

      const response = await request
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('data.id');
      expect(response.body.data.email).toBe(userData.email);
      createdUserId = response.body.data.id;
    });

    it('GET /api/users debe consultar el listado y retornar HTTP 200 con roles incluidos', async () => {
      const response = await request
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('role');
    });

    it('GET /api/users/:id debe consultar el usuario creado por id y retornar HTTP 200 con su rol', async () => {
      const response = await request
        .get(`/api/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.id).toBe(createdUserId);
      expect(response.body.data).toHaveProperty('role');
    });

    it('GET /api/users/999999 debe consultar un ID inexistente y retornar HTTP 404', async () => {
      const response = await request
        .get('/api/users/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
    });

    it('PUT /api/users/:id debe actualizar datos del usuario y retornar HTTP 200', async () => {
      const updateData = {
        name: 'Usuario Actualizado',
        lastName: 'E2E Edit',
      };

      const response = await request
        .put(`/api/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.first_name).toBe(updateData.name);
      expect(response.body.data.last_name).toBe(updateData.lastName);
    });

    it('DELETE /api/users/:id debe eliminar el usuario creado y retornar HTTP 200', async () => {
      const response = await request
        .delete(`/api/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('GET /api/users/:id (Post-eliminar) debe retornar HTTP 404 al consultar el ID eliminado', async () => {
      const response = await request
        .get(`/api/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
    });
  });
});
