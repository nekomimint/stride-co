const mongoose = require('mongoose');
const { request, login } = require('./helpers');
const connectMongo = require('../../config/mongoose');
const { Order, Customer } = require('../../models/documents');
const { sequelize } = require('../../models/relationals');

jest.setTimeout(30000);

describe('Orders Resource & Scope Access Control (E2E)', () => {
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
  let testCustomer;
  let createdOrderId;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await connectMongo();
    }
    adminToken = await login(adminCredentials.email, adminCredentials.password);
    userToken = await login(userCredentials.email, userCredentials.password);

    testCustomer = await Customer.findOne({});
    if (!testCustomer) {
      testCustomer = await Customer.create({
        userId: 1,
        phone: '6141234567',
        email: 'test.order.customer@example.com',
        addresses: [
          {
            type: 'SHIPPING',
            street: 'Av. Principal',
            number: '123',
            city: 'Chihuahua',
            state: 'Chihuahua',
            zipCode: '31000',
            country: 'Mexico',
          },
        ],
      });
    }
  });

  afterAll(async () => {
    if (createdOrderId) {
      try {
        await Order.findByIdAndDelete(createdOrderId);
      } catch (err) {
        // Ignorar si ya fue eliminado
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
    it('GET /api/orders (Listado global) debe responder 403 Forbidden con token de User', async () => {
      const response = await request
        .get('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
    });

    it('GET /api/orders/:id (Orden Ajena) debe responder 403 Forbidden cuando pertenece a otro usuario', async () => {
      const alienCustomer = await Customer.create({
        userId: 99999,
        phone: '6149999999',
        email: 'alien.order.user@example.com',
      });

      const alienOrder = await Order.create({
        customerId: alienCustomer._id,
        totals: { subtotal: 50, shipping: 10, discount: 0, total: 60 },
      });

      try {
        const response = await request
          .get(`/api/orders/${alienOrder._id}`)
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);

        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty('message');
      } finally {
        await Order.findByIdAndDelete(alienOrder._id);
        await Customer.findByIdAndDelete(alienCustomer._id);
      }
    });
  });

  describe('Ciclo Completo de Órdenes (Con Token Válido/Admin)', () => {
    it('POST /api/orders debe crear una orden y retornar HTTP 201', async () => {
      const orderPayload = {
        customerId: testCustomer._id,
        paymentMethod: 'card',
        totals: { subtotal: 100, shipping: 10, discount: 0, total: 110 },
        shippingAddress: {
          street: 'Av. Principal',
          number: '123',
          city: 'Chihuahua',
          state: 'Chihuahua',
          postalCode: '31000',
          country: 'Mexico',
        },
        items: [{ productId: 1, quantity: 1, unitPrice: 100 }],
      };

      const response = await request
        .post('/api/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(orderPayload)
        .expect(201);

      expect(response.body).toHaveProperty('data._id');
      createdOrderId = response.body.data._id;
    });

    it('GET /api/orders debe consultar el listado de órdenes y retornar HTTP 200 con un arreglo', async () => {
      const response = await request
        .get('/api/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('GET /api/orders/:id debe consultar la orden creada por su _id y retornar HTTP 200', async () => {
      const response = await request
        .get(`/api/orders/${createdOrderId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data._id).toBe(createdOrderId);
    });

    it('GET /api/orders/650c1f1e1c9d440000000000 debe consultar un ObjectId inexistente y retornar HTTP 404', async () => {
      const response = await request
        .get('/api/orders/650c1f1e1c9d440000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
    });

    it('PUT /api/orders/:id debe actualizar la orden y retornar HTTP 200 (orderUpdated)', async () => {
      const updatePayload = {
        status: 'completed',
      };

      const response = await request
        .put(`/api/orders/${createdOrderId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatePayload)
        .expect(200);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
    });
  });
});
