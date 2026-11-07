const User = require('../models/relationals/User');
const Role = require("../models/relationals/Role");
const {hashPassword} = require('../utils/password')

// Devuelve true si el usuario tiene permiso 'any' o si es el dueño del recurso.
// Es síncrona: solo compara el sub del token con el id del usuario que se quiere tocar.
function canAccess(req, resourceId) {
  if (req.canAny) {
    return true;
  }
  return String(req.auth?.sub) === String(resourceId);
}

// CREATE
async function create(req, res, next)
{
  const name = req.body.name;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const roleId = req.body.roleId;
  const password = req.body.password;
  const passwordData = await hashPassword(password);
  const user = await User.create({first_name:name, last_name:lastName,
  email:email, role_id: roleId, password: passwordData.securePassword, salt_key: passwordData.saltKey});


  // regresamos la respuesta
  res.status(201).json({message: req.__('user.userCreated'), data: user });
}

// READ todos
async function list(req, res, next) {
  // agregado clase 02/10/26
  // {include:{model: Role, as: 'role'}} sirve para decir
  // cuando me traigas el usuario tambien traeme la informacion del rol, ahi embebida
  
  // as es el alias de esa relacion que definimos previamente en la relacion 1-N 
  // que hicimos en el index, por eso es importante que coincidan.
  const users = await User.findAll({attributes: ['first_name', 'last_name', 'email'], include:{model: Role, as: 'role'}});
  res.json({
    message: req.__('user.findUsers'),
    data: users
  });
}

// READ por id
async function find(req, res, next){
  const id = req.params.id;

  if (!canAccess(req, id)) {
    return res.status(403).json({ message: 'No puedes acceder a este usuario' });
  }

  const user = await User.findByPk(id, {include:{model: Role, as: 'role'}});

  if (!user)
  {
    return res.status(404).json({
      message: req.__('user.userNotFound'),
      data: null
    });
  }

  res.json({
    message: req.__('user.userFound'),
    data: user
  });
}

// UPDATE
async function update(req, res, next)
{
  const id = req.params.id;

  if (!canAccess(req, id)) {
    return res.status(403).json({ message: 'No puedes modificar este usuario' });
  }

  const name = req.body.name;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const user = await User.findByPk(id);
  const roleId = req.body.roleId;
  if (!user) {
    return res.status(404).json({
      message: req.__('user.userNotFound')
    });
  }

  let changes = {};

  // Solo actualizamos los campos que hayamos enviado
  changes.first_name = name ? name : user.first_name;
  changes.last_name = lastName ? lastName : user.last_name;
  changes.email = email ? email : user.email;
  changes.role_id = roleId ? roleId: user.role_id;

  await user.update(changes);
  res.json({
    message: req.__('user.userUpdated'),
    data: user
  });
}

// DELETE
async function destroy(req, res, next)
{
  const id = req.params.id;

  if (!canAccess(req, id)) {
    return res.status(403).json({ message: 'No puedes eliminar este usuario' });
  }

  const user = await User.findByPk(id);

  if (!user) {
    return res.status(404).json({
      message: req.__('user.userNotFound')
    });
  }
  await user.destroy();

  res.json({
    message: req.__('user.userDeleted'),
    data: user
  });
}

module.exports = { create, list, find, update, destroy };









