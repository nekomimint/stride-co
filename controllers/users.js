const User = require('../models/relationals/User');
const Role = require("../models/relationals/Role");

// otra opcion es 
// const Role = require('../models/relationals');


// CREATE
async function create(req, res, next) 
{
  const name = req.body.name;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const roleId = req.body.roleId;
  const user = await User.create({first_name:name, last_name:lastName,
  email:email, role_id: roleId }); 

  // regresamos la respuesta
  res.status(201).json({message: "usuario creado",data: user });
}

// READ todos
async function list(req, res, next) {
  // agregado clase 02/10/26
  // {include:{model: Role, as: 'role'}} sirve para decir
  // cuando me traigas el usuario tambien traeme la informacion del rol, ahi embebida
  
  // as es el alias de esa relacion que definimos previamente en la relacion 1-N 
  // que hicimos en el index, por eso es importante que coincidan.
  const users = await User.findAll({include:{model: Role, as: 'role'}});
  res.json({
    message: "lista de usuarios",
    data: users
  });
}

// READ por id
async function find(req, res, next){
  const id = req.params.id;
  const user = await User.findByPk(id, {include:{model: Role, as: 'role'}});

  if (!user)
    {
    return res.status(404).json({
      message: "No se encontro al usuario",
      data: null
    });
  }

  res.json({
    message: "usuario encontrado",
    data: user
  });

}

// UPDATE
async function update(req, res, next)
 {
  const id = req.params.id;
  const name = req.body.name;
  const lastName = req.body.lasName;
  const email = req.body.email;
  const user = await User.findByPk(id);
  const roleId = req.body.roleId;
  
  if (!user) {
    return res.status(404).json({
      message: "Usuario no encontrado"
    });
  }

  let changes = {};

  // Solo actualizamos los campos que hayamos enviado
  changes.first_name = name ? name : user.first_name;
  changes.last_name = lastName ? lastName : user.last_name;
  changes.email = email ? email : user.email;
  changes.role_id = role_id ? roleId: user.role_id; // agregado

  await user.update(changes);
  
  res.json({
    message: "Usuario actualizado",
    data: user
  });
}

// DELETE
async function destroy(req, res, next) 
{
  const id = req.params.id;
  const user = await User.findByPk(id);

  if (!user) {
    return res.status(404).json({
      message: "Usuario no encontrado"
    });
  }
  await user.destroy();

  res.json({
    message: "Usuario eliminado",
    data: user
  });
}

module.exports = { create, list, find, update, destroy };