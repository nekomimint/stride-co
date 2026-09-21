// nuestra "base de datos"
let users = [];
let nextId = 1;

// CREATE
function create(req, res, next) 
{
  const { name, email } = req.body;

  // creamos el objeto usuario
  const newUser = 
  {
    id: nextId++,
    name,
    email
  };

  // lo metemos a nuestra "base de datos"
  users.push(newUser);

  // regresamo la respuesta
  res.status(201).json({message: "usuario creado",data: newUser });
}

// READ todos
function list(req, res, next) 
{
  res.json({
    message: "lista de usuarios",
    data: users
  });
}

// READ por id
function find(req, res, next) 
{
  const id = parseInt(req.params.id, 10);
  const user = users.find(u => u.id === id);

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
function update(req, res, next)
 {
  const id = parseInt(req.params.id, 10);
  const userIndex = users.findIndex(u => u.id === id);

  if (userIndex === -1) 
    {
    return res.status(404).json({
      message: "No se encontró el usuario"
    });
  }
  const user = users[userIndex]
  const { name, email } = req.body;

  // Solo actualizamos los campos que hayamos enviado
  
  if (name !== undefined)
  {
     user.name = name;
  }
  if (email !== undefined)
    {
     user.email = email;
    }

  res.json({
    message: "Usuario actualizado",
    data: users[userIndex]
  });
}

// DELETE
function destroy(req, res, next) 
{
  const id = parseInt(req.params.id, 10);
  const userIndex = users.findIndex(u => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({
      message: "Usuario no encontrado"
    });
  }

  // borramos el usuario y aprovechamos que splice regresa una
  // lista para obtener justo el usuario que acabamos de eliminar
  const deletedUser = users.splice(userIndex, 1)[0];

  res.json({
    message: "Usuario eliminado",
    data: deletedUser
  });
}

module.exports = { create, list, find, update, destroy };