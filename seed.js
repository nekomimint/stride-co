const mongoose = require('mongoose');
const sequelize = require('./config/sequelize');
const connectMongo = require('./config/mongoose'); 

const {User, Role, Permission, Inventory, ProductVariant, Product} = require('./models/relationals')

const {hashPassword} = require('./utils/password'); 
const Customer = require('./models/documents/customer');  
const Order = require('./models/documents/order');        

// ---------------------------------------------------------------

const roles = [
{ name: 'admin', description: 'Administrador del sistema' },
{ name: 'sales', description: 'Vendedor del sistema' },
{ name: 'user',  description: 'Usuario cliente' },
];

const permissions = [
// PRODUCTOS
['products:create:any', 'Crear productos'],
['products:read:any',   'Ver productos'],
['products:update:any', 'Editar productos'],
['products:delete:any', 'Eliminar productos'],
// ÓRDENES
['orders:create:any', 'Crear ordenes para cualquier cliente'],
['orders:create:own', 'Crear ordenes propias'],
['orders:read:own',   'Ver ordenes propias'],
['orders:read:any',   'Ver todas las ordenes'],
['orders:update:own', 'Editar ordenes propias'],
// USUARIOS
['users:create:any', 'Crear usuarios'],
['users:read:any',   'Ver todos los usuarios'],
['users:read:own',   'Ver perfil propio'],
['users:update:any', 'Editar cualquier usuario'],
['users:update:own', 'Editar perfil propio'],
['users:delete:any', 'Eliminar usuarios'],
// VARIANTES
['variants:create:any', 'Crear variantes'],
['variants:read:any',   'Ver variantes'],
['variants:update:any', 'Editar variantes'],
['variants:delete:any', 'Eliminar variantes'],
// INVENTARIO
['inventory:create:any', 'Crear inventario'],
['inventory:read:any',   'Ver inventario'],
['inventory:update:any', 'Editar inventario'],
['inventory:delete:any', 'Eliminar inventario'],
// CLIENTES
['customers:create:any', 'Crear clientes'],
['customers:read:any',   'Ver todos los clientes'],
['customers:read:own',   'Ver cliente propio'],
['customers:update:any', 'Editar cualquier cliente'],
['customers:update:own', 'Editar cliente propio'],
['customers:delete:any', 'Eliminar clientes'],
// ROLES
['roles:create:any', 'Crear roles'],
['roles:read:any',   'Ver roles'],
['roles:update:any', 'Editar roles'],
['roles:delete:any', 'Eliminar roles'],
// PERMISOS
['permissions:create:any', 'Crear permisos'],
['permissions:read:any',   'Ver permisos'],
['permissions:update:any', 'Editar permisos'],
['permissions:delete:any', 'Eliminar permisos'],
];

const rolePerms = {
admin: '*', // el admin tiene todos los permisos
sales: [
    'products:read:any',
    'orders:create:any', 'orders:read:own', 'orders:read:any', 'orders:update:own',
    'users:read:own', 'users:update:own',
    'variants:read:any',
    'inventory:read:any',
    'customers:create:any', 'customers:read:any', 'customers:read:own',
    'customers:update:any', 'customers:update:own',
],
user: [
    'products:read:any',
    'orders:create:own', 'orders:read:own', 'orders:update:own',
    'users:read:own', 'users:update:own',
    'variants:read:any',
    'customers:read:own', 'customers:update:own',
],
};

const demoUsers = [
{ first_name: 'Jesus',  last_name: 'Vill',    email: 'jesus@gmail.com', password: 'admin123',   role: 'admin' },
{ first_name: 'Dany',   last_name: 'Martinez',    email: 'dany@gmail.com',  password: 'sales123',   role: 'sales' },
{ first_name: 'Sofia',  last_name: 'Rivero',  email: 'sofia@gmail.com', password: 'usuario123', role: 'user'  },
];


const catalog = [
{
    name: 'Tenis Running', description: 'Tenis para correr', brand: 'Nike', price: 2700, category_id: 2,
    variants: [
    { sku: 'NIK-RUN-26-NEG', size: '26', color: 'Negro',  stock: 25 },
    { sku: 'NIK-REUN-27-NEG', size: '27', color: 'Negro',  stock: 20 },
    { sku: 'NIK-RUN-26-BLA', size: '26', color: 'Blanco', stock: 30 },
    ],
},
{
    name: 'Tenis Ultraboost', description: 'Tenis super deportivos', brand: 'Adidas', price: 3000, category_id: 2,
    variants: [
    { sku: 'ADI-ULT-26-GRI', size: '26', color: 'Gris', stock: 15 },
    { sku: 'ADI-ULT-27-AZU', size: '27', color: 'Azul', stock: 10 },
    ],
},
{
    name: 'Tenis Suede Classic', description: 'Tenis casuales', brand: 'Puma', price: 1900, category_id: 2,
    variants: [
    { sku: 'PUM-SUE-27-NEG', size: '27', color: 'Negro',  stock: 12 },
    { sku: 'PUM-SUE-28-BLA', size: '28', color: 'Blanco', stock: 8  },
    ],
},
];


const customerSeeds = [
{
    email: 'sofia@gmail.com', phone: '6141234567',
    addresses: [
    { type: 'SHIPPING', street: 'Av. Universidad', number: '120', city: 'Chihuahua', state: 'Chihuahua', zipCode: '31000', country: 'México' },
    { type: 'BILLING',  street: 'Av. Universidad', number: '120', city: 'Chihuahua', state: 'Chihuahua', zipCode: '31000', country: 'México' },
    ],
},
];


const orderTotals = [
{ subtotal: 2700, shipping: 100, discount: 0 },
];



// para cargar toda la semilla
async function seed() {
// Conexiones
await sequelize.authenticate();
await sequelize.sync(); // crea las tablas si no existen 

// conexion 
await connectMongo();

// para los roles
const roleMap = {};
for (const r of roles) {
    const [role] = await Role.findOrCreate({ where: { name: r.name }, defaults: r });
    roleMap[r.name] = role;
}
console.log('Roles listos');

// para los permisos
const permMap = {};
for (const [key, description] of permissions) {
    const [perm] = await Permission.findOrCreate({ where: { key }, defaults: { description } });
    permMap[key] = perm;
}
console.log('Permisos listos');

// Role_Permission, addPermissions no duplica las que ya existen
for (const [roleName, keys] of Object.entries(rolePerms)) {
    const list = keys === '*' ? Object.keys(permMap) : keys;
    const missing = list.filter((k) => !permMap[k]);
    if (missing.length) {
    throw new Error(`Permisos inexistentes para ${roleName}: ${missing.join(', ')}`);
    }
    await roleMap[roleName].addPermissions(list.map((k) => permMap[k]));
}
console.log('Asignación de permisos a roles lista');

// para los usuarios de demostración
for (const u of demoUsers) {
    const { password, role, ...data } = u;
    const { securePassword, saltKey } = await hashPassword(password);
    await User.findOrCreate({
    where: { email: u.email },
    defaults: {
        ...data,
        password: securePassword,
        salt_key: saltKey,
        role_id: roleMap[role].id,
        active: true,
    },
    });
}
console.log('Usuarios demo listos');

// para el catalog
// los productos tienen variantes y estas variantes se relacionan con el inventario
for (const p of catalog) {
    const { variants, ...productData } = p;
    const [product] = await Product.findOrCreate({
    where: { name: productData.name },
    defaults: productData,
    });

    for (const v of variants) {
    const { stock, ...variantData } = v;
    const [variant] = await ProductVariant.findOrCreate({
        where: { sku: v.sku },
        defaults: { ...variantData, product_id: product.id },
    });
    await Inventory.findOrCreate({
        where: { variant_id: variant.id },
        defaults: { stock, reserved: 0 },
    });
    }
}
console.log('Catálogo listo');

// Clientes 
const customers = [];
for (const c of customerSeeds) {
    const user = await User.findOne({ where: { email: c.email } });
    if (!user) throw new Error(`No existe el usuario ${c.email}`);
    const customer = await Customer.findOneAndUpdate(
    { userId: user.id },
    { $setOnInsert: { userId: user.id, ...c } },
    { upsert: true, new: true }
    );
    customers.push(customer);
}
console.log('Clientes listos');

// Creamos las ordenes de ejemplo
for (let i = 0; i < customers.length; i++) {
    const exists = await Order.countDocuments({ customerId: customers[i]._id });
    if (exists) continue;
    const t = orderTotals[i];
    await Order.create({
    customerId: customers[i]._id,
    totals: { ...t, total: t.subtotal + t.shipping - t.discount },
    });
}


console.log('Órdenes listas');
console.log('Seed completado');
}

seed()
.then(async () => {
    await mongoose.disconnect();
    await sequelize.close();
})
.catch(async (e) => {
    console.error('Error en el seed:', e);
    await mongoose.disconnect().catch(() => {});
    await sequelize.close().catch(() => {});
    process.exit(1);
});