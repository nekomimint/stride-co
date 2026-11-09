const supertest = require('supertest');
const app = require('../../app');

// Proxy que permite usar request directamente (request.get, request.post)
// o como función envolvente (request(app).get, request(app).post)
const request = new Proxy(supertest, {
  get(target, prop) {
    if (prop in target) {
      return target[prop];
    }
    const agent = supertest(app);
    return typeof agent[prop] === 'function' ? agent[prop].bind(agent) : agent[prop];
  },
  apply(target, thisArg, argArray) {
    return target(...argArray);
  },
});

/**
 * Función asíncrona para iniciar sesión y retornar el token JWT
 * @param {string} email
 * @param {string} password
 * @returns {Promise<string>} token
 */
const login = async (email, password) => {
  const response = await supertest(app)
    .post('/api/auth/login')
    .send({ email, password });

  return response.body?.data?.token;
};

module.exports = {
  app,
  request,
  api: request,
  login,
  baseURL: app,
};
