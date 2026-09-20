let orders = [];
let nextId = 1;

// CREATE
function create(req, res, next) 
{
  const { customerId, total, status } = req.body;

  const newOrder = 
  {
    id: nextId++,
    customerId: customerId || null,
    total: total || 0,
    status: status || "pendiente"
  };
  orders.push(newOrder);

  res.status(201).json({
    message: "Orden creada",
    data: newOrder
  });
}

// READ toda la lista
function list(req, res, next) {
  res.json({
    message: "Lista de ordenes",
    data: orders
  });
}

// READ solo uno
function find(req, res, next) {
  const id = +req.params.id;
  const order = orders.find(o => o.id === id);

  res.json({
    message: "Orden por id",
    data: order || {}
  });
}

// UPDATE
function update(req, res, next) {
  const id = +req.params.id;
  const { status, total } = req.body;
  const order = orders.find(o => o.id === id);

  if (order) {
    if (status !== undefined) order.status = status;
    if (total !== undefined) order.total = total;
  }

  res.json({
    message: "Orden actualizada",
    data: order || {}
  });
}

// DELETE

// no podemos eliminar solamente cambiar de estado
// y para eso ya existe el update


// function destroy(req, res, next) {
//   const id = +req.params.id;
//   const index = orders.findIndex(o => o.id === id);
//   let deletedOrder = {};

//   if (index !== -1) {
//     deletedOrder = orders.splice(index, 1)[0];
//   }

//   res.json({
//     message: "Orden eliminada",
//     data: deletedOrder
//   });
// }

module.exports = { create, list, find, update};