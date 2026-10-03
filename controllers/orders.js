const {Order} = require('../models/documents');


// CREATE
async function create(req, res, next) {
    const order = await Order.create(req.body);
    res.status(201).json({
      message: "Orden creada",
      data: order
    });
}

// READ toda la lista
async function list(req, res, next) {
    const orders = await Order.find();
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


function destroy(req, res, next) {
  const id = +req.params.id;
  const index = orders.findIndex(o => o.id === id);
  let deletedOrder = {};

  if (index !== -1) {
    deletedOrder = orders.splice(index, 1)[0];
  }

  res.json({
    message: "Orden eliminada",
    data: deletedOrder
  });
}

module.exports = { create, list, find, update, destroy};