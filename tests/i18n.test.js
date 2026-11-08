/* global describe, test, expect, jest */
const path = require('path');
const fs = require('fs');
const pug = require('pug');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const config = require('config');
const i18n = require('../config/i18n');
const app = require('../app');

jest.setTimeout(40000);

function getNestedKeys(obj, prefix = '') {
  let keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys = keys.concat(getNestedKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

function createMockContext(options = {}) {
  let url = options.url || '/';
  if (options.query && Object.keys(options.query).length > 0) {
    const params = new URLSearchParams(options.query).toString();
    url += (url.includes('?') ? '&' : '?') + params;
  }

  const req = {
    url,
    headers: options.headers || {},
    cookies: options.cookies || {},
    query: options.query || {},
    params: options.params || {},
    body: options.body || {}
  };
  const res = {
    locals: {},
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    render: jest.fn().mockReturnThis()
  };

  i18n.init(req, res);
  return { req, res };
}

describe('Pruebas de Internacionalización (i18n)', () => {

  describe('Archivos de localización (en.json y es.json)', () => {
    const enPath = path.join(__dirname, '..', 'locales', 'en.json');
    const esPath = path.join(__dirname, '..', 'locales', 'es.json');

    test('ambos archivos deben existir y contener JSON válido', () => {
      expect(fs.existsSync(enPath)).toBe(true);
      expect(fs.existsSync(esPath)).toBe(true);

      const enRaw = fs.readFileSync(enPath, 'utf8');
      const esRaw = fs.readFileSync(esPath, 'utf8');

      expect(() => JSON.parse(enRaw)).not.toThrow();
      expect(() => JSON.parse(esRaw)).not.toThrow();
    });

    test('debe existir paridad total de claves entre en.json y es.json', () => {
      const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
      const esData = JSON.parse(fs.readFileSync(esPath, 'utf8'));

      const enKeys = getNestedKeys(enData).sort();
      const esKeys = getNestedKeys(esData).sort();

      expect(enKeys).toEqual(esKeys);
      expect(enKeys.length).toBeGreaterThan(0);
    });
  });

  describe('Configuración y detección de idioma en el middleware', () => {
    test('debe usar "en" como idioma por defecto cuando no se especifica preferencia', () => {
      const { req } = createMockContext();
      expect(req.getLocale()).toBe('en');
    });

    test('debe detectar idioma mediante query parameter (?lang=es)', () => {
      const { req } = createMockContext({ query: { lang: 'es' } });
      expect(req.getLocale()).toBe('es');
      expect(req.__('index.apiWorking')).toBe('API funcionando');
    });

    test('debe detectar idioma mediante header Accept-Language', () => {
      const { req } = createMockContext({ headers: { 'accept-language': 'es' } });
      expect(req.getLocale()).toBe('es');
      expect(req.__('index.apiWorking')).toBe('API funcionando');
    });
  });

  describe('Pruebas de integración HTTP sobre la API Express (usando Supertest)', () => {
    const secretKey = config.has('jwt.secret') ? config.get('jwt.secret') : (process.env.SECRET_KEY || 'LAPATATAPATA');
    const token = jwt.sign({ sub: 1, id: 1, role: 'admin' }, secretKey, { algorithm: 'HS256' });

    test('GET /?lang=en devuelve mensaje traducido en inglés (200)', async () => {
      const res = await request(app)
        .get('/?lang=en')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'API working' });
    });

    test('GET /?lang=es devuelve mensaje traducido en español (200)', async () => {
      const res = await request(app)
        .get('/?lang=es')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'API funcionando' });
    });

    test('Petición a ruta inexistente /ruta-inexistente?lang=es devuelve error 404 en JSON traducido al español', async () => {
      const res = await request(app)
        .get('/ruta-inexistente?lang=es')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'No encontrado');
    });
  });
});