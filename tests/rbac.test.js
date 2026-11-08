/* global describe, test, expect, jest, beforeEach, afterEach */

// Mock de los modelos de Sequelize para roles y permisos
jest.mock('../models/relationals', () => {
  const roles = [
    { name: 'ADMIN', permissions: [{ key: 'orders:delete:any' }, { key: 'orders:read:any' }] },
    { name: 'SALES', permissions: [{ key: 'orders:read:any' }] },
    { name: 'USER', permissions: [{ key: 'orders:read:own' }] }
  ];
  return {
    Role: {
      findAll: jest.fn().mockResolvedValue(
        roles.map((r) => ({ toJSON: () => r }))
      )
    },
    Permission: {}
  };
});

// Mock de los modelos de Mongoose para documentos (Order y Customer)
jest.mock('../models/documents', () => ({
  Order: {
    findByPk: jest.fn(),
    findById: jest.fn()
  },
  Customer: {
    findOne: jest.fn()
  }
}));

describe('Pruebas Unitarias de Control de Acceso RBAC (tests/rbac.test.js)', () => {
  let authorize, ordersController, Order, Customer, req, res, next, logSpy;

  beforeEach(() => {
    jest.resetModules();
    authorize = require('../middlewares/authorize');
    ordersController = require('../controllers/orders');
    Order = require('../models/documents').Order;
    Customer = require('../models/documents').Customer;

    req = { 
      params: {}, 
      body: {}, 
      user: {}, 
      __: (key) => key // Mock básico para i18n
    };
    res = { 
      status: jest.fn().mockReturnThis(), 
      json: jest.fn() 
    };
    next = jest.fn();

    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    jest.restoreAllMocks();
  });

  test('1. Acceso permitido (ADMIN -> orders:delete:any)', async () => {
    req.user = { role: 'ADMIN' };

    await authorize('orders', 'delete', 'any')(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('2. Acceso denegado (SALES -> orders:delete:any)', async () => {
    req.user = { role: 'SALES' };

    await authorize('orders', 'delete', 'any')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('3. Recurso propio (USER -> orders:read:own)', async () => {
    req.user = { id: 7, role: 'USER' };

    await authorize('orders', 'read', 'own')(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.canAny).toBe(false);
  });

  test('4. Recurso de otro usuario (USER intenta leer orden ajena)', async () => {
    const customReq = {
      user: { id: 7, role: 'USER' },
      auth: { sub: 'customer-id-7' },
      params: { id: '1' },
      __: jest.fn().mockReturnValue('Order not in user')
    };

    const customRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    const customNext = jest.fn();

    // Ejecutar el middleware authorize
    await authorize('orders', 'read', 'own')(customReq, customRes, customNext);

    // Mocks de la orden ajena y del cliente actual
    Order.findById.mockResolvedValue({ id: 1, customerId: 'customer-id-99' });
    Customer.findOne.mockResolvedValue({ _id: 'customer-id-7' });

    // Ejecutar la función del controlador
    await ordersController.find(customReq, customRes, customNext);

    // Validar respuesta 403 Forbidden
    expect(customRes.status).toHaveBeenCalledWith(403);
    expect(customRes.json).toHaveBeenCalledWith({ message: 'Order not in user' });
  });

  test('5. Permiso any no asignado (USER -> orders:read:any)', async () => {
    req.user = { role: 'USER' };

    await authorize('orders', 'read', 'any')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});