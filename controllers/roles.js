const Role = require('../models/relationals/Role');

// CREATE
async function create(req, res, next) {
  const name = req.body.name;
  const description = req.body.description;

  const role = await Role.create({ name: name, description: description });

  res.status(201).json({message: "Rol creado", data: role});
}

// READ todos
async function list(req, res, next) {
  const roles = await Role.findAll();

  res.json({message: "Lista de roles", data: roles});
}

// READ por id
async function find(req, res, next) {
  const id = req.params.id;
  const role = await Role.findByPk(id);

  if (!role) {
    return res.status(404).json({
      message: "No se encontro el rol",
      data: null
    });
  }

  res.json({
    message: "Rol encontrado",
    data: role
  });
}

// UPDATE
async function update(req, res, next) {
  const id = req.params.id;
  const name = req.body.name;
  const description = req.body.description;
  const role = await Role.findByPk(id);

  if (!role) {
    return res.status(404).json({
      message: "Rol no encontrado"
    });
  }

  let changes = {};

  // Actualizamos los campos que se hayan enviado
  changes.name = name !== undefined ? name : role.name;
  changes.description = description !== undefined ? description : role.description;

  await role.update(changes);

  res.json({
    message: "Rol actualizado",
    data: role
  });
}

// DELETE
async function destroy(req, res, next) {
  const id = req.params.id;
  const role = await Role.findByPk(id);

  if (!role) {
    return res.status(404).json({
      message: "Rol no encontrado"
    });
  }

  await role.destroy();

  res.json({
    message: "Rol eliminado",
    data: role
  });
}

module.exports = { create, list, find, update, destroy };