const request = require('supertest');

const baseURL = process.env.E2E_BASE_URL || 'http://127.0.0.1:3000';

const login = async (email, password) => {
  const response = await request(baseURL)
    .post('/api/auth/login')
    .send({ email, password });

  return response.body.data.token;
};

module.exports = {
  baseURL,
  login,
};                  