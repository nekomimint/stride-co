const User = require('../models/relationals/User')


// CREATE
async function create(req, res, next) 
{
  const name = req.body.name;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const user = await User.create({first_name:name, last_name:lastName, email:email});

  // regresamos la respuesta
  res.status(201).json({message: "usuario creado",data: user });
}

// READ todos
async function list(req, res, next) {
  const users = await User.findAll();
  res.json({
    message: "lista de usuarios",
    data: users
  });
}

// READ por id
async function find(req, res, next){
  const id = req.params.id;
  const user = await User.findByPk(id);

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