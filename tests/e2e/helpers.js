const request = require('supertest');
const app = require('../../app');

// Cliente Supertest envolviendo directamente la instancia de Express
const api = request(app);

/**
 * Función asíncrona para iniciar sesión y retornar el token JWT
 * @param {string} email
 * @param {string} password
 * @returns {Promise<string>} token
 */
const login = async (email, password) => {
  const response = await api
    .post('/api/auth/login')
    .send({ email, password });

  return response.body?.data?.token;
};

module.exports = {
  app,
  request: api,
  api,
  login,
  baseURL: app,
};
