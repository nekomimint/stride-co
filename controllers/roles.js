const Permission = require('../models/relationals/Permission');
const Role = require('../models/relationals/Role');

// CREATE

// body: {name, description, permissionIds: [1,2] }
async function create(req, res, next) 
{
  try 
  {
    // crea el rol con la forma moderna: o sea pasarle directamente el cuerpo al create
    const role = await Role.create(req.body); 

    // asignamos los permisos
    if(req.body.permissionsIdS) await role.setPermissions(req.body.permissionsIdS);
    res.status(201).json({message: req.__('role.roleCreated')  , data: role})
  }
  catch(err)
  {
    next(err)
  }

}

// READ todos
async function list(req, res, next) 
{
  const roles = await Role.findAll({include: {model:Permission, as: 'permissions'}});
  res.json({message: req.__('role.findRoles'), data: roles});
}

// READ por id
async function find(req, res, next) {
  const id = req.params.id;
  const role = await Role.findByPk(id);

  if (!role) {
    return res.status(404).json({
      message: req.__('role.roleNotFound'),
      data: null
    });
  }

  res.json({
    message: req.__('role.roleFound'),
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
      message: req.__('role.roleNotFound')
    });
  }

  let changes = {};

  // Actualizamos los campos que se hayan enviado
  changes.name = name !== undefined ? name : role.name;
  changes.description = description !== undefined ? description : role.description;

  await role.update(changes);

  res.json({
    message: req.__('role.roleUpdated'),
    data: role
  });
}

// DELETE
async function destroy(req, res, next) {
  const id = req.params.id;
  const role = await Role.findByPk(id);

  if (!role) {
    return res.status(404).json({
      message: req.__('role.roleNotFound')
    });
  }

  await role.destroy();

  res.json({
    message: req.__('role.roleDeleted'),
    data: role
  });
}

module.exports = { create, list, find, update, destroy };
