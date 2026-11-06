// importamos la tablita de Permissions para la base de datos
const Permission = require('../models/relationals/Permission')
// que tipos de permisos vamos a tener estarán definidos desde antes
// entonces estas no las vamos a usar:

// CREATE
async function create(req, res, next) 
{
  const key = req.body.key;
  const description = req.body.description;
  const permission = await Permission.create({key:key, description:description});

  // regresamos la respuesta
  res.status(201).json({message: req.__('permission.permissionCreated'), data: permission });
}

// READ toda la lista
async function list(req, res, next) {
  const permissions = await Permission.findAll();
  res.json({
    message: req.__('permission.findPermissions'),
    data: permissions
  });
}

// READ uno por uno
async function find(req, res, next){
  const id = req.params.id;
  const permission = await Permission.findByPk(id);

  if (!permission)
    {
    return res.status(404).json({
      message: req.__('permission.permissionNotFound'),
      data: null
    });
  }

  res.json({
    message: req.__('permission.permissionFound'),
    data: permission
  });

}

// UPDATE
async function update(req, res, next)
 {
  const id = req.params.id;
  const key = req.body.key;
  const description = req.body.description;
  const permission = await Permission.findByPk(id);
  
  if (!permission) {
    return res.status(404).json({
      message: req.__('permission.permissionNotFound')
    });
  }

  let changes = {};

  // Solo actualizamos los campos que hayamos enviado
  changes.key = key ? key : permission.key;
  changes.description = description ? description : permission.description;

  await permission.update(changes);
  
  res.json({
    message: req.__('permission.permissionUpdated'),
    data: permission
  });
}

// DELETE
async function destroy(req, res, next) 
{
  const id = req.params.id;
  const permission = await Permission.findByPk(id);

  if (!permission) {
    return res.status(404).json({
      message: req.__('permission.permissionNotFound')
    });
  }
  await permission.destroy();

  res.json({
    message: req.__('permission.permissionDeleted'),
    data: permission
  });
}

module.exports = { create, list, find, update, destroy };
