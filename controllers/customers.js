let customers = [];
let nextId = 1;

// CREATE
function create(req, res, next) {
  const { name, email } = req.body;
  const newCustomer = {
    id: nextId++,
    name: name || "Cliente Anónimo",
    email: email || "sin-email@example.com"
  };
  customers.push(newCustomer);

  res.status(201).json({
    message: "Cliente creado",
    data: newCustomer
  });
}

// READ toda la lista
function list(req, res, next) {
  res.json({
    message: "Lista de clientes",
    data: customers
  });
}

// READ uno solo
function find(req, res, next) {
  const id = +req.params.id;
  const customer = customers.find(c => c.id === id);

  res.json({
    message: "Clientes por id",
    data: customer || {}
  });
}

// UPDATE
function update(req, res, next) {
  const id = +req.params.id;
  const { name, email } = req.body;
  const customer = customers.find(c => c.id === id);

  if (customer) {
    if (name !== undefined) customer.name = name;
    if (email !== undefined) customer.email = email;
  }

  res.json({
    message: "Cliente actualizado",
    data: customer || {}
  });
}

// DELETE
function destroy(req, res, next) {
  const id = +req.params.id;
  const index = customers.findIndex(c => c.id === id);
  let deletedCustomer = {};

  if (index !== -1) {
    deletedCustomer = customers.splice(index, 1)[0];
  }

  res.json({
    message: "Cliente eliminado",
    data: deletedCustomer
  });
}

module.exports = { create, list, find, update, destroy };