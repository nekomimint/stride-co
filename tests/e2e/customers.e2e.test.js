const mongoose = require('mongoose');
const { request, login } = require('./helpers');
const connectMongo = require('../../config/mongoose');
const { Customer } = require('../../models/documents');
const { sequelize } = require('../../models/relationals');

jest.setTimeout(30000);

describe('Customers Resource & Scope Access Control (E2E)', () => {
  const adminCredentials = {
    email: process.env.ADMIN_EMAIL || 'jesus@gmail.com',
    password: process.env.ADMIN_PASSWORD || 'admin123',
  };

  const restrictedCredentials = {
    email: process.env.RESTRICTED_EMAIL || 'sofia@gmail.com',
    password: process.env.RESTRICTED_PASSWORD || 'usuario123',
  };

  let adminToken;
  let restrictedToken;
  let createdCustomerId;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await connectMongo();
    }
    adminToken = await login(adminCredentials.email, adminCredentials.password);
    restrictedToken = await login(restrictedCredentials.email, restrictedCredentials.password);
  });

  afterAll(async () => {
    if (createdCustomerId) {
      try {
        await Customer.findByIdAndDelete(createdCustomerId);
      } catch (err) {
        // Ignorar si ya fue eliminado en la prueba de DELETE
      }
    }

    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    if (sequelize && typeof sequelize.close === 'function') {
      await sequelize.close();
    }
  });

  describe('Control de Acceso (RBAC & Alcance own/any)', () => {
    it('POST /api/customers debe responder 403 Forbidden con token restringido (sin permiso any)', async () => {
      const response = await request
        .post('/api/customers')
        .set('Authorization', `Bearer ${restrictedToken}`)
        .send({
          phone: '6140000000',
          email: 'no.autorizado@example.com',
        })
        .expect(403);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
    });

    it('GET /api/customers debe responder 403 Forbidden con token restringido', async () => {
      const response = await request
        .get('/api/customers')
        .set('Authorization', `Bearer ${restrictedToken}`)
        .expect(403);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
    });

    it('DELETE /api/customers/:id debe responder 403 Forbidden con token restringido', async () => {
      const response = await request
        .delete('/api/customers/650c1f1e1c9d440000000000')
        .set('Authorization', `Bearer ${restrictedToken}`)
        .expect(403);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
    });

    it('GET /api/customers/:id (Cliente Ajeno) debe responder 403 Forbidden al consultar un cliente ajeno', async () => {
      const alienCustomer = await Customer.create({
        userId: 99999,
        phone: '6141112233',
        email: 'ajeno@example.com',
        addresses: [
          {
            type: 'SHIPPING',
            street: 'Calle Ajena',
            number: '123',
            city: 'Chihuahua',
            state: 'Chihuahua',
            zipCode: '31000',
            country: 'Mexico',
          },
        ],
      });

      try {
        const response = await request
          .get(`/api/customers/${alienCustomer._id}`)
          .set('Authorization', `Bearer ${restrictedToken}`)
          .expect(403);

        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty('message');
      } finally {
        await Customer.findByIdAndDelete(alienCustomer._id);
      }
    });
  });

  describe('Ciclo CRUD Completo (Con Token Admin)', () => {
    it('POST /api/customers debe crear un cliente y retornar HTTP 201', async () => {
      const customerData = {
        userId: 999,
        phone: '6141234567',
        email: 'cliente.e2e@example.com',
        addresses: [
          {
            type: 'SHIPPING',
            street: 'Av. Universidad',
            number: '100',
            city: 'Chihuahua',
            state: 'Chihuahua',
            postalCode: '31000',
            country: 'Mexico',
          },
        ],
      };

      const response = await request
        .post('/api/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(customerData)
        .expect(201);

      expect(response.body).toHaveProperty('data._id');
      expect(response.body.data.email).toBe(customerData.email);
      createdCustomerId = response.body.data._id;
    });

    it('GET /api/customers debe listar todos los clientes y retornar HTTP 200 con un arreglo', async () => {
      const response = await request
        .get('/api/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('GET /api/customers/:id debe consultar el cliente creado por su _id y retornar HTTP 200', async () => {
      const response = await request
        .get(`/api/customers/${createdCustomerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data._id).toBe(createdCustomerId);
      expect(response.body.data.phone).toBe('6141234567');
    });

    it('GET /api/customers/650c1f1e1c9d440000000000 debe consultar un ObjectId inexistente y retornar HTTP 404', async () => {
      const response = await request
        .get('/api/customers/650c1f1e1c9d440000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
    });

    it('PUT /api/customers/:id debe actualizar datos del cliente y retornar HTTP 200', async () => {
      const updateData = {
        phone: '6149876543',
      };

      const response = await request
        .put(`/api/customers/${createdCustomerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.phone).toBe(updateData.phone);
    });

    it('DELETE /api/customers/:id debe eliminar el cliente creado y retornar HTTP 200', async () => {
      const response = await request
        .delete(`/api/customers/${createdCustomerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });

    it('GET /api/customers/:id (Post-eliminar) debe retornar HTTP 404 al buscar el ID eliminado', async () => {
      const response = await request
        .get(`/api/customers/${createdCustomerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
    });
  });
});
