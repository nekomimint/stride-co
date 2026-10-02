// importamos la tablita de Permissions para la base de datos
const Permission = require('../models/relationals/Permissions')
// que tipos de permisos vamos a tener estarán definidos desde antes
// entonces estas no las vamos a usar:

// CREATE
async function create(req, res, next) 
{
  const key = req.body.key;
  const description = req.body.description;
  const permission = await Permission.create({key:key, description:description});

  // regresamos la respuesta
  res.status(201).json({message: "permiso creado",data: permission });
}

// READ toda la lista
async function list(req, res, next) {
  const permissions = await Permission.findAll();
  res.json({
    message: "lista de permisos",
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
      message: "No se encontro el permiso",
      data: null
    });
  }

  res.json({
    message: "permiso encontrado",
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
      message: "Permiso no encontrado"
    });
  }

  let changes = {};

  // Solo actualizamos los campos que hayamos enviado
  changes.key = key ? key : permission.key;
  changes.description = description ? description : permission.description;

  await permission.update(changes);
  
  res.json({
    message: "Permiso actualizado",
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
      message: "Permiso no encontrado"
    });
  }
  await permission.destroy();

  res.json({
    message: "Permiso eliminado",
    data: permission
  });
}

module.exports = { create, list, find, update, destroy };
