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
('orders:create:any', 'Crear órdenes para cualquier cliente', NOW(), NOW()),
('orders:create:own', 'Crear órdenes propias', NOW(), NOW()),
('orders:read:own', 'Ver órdenes propias', NOW(), NOW()),
('orders:read:any', 'Ver todas las órdenes', NOW(), NOW()),
('orders:update:own', 'Editar órdenes propias', NOW(), NOW()),

-- USUARIOS
('users:create:any', 'Crear usuarios', NOW(), NOW()),
('users:read:any', 'Ver todos los usuarios', NOW(), NOW()),
('users:read:own', 'Ver perfil propio', NOW(), NOW()),
('users:update:any', 'Editar cualquier usuario', NOW(), NOW()),
('users:update:own', 'Editar perfil propio', NOW(), NOW()),
('users:delete:any', 'Eliminar usuarios', NOW(), NOW())

ON DUPLICATE KEY UPDATE
description = VALUES(description);


-- 3. ASIGNAR PERMISOS A LOS ROLES


-- ADMIN: TODOS LOS PERMISOS
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
    'products:read:any',
    'orders:create:any',
    'orders:read:own',
    'orders:read:any',
    'orders:update:own',
    'users:read:own',
    'users:update:own'
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
    'products:read:any',
    'orders:create:own',
    'orders:read:own',
    'orders:update:own',
    'users:read:own',
    'users:update:own'
)
WHERE r.name = 'user'
ON DUPLICATE KEY UPDATE
role_id = VALUES(role_id);
