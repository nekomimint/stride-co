const mongoose = require('mongoose');
const { request, login } = require('./helpers');
const connectMongo = require('../../config/mongoose');
const {
  User,
  Role,
  Permission,
  Product,
  ProductVariant,
  Inventory,
  sequelize,
} = require('../../models/relationals');
const { Customer, Order } = require('../../models/documents');

jest.setTimeout(40000);

describe('Control de Acceso Basado en Roles (RBAC) E2E Tests (tests/e2e/rbac.js)', () => {
  // Credenciales tomadas directamente de seed.js
  const credentials = {
    admin: {
      email: process.env.ADMIN_EMAIL || 'jesus@gmail.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
    },
    sales: {
      email: process.env.SALES_EMAIL || 'dany@gmail.com',
      password: process.env.SALES_PASSWORD || 'sales123',
    },
    user: {
      email: process.env.USER_EMAIL || 'sofia@gmail.com',
      password: process.env.USER_PASSWORD || 'usuario123',
    },
  };

  const tokens = {
    admin: null,
    sales: null,
    user: null,
  };

  const userIds = {
    admin: null,
    sales: null,
    user: null,
  };

  // Fixtures para pruebas
  let existingProductId = 1;
  let existingVariantId = 1;
  let existingInventoryId = 1;
  let existingRoleId = 1;
  let existingPermissionId = 1;

  let sofiaCustomer = null;
  let sofiaOrder = null;
  let adminCustomer = null;
  let adminOrder = null;

  beforeAll(async () => {
    // 1. Conexión a MongoDB si no está activa
    if (mongoose.connection.readyState === 0) {
      await connectMongo();
    }

    // 2. Obtener tokens JWT para cada rol usando el helper de autenticación
    tokens.admin = await login(credentials.admin.email, credentials.admin.password);
    tokens.sales = await login(credentials.sales.email, credentials.sales.password);
    tokens.user = await login(credentials.user.email, credentials.user.password);

    // 3. Obtener identificadores relacionales de los usuarios sembrados
    const adminUser = await User.findOne({ where: { email: credentials.admin.email } });
    const salesUser = await User.findOne({ where: { email: credentials.sales.email } });
    const regularUser = await User.findOne({ where: { email: credentials.user.email } });

    userIds.admin = adminUser?.id || 1;
    userIds.sales = salesUser?.id || 2;
    userIds.user = regularUser?.id || 3;

    // 4. Obtener identificadores de entidades existentes del catálogo
    const product = await Product.findOne();
    if (product) existingProductId = product.id;

    const variant = await ProductVariant.findOne();
    if (variant) existingVariantId = variant.id;

    const inventory = await Inventory.findOne();
    if (inventory) existingInventoryId = inventory.id;

    const role = await Role.findOne();
    if (role) existingRoleId = role.id;

    const permission = await Permission.findOne();
    if (permission) existingPermissionId = permission.id;

    // 5. Configurar Customer y Order de Sofia (rol: user)
    sofiaCustomer = await Customer.findOne({ userId: userIds.user });
    if (!sofiaCustomer) {
      sofiaCustomer = await Customer.create({
        userId: userIds.user,
        email: credentials.user.email,
        phone: '6141234567',
        addresses: [
          {
            type: 'SHIPPING',
            street: 'Av. Universidad',
            number: '120',
            city: 'Chihuahua',
            state: 'Chihuahua',
            zipCode: '31000',
            country: 'México',
          },
        ],
      });
    }

    sofiaOrder = await Order.findOne({ customerId: sofiaCustomer._id });
    if (!sofiaOrder) {
      sofiaOrder = await Order.create({
        customerId: sofiaCustomer._id,
        userId: String(userIds.user),
        totals: { subtotal: 2700, shipping: 100, discount: 0, total: 2800 },
      });
    }

    // 6. Configurar Customer y Order de Admin (para pruebas con alcance propio y validaciones cruzadas)
    adminCustomer = await Customer.findOne({ userId: userIds.admin });
    if (!adminCustomer) {
      adminCustomer = await Customer.create({
        userId: userIds.admin,
        email: 'admin.rbac.test@example.com',
        phone: '6149999999',
        addresses: [
          {
            type: 'SHIPPING',
            street: 'Av. De la Empresa',
            number: '500',
            city: 'Chihuahua',
            state: 'Chihuahua',
            zipCode: '31000',
            country: 'México',
          },
        ],
      });
    }

    adminOrder = await Order.findOne({ customerId: adminCustomer._id });
    if (!adminOrder) {
      adminOrder = await Order.create({
        customerId: adminCustomer._id,
        userId: String(userIds.admin),
        totals: { subtotal: 1000, shipping: 50, discount: 0, total: 1050 },
      });
    }
  });

  afterAll(async () => {
    // Limpieza de documentos auxiliares de prueba
    if (adminOrder?._id) {
      try {
        await Order.findByIdAndDelete(adminOrder._id);
      } catch (err) {
        // Ignorar si ya fue removido
      }
    }
    if (adminCustomer?._id) {
      try {
        await Customer.findByIdAndDelete(adminCustomer._id);
      } catch (err) {
        // Ignorar si ya fue removido
      }
    }

    // Cierre seguro de conexiones
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    if (sequelize && typeof sequelize.close === 'function') {
      await sequelize.close();
    }
  });

  // =========================================================================
  // 1. SOLICITUDES NO AUTENTICADAS (HTTP 401 UNAUTHORIZED)
  // =========================================================================
  describe('1. Acceso sin autenticación (debe retornar HTTP 401 Unauthorized)', () => {
    const protectedRoutes = [
      { method: 'get', url: '/api/products' },
      { method: 'post', url: '/api/products', body: { name: 'P' } },
      { method: 'get', url: '/api/variants' },
      { method: 'post', url: '/api/variants', body: { sku: 'V' } },
      { method: 'get', url: '/api/inventory' },
      { method: 'post', url: '/api/inventory', body: { stock: 10 } },
      { method: 'get', url: '/api/customers' },
      { method: 'post', url: '/api/customers', body: { email: 'x@x.com' } },
      { method: 'get', url: '/api/orders' },
      { method: 'post', url: '/api/orders', body: { totals: { total: 100 } } },
      { method: 'get', url: '/api/roles' },
      { method: 'post', url: '/api/roles', body: { name: 'R' } },
      { method: 'get', url: '/api/permissions' },
      { method: 'post', url: '/api/permissions', body: { key: 'K' } },
      { method: 'get', url: '/api/users' },
      { method: 'post', url: '/api/users', body: { email: 'u@u.com' } },
    ];

    test.each(protectedRoutes)(
      '$method.toUpperCase() $url responde 401 Unauthorized sin token JWT',
      async ({ method, url, body }) => {
        let req = request[method](url);
        if (body) req = req.send(body);
        const res = await req.expect(401);
        expect(res.status).toBe(401);
      }
    );
  });

  // =========================================================================
  // 2. ROL ADMINISTRADOR ('admin') - PERMISOS COMPLETOS ('*')
  // =========================================================================
  describe('2. Rol Admin: Acceso total autorizado según seed.js (HTTP 200/201)', () => {
    let createdProductId;
    let createdVariantId;
    let createdInventoryId;
    let createdRoleId;
    let createdPermissionId;
    let createdUserId;
    let createdCustomerId;
    let createdOrderId;

    // --- PRODUCTOS ---
    it('POST /api/products -> Admin puede crear productos (HTTP 201)', async () => {
      const res = await request
        .post('/api/products')
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send({
          name: `RBAC Admin Shoe ${Date.now()}`,
          description: 'Zapatilla creada en prueba RBAC',
          brand: 'Nike',
          price: 2500,
          category_id: 2,
        })
        .expect(201);

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('id');
      createdProductId = res.body.data.id;
    });

    it('GET /api/products -> Admin puede listar productos (HTTP 200)', async () => {
      const res = await request
        .get('/api/products')
        .set('Authorization', `Bearer ${tokens.admin}`)
        .expect(200);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('PUT /api/products/:id -> Admin puede actualizar productos (HTTP 200)', async () => {
      const res = await request
        .put(`/api/products/${createdProductId}`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send({ name: 'RBAC Admin Shoe Updated' })
        .expect(200);

      expect(res.status).toBe(200);
    });

    it('DELETE /api/products/:id -> Admin puede eliminar productos (HTTP 200)', async () => {
      const res = await request
        .delete(`/api/products/${createdProductId}`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .expect(200);

      expect(res.status).toBe(200);
    });

    // --- VARIANTES E INVENTARIO ---
    it('POST /api/variants -> Admin puede crear variantes (HTTP 201)', async () => {
      const res = await request
        .post('/api/variants')
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send({
          sku: `RBAC-ADM-VAR-${Date.now()}`,
          size: '27',
          color: 'Negro',
          product_id: existingProductId,
        })
        .expect(201);

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('id');
      createdVariantId = res.body.data.id;
    });

    it('GET /api/variants -> Admin puede listar variantes (HTTP 200)', async () => {
      const res = await request
        .get('/api/variants')
        .set('Authorization', `Bearer ${tokens.admin}`)
        .expect(200);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('POST /api/inventory -> Admin puede registrar inventario (HTTP 201)', async () => {
      const res = await request
        .post('/api/inventory')
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send({
          variant_id: createdVariantId,
          stock: 45,
          reserved: 0,
        })
        .expect(201);

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('id');
      createdInventoryId = res.body.data.id;
    });

    it('GET /api/inventory -> Admin puede consultar inventario (HTTP 200)', async () => {
      const res = await request
        .get('/api/inventory')
        .set('Authorization', `Bearer ${tokens.admin}`)
        .expect(200);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('PUT /api/inventory/:id -> Admin puede actualizar inventario (HTTP 200)', async () => {
      const res = await request
        .put(`/api/inventory/${createdInventoryId}`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send({ stock: 50, reserved: 5 })
        .expect(200);

      expect(res.status).toBe(200);
    });

    it('DELETE /api/inventory/:id -> Admin puede eliminar inventario (HTTP 200)', async () => {
      const res = await request
        .delete(`/api/inventory/${createdInventoryId}`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .expect(200);

      expect(res.status).toBe(200);
    });

    it('DELETE /api/variants/:id -> Admin puede eliminar variantes (HTTP 200)', async () => {
      const res = await request
        .delete(`/api/variants/${createdVariantId}`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .expect(200);

      expect(res.status).toBe(200);
    });

    // --- CLIENTES (CUSTOMERS) ---
    it('POST /api/customers -> Admin puede crear clientes (HTTP 201)', async () => {
      const res = await request
        .post('/api/customers')
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send({
          userId: userIds.admin,
          email: `admin.cust.${Date.now()}@example.com`,
          phone: '6145550001',
          addresses: [
            {
              type: 'SHIPPING',
              street: 'Calle Admin',
              number: '10',
              city: 'Chihuahua',
              state: 'Chihuahua',
              zipCode: '31000',
              country: 'México',
            },
          ],
        })
        .expect(201);

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('_id');
      createdCustomerId = res.body.data._id;
    });

    it('GET /api/customers -> Admin puede listar todos los clientes (HTTP 200)', async () => {
      const res = await request
        .get('/api/customers')
        .set('Authorization', `Bearer ${tokens.admin}`)
        .expect(200);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/customers/:id -> Admin puede consultar cualquier cliente por ID (HTTP 200)', async () => {
      const res = await request
        .get(`/api/customers/${createdCustomerId}`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .expect(200);

      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(createdCustomerId);
    });

    it('PUT /api/customers/:id -> Admin puede actualizar cualquier cliente (HTTP 200)', async () => {
      const res = await request
        .put(`/api/customers/${createdCustomerId}`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send({ phone: '6145559999' })
        .expect(200);

      expect(res.status).toBe(200);
    });

    it('DELETE /api/customers/:id -> Admin puede eliminar clientes (HTTP 200)', async () => {
      const res = await request
        .delete(`/api/customers/${createdCustomerId}`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .expect(200);

      expect(res.status).toBe(200);
    });

    // --- ÓRDENES ---
    it('POST /api/orders -> Admin puede crear órdenes (HTTP 201)', async () => {
      const res = await request
        .post('/api/orders')
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send({
          customerId: adminCustomer._id,
          totals: { subtotal: 1500, shipping: 100, discount: 0, total: 1600 },
        })
        .expect(201);

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('_id');
      createdOrderId = res.body.data._id;
    });

    it('GET /api/orders -> Admin puede listar todas las órdenes (HTTP 200)', async () => {
      const res = await request
        .get('/api/orders')
        .set('Authorization', `Bearer ${tokens.admin}`)
        .expect(200);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/orders/:id -> Admin puede consultar órdenes por ID (HTTP 200)', async () => {
      const res = await request
        .get(`/api/orders/${createdOrderId}`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .expect(200);

      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(createdOrderId);
    });

    it('PUT /api/orders/:id -> Admin puede actualizar órdenes (HTTP 200)', async () => {
      const res = await request
        .put(`/api/orders/${createdOrderId}`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send({ status: 'completed' })
        .expect(200);

      expect(res.status).toBe(200);
    });

    // --- ROLES Y PERMISOS ---
    it('POST /api/roles -> Admin puede crear roles (HTTP 201)', async () => {
      const res = await request
        .post('/api/roles')
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send({
          name: `rbac_role_${Date.now()}`,
          description: 'Rol creado en prueba RBAC',
        })
        .expect(201);

      expect(res.status).toBe(201);
      createdRoleId = res.body.data.id;
    });

    it('GET /api/roles -> Admin puede listar roles (HTTP 200)', async () => {
      const res = await request
        .get('/api/roles')
        .set('Authorization', `Bearer ${tokens.admin}`)
        .expect(200);

      expect(res.status).toBe(200);
    });

    it('DELETE /api/roles/:id -> Admin puede eliminar roles (HTTP 200)', async () => {
      const res = await request
        .delete(`/api/roles/${createdRoleId}`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .expect(200);

      expect(res.status).toBe(200);
    });

    it('POST /api/permissions -> Admin puede crear permisos (HTTP 201)', async () => {
      const res = await request
        .post('/api/permissions')
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send({
          key: `perm:test:${Date.now()}`,
          description: 'Permiso creado en prueba RBAC',
        })
        .expect(201);

      expect(res.status).toBe(201);
      createdPermissionId = res.body.data.id;
    });

    it('GET /api/permissions -> Admin puede listar permisos (HTTP 200)', async () => {
      const res = await request
        .get('/api/permissions')
        .set('Authorization', `Bearer ${tokens.admin}`)
        .expect(200);

      expect(res.status).toBe(200);
    });

    it('DELETE /api/permissions/:id -> Admin puede eliminar permisos (HTTP 200)', async () => {
      const res = await request
        .delete(`/api/permissions/${createdPermissionId}`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .expect(200);

      expect(res.status).toBe(200);
    });

    // --- USUARIOS ---
    it('POST /api/users -> Admin puede crear usuarios (HTTP 201)', async () => {
      const res = await request
        .post('/api/users')
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send({
          name: 'Usuario',
          lastName: 'Prueba Admin',
          email: `admin.user.${Date.now()}@example.com`,
          password: 'Password123!',
          roleId: userIds.user,
        })
        .expect(201);

      expect(res.status).toBe(201);
      createdUserId = res.body.data.id;
    });

    it('GET /api/users -> Admin puede listar usuarios (HTTP 200)', async () => {
      const res = await request
        .get('/api/users')
        .set('Authorization', `Bearer ${tokens.admin}`)
        .expect(200);

      expect(res.status).toBe(200);
    });

    it('GET /api/users/:id -> Admin puede consultar cualquier usuario por ID (HTTP 200)', async () => {
      const res = await request
        .get(`/api/users/${userIds.user}`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .expect(200);

      expect(res.status).toBe(200);
    });

    it('DELETE /api/users/:id -> Admin puede eliminar usuarios (HTTP 200)', async () => {
      const res = await request
        .delete(`/api/users/${createdUserId}`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .expect(200);

      expect(res.status).toBe(200);
    });

    afterAll(async () => {
      if (createdOrderId) {
        try {
          await Order.findByIdAndDelete(createdOrderId);
        } catch (err) {
          // Ignorar
        }
      }
    });
  });

  // =========================================================================
  // 3. ROL VENTAS ('sales') - ACCESOS PERMITIDOS Y DENEGADOS
  // =========================================================================
  describe('3. Rol Sales: Verificación de accesos permitidos y denegados según seed.js', () => {
    let salesOrderId;
    let salesCustomerId;

    // --- ACCESOS PERMITIDOS (HTTP 200 / 201) ---
    describe('3.1 Rutas autorizadas para Sales', () => {
      it('GET /api/products -> Sales tiene permiso products:read:any (HTTP 200)', async () => {
        const res = await request
          .get('/api/products')
          .set('Authorization', `Bearer ${tokens.sales}`)
          .expect(200);

        expect(res.status).toBe(200);
      });

      it('GET /api/variants -> Sales tiene permiso variants:read:any (HTTP 200)', async () => {
        const res = await request
          .get('/api/variants')
          .set('Authorization', `Bearer ${tokens.sales}`)
          .expect(200);

        expect(res.status).toBe(200);
      });

      it('GET /api/inventory -> Sales tiene permiso inventory:read:any (HTTP 200)', async () => {
        const res = await request
          .get('/api/inventory')
          .set('Authorization', `Bearer ${tokens.sales}`)
          .expect(200);

        expect(res.status).toBe(200);
      });

      it('GET /api/inventory/:id -> Sales puede consultar un registro de inventario (HTTP 200)', async () => {
        const res = await request
          .get(`/api/inventory/${existingInventoryId}`)
          .set('Authorization', `Bearer ${tokens.sales}`)
          .expect(200);

        expect(res.status).toBe(200);
      });

      it('POST /api/customers -> Sales tiene permiso customers:create:any (HTTP 201)', async () => {
        const res = await request
          .post('/api/customers')
          .set('Authorization', `Bearer ${tokens.sales}`)
          .send({
            userId: userIds.sales,
            email: `sales.cust.${Date.now()}@example.com`,
            phone: '6147778899',
            addresses: [
              {
                type: 'SHIPPING',
                street: 'Calle Sales',
                number: '20',
                city: 'Chihuahua',
                state: 'Chihuahua',
                zipCode: '31000',
                country: 'México',
              },
            ],
          })
          .expect(201);

        expect(res.status).toBe(201);
        salesCustomerId = res.body.data._id;
      });

      it('GET /api/customers -> Sales tiene permiso customers:read:any (HTTP 200)', async () => {
        const res = await request
          .get('/api/customers')
          .set('Authorization', `Bearer ${tokens.sales}`)
          .expect(200);

        expect(res.status).toBe(200);
      });

      it('GET /api/customers/:id -> Sales tiene permiso customers:read:own / canAny (HTTP 200)', async () => {
        const res = await request
          .get(`/api/customers/${salesCustomerId}`)
          .set('Authorization', `Bearer ${tokens.sales}`)
          .expect(200);

        expect(res.status).toBe(200);
      });

      it('PUT /api/customers/:id -> Sales tiene permiso customers:update:any (HTTP 200)', async () => {
        const res = await request
          .put(`/api/customers/${salesCustomerId}`)
          .set('Authorization', `Bearer ${tokens.sales}`)
          .send({ phone: '6147770000' })
          .expect(200);

        expect(res.status).toBe(200);
      });

      it('POST /api/orders -> Sales tiene permiso orders:create:any (HTTP 201)', async () => {
        const res = await request
          .post('/api/orders')
          .set('Authorization', `Bearer ${tokens.sales}`)
          .send({
            customerId: sofiaCustomer._id,
            totals: { subtotal: 1200, shipping: 80, discount: 0, total: 1280 },
          })
          .expect(201);

        expect(res.status).toBe(201);
        salesOrderId = res.body.data._id;
      });

      it('GET /api/orders -> Sales tiene permiso orders:read:any (HTTP 200)', async () => {
        const res = await request
          .get('/api/orders')
          .set('Authorization', `Bearer ${tokens.sales}`)
          .expect(200);

        expect(res.status).toBe(200);
      });

      it('GET /api/orders/:id -> Sales tiene permiso orders:read:any para consultar órdenes (HTTP 200)', async () => {
        const res = await request
          .get(`/api/orders/${salesOrderId}`)
          .set('Authorization', `Bearer ${tokens.sales}`)
          .expect(200);

        expect(res.status).toBe(200);
      });

      it('GET /api/users/:id (propio) -> Sales tiene permiso users:read:own (HTTP 200)', async () => {
        const res = await request
          .get(`/api/users/${userIds.sales}`)
          .set('Authorization', `Bearer ${tokens.sales}`)
          .expect(200);

        expect(res.status).toBe(200);
      });

      it('PUT /api/users/:id (propio) -> Sales tiene permiso users:update:own (HTTP 200)', async () => {
        const res = await request
          .put(`/api/users/${userIds.sales}`)
          .set('Authorization', `Bearer ${tokens.sales}`)
          .send({ name: 'Dany Updated' })
          .expect(200);

        expect(res.status).toBe(200);
      });
    });

    // --- ACCESOS DENEGADOS (HTTP 403 FORBIDDEN) ---
    describe('3.2 Rutas restringidas para Sales (HTTP 403 Forbidden)', () => {
      it('POST /api/products -> Sales NO tiene permiso products:create:any (HTTP 403)', async () => {
        const res = await request
          .post('/api/products')
          .set('Authorization', `Bearer ${tokens.sales}`)
          .send({ name: 'Unauthorized Shoe' })
          .expect(403);

        expect(res.status).toBe(403);
      });

      it('PUT /api/products/:id -> Sales NO tiene permiso products:update:any (HTTP 403)', async () => {
        const res = await request
          .put(`/api/products/${existingProductId}`)
          .set('Authorization', `Bearer ${tokens.sales}`)
          .send({ name: 'Unauthorized Update' })
          .expect(403);

        expect(res.status).toBe(403);
      });

      it('DELETE /api/products/:id -> Sales NO tiene permiso products:delete:any (HTTP 403)', async () => {
        const res = await request
          .delete(`/api/products/${existingProductId}`)
          .set('Authorization', `Bearer ${tokens.sales}`)
          .expect(403);

        expect(res.status).toBe(403);
      });

      it('POST /api/variants -> Sales NO tiene permiso variants:create:any (HTTP 403)', async () => {
        const res = await request
          .post('/api/variants')
          .set('Authorization', `Bearer ${tokens.sales}`)
          .send({ sku: `SALES-VAR-DENIED-${Date.now()}` })
          .expect(403);

        expect(res.status).toBe(403);
      });

      it('POST /api/inventory -> Sales NO tiene permiso inventory:create:any (HTTP 403)', async () => {
        const res = await request
          .post('/api/inventory')
          .set('Authorization', `Bearer ${tokens.sales}`)
          .send({ variant_id: existingVariantId, stock: 10 })
          .expect(403);

        expect(res.status).toBe(403);
      });

      it('PUT /api/inventory/:id -> Sales NO tiene permiso inventory:update:any (HTTP 403)', async () => {
        const res = await request
          .put(`/api/inventory/${existingInventoryId}`)
          .set('Authorization', `Bearer ${tokens.sales}`)
          .send({ stock: 999 })
          .expect(403);

        expect(res.status).toBe(403);
      });

      it('DELETE /api/inventory/:id -> Sales NO tiene permiso inventory:delete:any (HTTP 403)', async () => {
        const res = await request
          .delete(`/api/inventory/${existingInventoryId}`)
          .set('Authorization', `Bearer ${tokens.sales}`)
          .expect(403);

        expect(res.status).toBe(403);
      });

      it('DELETE /api/customers/:id -> Sales NO tiene permiso customers:delete:any (HTTP 403)', async () => {
        const res = await request
          .delete(`/api/customers/${salesCustomerId}`)
          .set('Authorization', `Bearer ${tokens.sales}`)
          .expect(403);

        expect(res.status).toBe(403);
      });

      it('GET /api/roles -> Sales NO puede acceder al recurso roles (HTTP 403)', async () => {
        const res = await request
          .get('/api/roles')
          .set('Authorization', `Bearer ${tokens.sales}`)
          .expect(403);

        expect(res.status).toBe(403);
      });

      it('POST /api/roles -> Sales NO puede crear roles (HTTP 403)', async () => {
        const res = await request
          .post('/api/roles')
          .set('Authorization', `Bearer ${tokens.sales}`)
          .send({ name: 'unauthorized_role' })
          .expect(403);

        expect(res.status).toBe(403);
      });

      it('GET /api/permissions -> Sales NO puede acceder al recurso permissions (HTTP 403)', async () => {
        const res = await request
          .get('/api/permissions')
          .set('Authorization', `Bearer ${tokens.sales}`)
          .expect(403);

        expect(res.status).toBe(403);
      });

      it('GET /api/users (Listado global) -> Sales NO tiene users:read:any (HTTP 403)', async () => {
        const res = await request
          .get('/api/users')
          .set('Authorization', `Bearer ${tokens.sales}`)
          .expect(403);

        expect(res.status).toBe(403);
      });

      it('POST /api/users -> Sales NO tiene permiso users:create:any (HTTP 403)', async () => {
        const res = await request
          .post('/api/users')
          .set('Authorization', `Bearer ${tokens.sales}`)
          .send({ email: 'sales.created@example.com' })
          .expect(403);

        expect(res.status).toBe(403);
      });

      it('DELETE /api/users/:id -> Sales NO tiene permiso users:delete:any (HTTP 403)', async () => {
        const res = await request
          .delete(`/api/users/${userIds.user}`)
          .set('Authorization', `Bearer ${tokens.sales}`)
          .expect(403);

        expect(res.status).toBe(403);
      });

      it('GET /api/users/:id (Usuario ajeno) -> Sales no puede ver perfil ajeno (HTTP 403)', async () => {
        const res = await request
          .get(`/api/users/${userIds.admin}`)
          .set('Authorization', `Bearer ${tokens.sales}`)
          .expect(403);

        expect(res.status).toBe(403);
      });

      it('PUT /api/users/:id (Usuario ajeno) -> Sales no puede modificar perfil ajeno (HTTP 403)', async () => {
        const res = await request
          .put(`/api/users/${userIds.admin}`)
          .set('Authorization', `Bearer ${tokens.sales}`)
          .send({ name: 'Attempt' })
          .expect(403);

        expect(res.status).toBe(403);
      });
    });

    afterAll(async () => {
      if (salesOrderId) {
        try {
          await Order.findByIdAndDelete(salesOrderId);
        } catch (err) {
          // Ignorar
        }
      }
      if (salesCustomerId) {
        try {
          await Customer.findByIdAndDelete(salesCustomerId);
        } catch (err) {
          // Ignorar
        }
      }
    });
  });

  // =========================================================================
  // 4. ROL USUARIO CLIENTE ('user') - ALCANCE PROPIO ('own') Y RESTRICCIONES
  // =========================================================================
  describe('4. Rol User: Verificación de permisos de alcance own y accesos denegados', () => {
    let createdUserOrderId;

    // --- ACCESOS PERMITIDOS (HTTP 200 / 201) ---
    describe('4.1 Rutas autorizadas para User', () => {
      it('GET /api/products -> User tiene permiso products:read:any (HTTP 200)', async () => {
        const res = await request
          .get('/api/products')
          .set('Authorization', `Bearer ${tokens.user}`)
          .expect(200);

        expect(res.status).toBe(200);
      });

      it('GET /api/products/:id -> User puede ver un producto específico (HTTP 200)', async () => {
        const res = await request
          .get(`/api/products/${existingProductId}`)
          .set('Authorization', `Bearer ${tokens.user}`)
          .expect(200);

        expect(res.status).toBe(200);
      });

      it('GET /api/variants -> User tiene permiso variants:read:any (HTTP 200)', async () => {
        const res = await request
          .get('/api/variants')
          .set('Authorization', `Bearer ${tokens.user}`)
          .expect(200);

        expect(res.status).toBe(200);
      });

      it('POST /api/orders -> User tiene permiso orders:create:own (HTTP 201)', async () => {
        const res = await request
          .post('/api/orders')
          .set('Authorization', `Bearer ${tokens.user}`)
          .send({
            customerId: sofiaCustomer._id,
            totals: { subtotal: 900, shipping: 50, discount: 0, total: 950 },
          })
          .expect(201);

        expect(res.status).toBe(201);
        createdUserOrderId = res.body.data._id;
      });

      it('GET /api/orders/:id (propia) -> User tiene permiso orders:read:own (HTTP 200)', async () => {
        const res = await request
          .get(`/api/orders/${sofiaOrder._id}`)
          .set('Authorization', `Bearer ${tokens.user}`)
          .expect(200);

        expect(res.status).toBe(200);
      });

      it('PUT /api/orders/:id (propia) -> User tiene permiso orders:update:own (HTTP 200)', async () => {
        const res = await request
          .put(`/api/orders/${sofiaOrder._id}`)
          .set('Authorization', `Bearer ${tokens.user}`)
          .send({ status: 'confirmed' })
          .expect(200);

        expect(res.status).toBe(200);
      });

      it('GET /api/customers/:id (propio) -> User tiene permiso customers:read:own (HTTP 200)', async () => {
        const res = await request
          .get(`/api/customers/${sofiaCustomer._id}`)
          .set('Authorization', `Bearer ${tokens.user}`)
          .expect(200);

        expect(res.status).toBe(200);
      });

      it('PUT /api/customers/:id (propio) -> User tiene permiso customers:update:own (HTTP 200)', async () => {
        const res = await request
          .put(`/api/customers/${sofiaCustomer._id}`)
          .set('Authorization', `Bearer ${tokens.user}`)
          .send({ phone: '6141239999' })
          .expect(200);

        expect(res.status).toBe(200);
      });

      it('GET /api/users/:id (propio) -> User tiene permiso users:read:own (HTTP 200)', async () => {
        const res = await request
          .get(`/api/users/${userIds.user}`)
          .set('Authorization', `Bearer ${tokens.user}`)
          .expect(200);

        expect(res.status).toBe(200);
      });

      it('PUT /api/users/:id (propio) -> User tiene permiso users:update:own (HTTP 200)', async () => {
        const res = await request
          .put(`/api/users/${userIds.user}`)
          .set('Authorization', `Bearer ${tokens.user}`)
          .send({ name: 'Sofia Updated' })
          .expect(200);

        expect(res.status).toBe(200);
      });
    });

    // --- ACCESOS DENEGADOS (HTTP 403 FORBIDDEN) ---
    describe('4.2 Rutas restringidas para User (HTTP 403 Forbidden)', () => {
      it('POST /api/products -> User NO tiene permiso de crear productos (HTTP 403)', async () => {
        const res = await request
          .post('/api/products')
          .set('Authorization', `Bearer ${tokens.user}`)
          .send({ name: 'Shoe Forbidden' })
          .expect(403);

        expect(res.status).toBe(403);
      });

      it('PUT /api/products/:id -> User NO tiene permiso de editar productos (HTTP 403)', async () => {
        const res = await request
          .put(`/api/products/${existingProductId}`)
          .set('Authorization', `Bearer ${tokens.user}`)
          .send({ name: 'Shoe Update Forbidden' })
          .expect(403);

        expect(res.status).toBe(403);
      });

      it('DELETE /api/products/:id -> User NO tiene permiso de eliminar productos (HTTP 403)', async () => {
        const res = await request
          .delete(`/api/products/${existingProductId}`)
          .set('Authorization', `Bearer ${tokens.user}`)
          .expect(403);

        expect(res.status).toBe(403);
      });

      it('GET /api/inventory -> User NO tiene ningún permiso de inventario (HTTP 403)', async () => {
        const res = await request
          .get('/api/inventory')
          .set('Authorization', `Bearer ${tokens.user}`)
          .expect(403);

        expect(res.status).toBe(403);
      });

      it('POST /api/inventory -> User NO puede crear inventario (HTTP 403)', async () => {
        const res = await request
          .post('/api/inventory')
          .set('Authorization', `Bearer ${tokens.user}`)
          .send({ stock: 10 })
          .expect(403);

        expect(res.status).toBe(403);
      });

      it('GET /api/customers (Listado global) -> User NO tiene customers:read:any (HTTP 403)', async () => {
        const res = await request
          .get('/api/customers')
          .set('Authorization', `Bearer ${tokens.user}`)
          .expect(403);

        expect(res.status).toBe(403);
      });

      it('POST /api/customers -> User NO tiene permiso customers:create:any (HTTP 403)', async () => {
        const res = await request
          .post('/api/customers')
          .set('Authorization', `Bearer ${tokens.user}`)
          .send({ email: 'forbidden@example.com' })
          .expect(403);

        expect(res.status).toBe(403);
      });

      it('GET /api/customers/:id (Cliente ajeno) -> User no puede consultar cliente ajeno (HTTP 403)', async () => {
        const res = await request
          .get(`/api/customers/${adminCustomer._id}`)
          .set('Authorization', `Bearer ${tokens.user}`)
          .expect(403);

        expect(res.status).toBe(403);
      });

      it('PUT /api/customers/:id (Cliente ajeno) -> User no puede editar cliente ajeno (HTTP 403)', async () => {
        const res = await request
          .put(`/api/customers/${adminCustomer._id}`)
          .set('Authorization', `Bearer ${tokens.user}`)
          .send({ phone: '6140000000' })
          .expect(403);

        expect(res.status).toBe(403);
      });

      it('DELETE /api/customers/:id -> User NO tiene permiso customers:delete:any (HTTP 403)', async () => {
        const res = await request
          .delete(`/api/customers/${sofiaCustomer._id}`)
          .set('Authorization', `Bearer ${tokens.user}`)
          .expect(403);

        expect(res.status).toBe(403);
      });

      it('GET /api/orders (Listado global) -> User NO tiene orders:read:any (HTTP 403)', async () => {
        const res = await request
          .get('/api/orders')
          .set('Authorization', `Bearer ${tokens.user}`)
          .expect(403);

        expect(res.status).toBe(403);
      });

      it('GET /api/orders/:id (Orden ajena) -> User no puede consultar orden ajena (HTTP 403)', async () => {
        const res = await request
          .get(`/api/orders/${adminOrder._id}`)
          .set('Authorization', `Bearer ${tokens.user}`)
          .expect(403);

        expect(res.status).toBe(403);
      });

      it('GET /api/roles -> User NO tiene acceso a roles (HTTP 403)', async () => {
        const res = await request
          .get('/api/roles')
          .set('Authorization', `Bearer ${tokens.user}`)
          .expect(403);

        expect(res.status).toBe(403);
      });

      it('GET /api/permissions -> User NO tiene acceso a permisos (HTTP 403)', async () => {
        const res = await request
          .get('/api/permissions')
          .set('Authorization', `Bearer ${tokens.user}`)
          .expect(403);

        expect(res.status).toBe(403);
      });

      it('GET /api/users (Listado global) -> User NO tiene users:read:any (HTTP 403)', async () => {
        const res = await request
          .get('/api/users')
          .set('Authorization', `Bearer ${tokens.user}`)
          .expect(403);

        expect(res.status).toBe(403);
      });

      it('POST /api/users -> User NO tiene permiso users:create:any (HTTP 403)', async () => {
        const res = await request
          .post('/api/users')
          .set('Authorization', `Bearer ${tokens.user}`)
          .send({ email: 'user.create.forbidden@example.com' })
          .expect(403);

        expect(res.status).toBe(403);
      });

      it('DELETE /api/users/:id -> User NO tiene users:delete:any (HTTP 403)', async () => {
        const res = await request
          .delete(`/api/users/${userIds.admin}`)
          .set('Authorization', `Bearer ${tokens.user}`)
          .expect(403);

        expect(res.status).toBe(403);
      });

      it('GET /api/users/:id (Usuario ajeno) -> User no puede consultar perfil ajeno (HTTP 403)', async () => {
        const res = await request
          .get(`/api/users/${userIds.admin}`)
          .set('Authorization', `Bearer ${tokens.user}`)
          .expect(403);

        expect(res.status).toBe(403);
      });

      it('PUT /api/users/:id (Usuario ajeno) -> User no puede modificar perfil ajeno (HTTP 403)', async () => {
        const res = await request
          .put(`/api/users/${userIds.admin}`)
          .set('Authorization', `Bearer ${tokens.user}`)
          .send({ name: 'Hacked' })
          .expect(403);

        expect(res.status).toBe(403);
      });
    });

    afterAll(async () => {
      if (createdUserOrderId) {
        try {
          await Order.findByIdAndDelete(createdUserOrderId);
        } catch (err) {
          // Ignorar
        }
      }
    });
  });
});
