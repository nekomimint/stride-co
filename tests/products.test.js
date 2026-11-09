/* global describe, test, expect, jest, afterEach, beforeAll */
const request = require('supertest');
const app = require('../app');
const Product = require('../models/relationals/Product');
const jwt = require('jsonwebtoken');
const config = require('config');

// Subimos el timeout a 40 segundos para llamadas con latencia de red
jest.setTimeout(40000);

const secretKey = config.has('jwt.secret') ? config.get('jwt.secret') : (process.env.SECRET_KEY || 'LAPATATAPATA');
const mockAdminToken = jwt.sign(
  { 
    sub: 1, 
    id: 1, 
    user: 'adminUser', 
    role: 'admin', 
    permissions: ['products:read:any', 'products:create:any', 'products:update:any', 'products:delete:any'] 
  },
  secretKey,
  { algorithm: 'HS256' }
);

describe('Suite de Productos con Mocks (Sequelize)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('POST /api/products debe crear un producto simulando Sequelize (201)', async () => {
    const newProduct = { id: 1, name: 'Tenis Nike Air', price: 2500, category_id: 1 };
    jest.spyOn(Product, 'create').mockResolvedValue(newProduct);

    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${mockAdminToken}`)
      .send({ name: 'Tenis Nike Air', price: 2500, category_id: 1 });

    expect(res.statusCode).toBe(201);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.name).toBe('Tenis Nike Air');
  });

  test('GET /api/products debe listar todos los productos con sus variantes (200)', async () => {
    const mockProductsList = [
      { id: 1, name: 'Tenis Nike Air', price: 2500, variants: [] },
      { id: 2, name: 'Tenis Adidas', price: 2200, variants: [] }
    ];
    jest.spyOn(Product, 'findAll').mockResolvedValue(mockProductsList);

    const res = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${mockAdminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeDefined();
  });

  test('GET /api/products/:id debe retornar un producto por su PK (200)', async () => {
    const mockProduct = { id: 1, name: 'Tenis Nike Air', price: 2500 };
    jest.spyOn(Product, 'findByPk').mockResolvedValue(mockProduct);

    const res = await request(app)
      .get('/api/products/1')
      .set('Authorization', `Bearer ${mockAdminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.id).toBe(1);
  });

  test('GET /api/products/:id debe retornar 404 si el producto no existe', async () => {
    jest.spyOn(Product, 'findByPk').mockResolvedValue(null);

    const res = await request(app)
      .get('/api/products/999')
      .set('Authorization', `Bearer ${mockAdminToken}`);

    expect(res.statusCode).toBe(404);
  });

  test('PUT /api/products/:id debe actualizar un producto existente (200)', async () => {
    const mockProductInstance = {
      id: 1,
      name: 'Tenis Nike Air',
      price: 2500,
      update: jest.fn().mockResolvedValue({ id: 1, name: 'Tenis Nike Air Max Plus', price: 2500 })
    };
    jest.spyOn(Product, 'findByPk').mockResolvedValue(mockProductInstance);

    const res = await request(app)
      .put('/api/products/1')
      .set('Authorization', `Bearer ${mockAdminToken}`)
      .send({ name: 'Tenis Nike Air Max Plus' });

    expect(res.statusCode).toBe(200);
  });

  test('DELETE /api/products/:id debe eliminar un producto (200)', async () => {
    const mockProductInstance = {
      id: 1,
      name: 'Tenis Nike Air',
      destroy: jest.fn().mockResolvedValue(true)
    };
    jest.spyOn(Product, 'findByPk').mockResolvedValue(mockProductInstance);

    const res = await request(app)
      .delete('/api/products/1')
      .set('Authorization', `Bearer ${mockAdminToken}`);

    expect(res.statusCode).toBe(200);
  });
});