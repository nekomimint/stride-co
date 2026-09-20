let roles = [];
let nextId = 1;

// CREATE
function create(req, res, next) {
  const { name, description } = req.body;

  const newRole = 
  {
    id: nextId++,
    name: name || "Nuevo Rol",
    description: description || "Sin descripción"
  };
  roles.push(newRole);

  res.status(201).json({
    message: "Rol creado",
    data: newRole
  });
}

// READ toda la lista
function list(req, res, next) 
{
  res.json({
    message: "Role list",
    data: roles
  });
}

// READ solo regresar uno
function find(req, res, next) 
{
  const id = +req.params.id;
  const role = roles.find(r => r.id === id);

  res.json({
    message: "Rol por id",
    data: role || {}
  });
}

// UPDATE
function update(req, res, next) {
  const id = +req.params.id;
  const { name, description } = req.body;
  const role = roles.find(r => r.id === id);

  if (role) 
    {
    if (name !== undefined) role.name = name;
    if (description !== undefined) role.description = description;
  }

  res.json({
    message: "se ha actualizado el rol",
    data: role || {}
  });
}

// DELETE
function destroy(req, res, next) {
  const id = +req.params.id;
  const index = roles.findIndex(r => r.id === id);
  let deletedRole = {};

  if (index !== -1) {
    deletedRole = roles.splice(index, 1)[0];
  }

  res.json({
    message: "Se ha eliminado el rol",
    data: deletedRole
  });
}

module.exports = { create, list, find, update, destroy };