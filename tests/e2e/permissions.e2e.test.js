const { request, login } = require('./helpers');
const { Permission, sequelize } = require('../../models/relationals');

jest.setTimeout(30000);

describe('Permissions Resource & RBAC Control (E2E)', () => {
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
  let createdPermissionId;
  const permissionKey = 'e2e_test:resource:action';
  const permissionKeyUpdated = 'e2e_test:resource:action_updated';

  beforeAll(async () => {
    adminToken = await login(adminCredentials.email, adminCredentials.password);
    userToken = await login(userCredentials.email, userCredentials.password);

    try {
      await Permission.destroy({ where: { key: permissionKey } });
      await Permission.destroy({ where: { key: permissionKeyUpdated } });
    } catch (err) {
      // Ignorar si no existen previamente
    }
  });

  afterAll(async () => {
    if (createdPermissionId) {
      try {
        await Permission.destroy({ where: { id: createdPermissionId } });
      } catch (err) {
        // Ignorar si ya fue eliminado en la prueba
      }
    }

    try {
      await Permission.destroy({ where: { key: permissionKey } });
      await Permission.destroy({ where: { key: permissionKeyUpdated } });
    } catch (err) {
      // Ignorar
    }

    if (sequelize && typeof sequelize.close === 'function') {
      await sequelize.close();
    }
  });

  describe('Autenticación y Control de Acceso (Token & RBAC Verification)', () => {
    it('GET /api/permissions debe responder 401 Unauthorized sin token', async () => {
      const response = await request
        .get('/api/permissions')
        .expect(401);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    it('POST /api/permissions debe responder 401 Unauthorized sin token', async () => {
      const response = await request
        .post('/api/permissions')
        .send({
          key: 'unauthenticated:test',
          description: 'Intento sin token',
        })
        .expect(401);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    it('GET /api/permissions debe responder 403 Forbidden con token de usuario restringido', async () => {
      const response = await request
        .get('/api/permissions')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
    });

    it('POST /api/permissions debe responder 403 Forbidden con token de usuario restringido', async () => {
      const response = await request
        .post('/api/permissions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          key: 'unauthorized:permission',
          description: 'Intento de creacion sin rol admin',
        })
        .expect(403);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
    });

    it('GET /api/permissions/1 debe responder 403 Forbidden con token de usuario restringido', async () => {
      const response = await request
        .get('/api/permissions/1')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
    });

    it('PUT /api/permissions/1 debe responder 403 Forbidden con token de usuario restringido', async () => {
      const response = await request
        .put('/api/permissions/1')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          description: 'Modificacion no permitida',
        })
        .expect(403);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
    });

    it('DELETE /api/permissions/1 debe responder 403 Forbidden con token de usuario restringido', async () => {
      const response = await request
        .delete('/api/permissions/1')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Ciclo CRUD Completo (Con Token Admin)', () => {
    it('POST /api/permissions debe crear un nuevo permiso y retornar HTTP 201', async () => {
      const permissionPayload = {
        key: permissionKey,
        description: 'Permiso creado durante pruebas E2E',
      };

      const response = await request
        .post('/api/permissions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(permissionPayload)
        .expect(201);

      expect(response.body).toHaveProperty('data.id');
      expect(response.body.data.key).toBe(permissionPayload.key);
      expect(response.body.data.description).toBe(permissionPayload.description);
      createdPermissionId = response.body.data.id;
    });

    it('GET /api/permissions debe listar todos los permisos y retornar HTTP 200', async () => {
      const response = await request
        .get('/api/permissions')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data.some((perm) => perm.id === createdPermissionId)).toBe(true);
    });

    it('GET /api/permissions/:id debe consultar el permiso por su id y retornar HTTP 200', async () => {
      const response = await request
        .get(`/api/permissions/${createdPermissionId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.id).toBe(createdPermissionId);
      expect(response.body.data.key).toBe(permissionKey);
    });

    it('GET /api/permissions/999999 debe consultar un ID inexistente y retornar HTTP 404', async () => {
      const response = await request
        .get('/api/permissions/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
    });

    it('PUT /api/permissions/:id debe actualizar el permiso y retornar HTTP 200', async () => {
      const updatePayload = {
        key: permissionKeyUpdated,
        description: 'Descripcion actualizada E2E',
      };

      const response = await request
        .put(`/api/permissions/${createdPermissionId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatePayload)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.id).toBe(createdPermissionId);
      expect(response.body.data.key).toBe(updatePayload.key);
      expect(response.body.data.description).toBe(updatePayload.description);
    });

    it('PUT /api/permissions/999999 debe retornar HTTP 404 al intentar actualizar un ID inexistente', async () => {
      const response = await request
        .put('/api/permissions/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          description: 'No deberia actualizarse',
        })
        .expect(404);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
    });

    it('DELETE /api/permissions/:id debe eliminar el permiso y retornar HTTP 200', async () => {
      const response = await request
        .delete(`/api/permissions/${createdPermissionId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('DELETE /api/permissions/999999 debe retornar HTTP 404 al intentar eliminar un ID inexistente', async () => {
      const response = await request
        .delete('/api/permissions/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
    });

    it('GET /api/permissions/:id (Post-eliminar) debe retornar HTTP 404 al consultar el ID eliminado', async () => {
      const response = await request
        .get(`/api/permissions/${createdPermissionId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
    });
  });
});
