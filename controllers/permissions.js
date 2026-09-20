let permissions = [];
let nextId = 1;

// CREATE
function create(req, res, next) 
{
  const { key, description } = req.body;
  const newPermission = {
    id: nextId++,
    key: key || "PERM_KEY",
    description: description || "Descripción del permiso"
  };
  permissions.push(newPermission);

  res.status(201).json({
    message: "El permiso ha sido creado",
    data: newPermission
  });
}

// READ toda la lista
function list(req, res, next) 
{
  res.json({
    message: "Lista de permisos",
    data: permissions
  });
}

// READ uno por uno
function find(req, res, next) 
{
  const id = +req.params.id;
  const permission = permissions.find(p => p.id === id);

  res.json({
    message: "permisos por id",
    data: permission || {}
  });
}

// UPDATE
function update(req, res, next) {
  const id = +req.params.id;
  const { key, description } = req.body;
  const permission = permissions.find(p => p.id === id);

  if (permission) {
    if (key !== undefined) permission.key = key;
    if (description !== undefined) permission.description = description;
  }

  res.json({
    message: "El permiso ha sido actualizado",
    data: permission || {}
  });
}

// DELETE
function destroy(req, res, next) {
  const id = +req.params.id;
  const index = permissions.findIndex(p => p.id === id);
  let deletedPermission = {};

  if (index !== -1) {
    deletedPermission = permissions.splice(index, 1)[0];
  }

  res.json({
    message: "El permiso ha sido eliminado",
    data: deletedPermission
  });
}

module.exports = { create, list, find, update, destroy };