// esta semilla era la que se usaba para insertar manualmente
// los roles dentro de la base de datos
// pero este comportamiento ya se migro a seed.js  
-- 1. INSERTAR ROLES
INSERT INTO roles (id, name, description) VALUES
(1, 'admin', 'Administrador del sistema'),
(2, 'sales', 'Vendedor del sistema'),
(3, 'user', 'Usuario cliente')
ON DUPLICATE KEY UPDATE
name = VALUES(name),
description = VALUES(description);


-- 2. INSERTAR PERMISOS
INSERT INTO permissions (`key`, description, created_at, updated_at) VALUES

-- PRODUCTOS
('products:create:any', 'Crear productos', NOW(), NOW()),
('products:read:any', 'Ver productos', NOW(), NOW()),
('products:update:any', 'Editar productos', NOW(), NOW()),
('products:delete:any', 'Eliminar productos', NOW(), NOW()),

-- ÓRDENES
('orders:create:any', 'Crear ordenes para cualquier cliente', NOW(), NOW()),
('orders:create:own', 'Crear ordenes propias', NOW(), NOW()),
('orders:read:own', 'Ver ordenes propias', NOW(), NOW()),
('orders:read:any', 'Ver todas las ordenes', NOW(), NOW()),
('orders:update:own', 'Editar ordenes propias', NOW(), NOW()),

-- USUARIOS
('users:create:any', 'Crear usuarios', NOW(), NOW()),
('users:read:any', 'Ver todos los usuarios', NOW(), NOW()),
('users:read:own', 'Ver perfil propio', NOW(), NOW()),
('users:update:any', 'Editar cualquier usuario', NOW(), NOW()),
('users:update:own', 'Editar perfil propio', NOW(), NOW()),
('users:delete:any', 'Eliminar usuarios', NOW(), NOW()),

-- VARIANTES
('variants:create:any', 'Crear variantes', NOW(), NOW()),
('variants:read:any', 'Ver variantes', NOW(), NOW()),
('variants:update:any', 'Editar variantes', NOW(), NOW()),
('variants:delete:any', 'Eliminar variantes', NOW(), NOW()),

-- INVENTARIO
('inventory:create:any', 'Crear inventario', NOW(), NOW()),
('inventory:read:any', 'Ver inventario', NOW(), NOW()),
('inventory:update:any', 'Editar inventario', NOW(), NOW()),
('inventory:delete:any', 'Eliminar inventario', NOW(), NOW()),

-- CLIENTES
('customers:create:any', 'Crear clientes', NOW(), NOW()),
('customers:read:any', 'Ver todos los clientes', NOW(), NOW()),
('customers:read:own', 'Ver cliente propio', NOW(), NOW()),
('customers:update:any', 'Editar cualquier cliente', NOW(), NOW()),
('customers:update:own', 'Editar cliente propio', NOW(), NOW()),
('customers:delete:any', 'Eliminar clientes', NOW(), NOW()),

-- ROLES (asignar roles a usuarios se cubre con users:update:any)
('roles:create:any', 'Crear roles', NOW(), NOW()),
('roles:read:any', 'Ver roles', NOW(), NOW()),
('roles:update:any', 'Editar roles', NOW(), NOW()),
('roles:delete:any', 'Eliminar roles', NOW(), NOW()),

-- PERMISOS
('permissions:create:any', 'Crear permisos', NOW(), NOW()),
('permissions:read:any', 'Ver permisos', NOW(), NOW()),
('permissions:update:any', 'Editar permisos', NOW(), NOW()),
('permissions:delete:any', 'Eliminar permisos', NOW(), NOW())

ON DUPLICATE KEY UPDATE
description = VALUES(description);


-- 3. ASIGNAR PERMISOS A LOS ROLES


-- ADMIN: TODOS LOS PERMISOS (incluye los nuevos automaticamente)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'admin'
ON DUPLICATE KEY UPDATE
role_id = VALUES(role_id);


-- SALES: VENDEDOR
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p
ON p.`key` IN (
-- existentes
'products:read:any',
'orders:create:any',
'orders:read:own',
'orders:read:any',
'orders:update:own',
'users:read:own',
'users:update:own',
-- nuevos
'variants:read:any',
'inventory:read:any',
'customers:create:any',
'customers:read:any',
'customers:read:own',
'customers:update:any',
'customers:update:own'
)
WHERE r.name = 'sales'
ON DUPLICATE KEY UPDATE
role_id = VALUES(role_id);


-- USER: CLIENTE
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p
ON p.`key` IN (
-- existentes
'products:read:any',
'orders:create:own',
'orders:read:own',
'orders:update:own',
'users:read:own',
'users:update:own',
-- nuevos
'variants:read:any',
'customers:read:own',
'customers:update:own'
)
WHERE r.name = 'user'
ON DUPLICATE KEY UPDATE
role_id = VALUES(role_id);