--Creación de la matriz rbac en la base de datos
-- Para insertar este archivo en la base de datos se utiliza el comando:  docker exec -it "Nombre/id del contenedor" mysql -u root -p stride_co < seed_rbac.sql


-- Insertar Roles 
INSERT INTO roles (id, name, description) VALUES
(1, 'admin', 'Administrador del sistema'),
(2, 'sales', 'Vendedor del sistema'),
(3, 'user', 'Usuario cliente')
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- Insertar Permisos (Con created_at y updated_at exigidos)
INSERT INTO permissions (`key`, description, created_at, updated_at) VALUES
('products:create:any', 'Crear productos', NOW(), NOW()),
('products:read:any', 'Ver productos', NOW(), NOW()),
('products:update:any', 'Editar productos', NOW(), NOW()),
('products:delete:any', 'Eliminar productos', NOW(), NOW()),
('orders:create:any', 'Crear órdenes', NOW(), NOW()),
('orders:read:own', 'Ver órdenes propias', NOW(), NOW()),
('orders:read:any', 'Ver todas las órdenes', NOW(), NOW()),
('orders:update:own', 'Editar órdenes propias', NOW(), NOW()),
('users:read:any', 'Ver usuarios', NOW(), NOW()),
('users:update:any', 'Editar usuarios', NOW(), NOW())
ON DUPLICATE KEY UPDATE description=VALUES(description);


--Asignan los permisos a los roles determinados

-- ADMIN
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'admin'
ON DUPLICATE KEY UPDATE role_id=VALUES(role_id);

-- SALES
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.`key` IN ('products:read:any', 'orders:create:any', 'orders:read:own', 'orders:read:any')
WHERE r.name = 'sales'
ON DUPLICATE KEY UPDATE role_id=VALUES(role_id);

-- USER
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.`key` IN ('orders:create:any', 'orders:read:own', 'orders:update:own')
WHERE r.name = 'user'
ON DUPLICATE KEY UPDATE role_id=VALUES(role_id);