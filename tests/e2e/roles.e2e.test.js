const { request, login } = require('./helpers');
const { Role, sequelize } = require('../../models/relationals');

jest.setTimeout(30000);

describe('Roles Resource & RBAC Control (E2E)', () => {
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
  let createdRoleId;
  const roleName = 'e2e_tester_role';
  const roleNameUpdated = 'e2e_tester_role_updated';

  beforeAll(async () => {
    adminToken = await login(adminCredentials.email, adminCredentials.password);
    userToken = await login(userCredentials.email, userCredentials.password);

    try {
      await Role.destroy({ where: { name: roleName } });
      await Role.destroy({ where: { name: roleNameUpdated } });
    } catch (err) {
      // Ignorar si no existen
    }
  });

  afterAll(async () => {
    if (createdRoleId) {
      try {
        await Role.destroy({ where: { id: createdRoleId } });
      } catch (err) {
        // Ignorar si ya fue eliminado en la prueba
      }
    }

    if (sequelize && typeof sequelize.close === 'function') {
      await sequelize.close();
    }
  });

  describe('Control de Acceso (RBAC Verification)', () => {
    it('GET /api/roles debe responder 403 Forbidden con token de usuario restringido', async () => {
      const response = await request
        .get('/api/roles')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
    });

    it('POST /api/roles debe responder 403 Forbidden con token de usuario restringido', async () => {
      const response = await request
        .post('/api/roles')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'unauthorized_role',
          description: 'Intento de creacion sin permisos',
        })
        .expect(403);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
    });

    it('GET /api/roles/1 debe responder 403 Forbidden con token de usuario restringido', async () => {
      const response = await request
        .get('/api/roles/1')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
    });

    it('PUT /api/roles/1 debe responder 403 Forbidden con token de usuario restringido', async () => {
      const response = await request
        .put('/api/roles/1')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'modified_role',
        })
        .expect(403);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
    });

    it('DELETE /api/roles/1 debe responder 403 Forbidden con token de usuario restringido', async () => {
      const response = await request
        .delete('/api/roles/1')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Ciclo CRUD Completo (Con Token Admin)', () => {
    it('POST /api/roles debe crear un nuevo rol y retornar HTTP 201', async () => {
      const rolePayload = {
        name: roleName,
        description: 'Rol creado durante pruebas E2E',
      };

      const response = await request
        .post('/api/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(rolePayload)
        .expect(201);

      expect(response.body).toHaveProperty('data.id');
      expect(response.body.data.name).toBe(rolePayload.name);
      createdRoleId = response.body.data.id;
    });

    it('GET /api/roles debe listar todos los roles y retornar HTTP 200 con permisos incluidos', async () => {
      const response = await request
        .get('/api/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('permissions');
    });

    it('GET /api/roles/:id debe consultar el rol por su id y retornar HTTP 200', async () => {
      const response = await request
        .get(`/api/roles/${createdRoleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.id).toBe(createdRoleId);
      expect(response.body.data.name).toBe(roleName);
    });

    it('GET /api/roles/999999 debe consultar un ID inexistente y retornar HTTP 404', async () => {
      const response = await request
        .get('/api/roles/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
    });

    it('PUT /api/roles/:id debe actualizar el rol y retornar HTTP 200', async () => {
      const updatePayload = {
        name: roleNameUpdated,
      };

      const response = await request
        .put(`/api/roles/${createdRoleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatePayload)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.name).toBe(updatePayload.name);
    });

    it('DELETE /api/roles/:id debe eliminar el rol y retornar HTTP 200', async () => {
      const response = await request
        .delete(`/api/roles/${createdRoleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('GET /api/roles/:id (Post-eliminar) debe retornar HTTP 404 al consultar el ID eliminado', async () => {
      const response = await request
        .get(`/api/roles/${createdRoleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
    });
  });
});
