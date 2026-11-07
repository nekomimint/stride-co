const request = require('supertest');
const { app } = require('./helpers');

describe('Health Check (E2E)', () => {
  it('GET /health debe retornar HTTP 200 y { status: "UP" }', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toEqual({ status: 'UP' });
  });

  it('GET /api/health debe retornar HTTP 200 y { status: "UP" }', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    expect(response.body).toEqual({ status: 'UP' });
  });
});
