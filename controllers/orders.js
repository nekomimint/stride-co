// importamos
const {Order} = require('../models/documents');


// CREATE
async function create(req, res, next) {
    const order = await Order.create(req.body);
    res.status(201).json({
      message: req.__('order.orderCreated'),
      data: order
    });
}

// READ toda la lista
async function list(req, res, next) {
    const orders = await Order.find();
    res.json({
      message: req.__('order.findOrders'),
      data: orders
    });
}

// READ solo uno
async function find(req, res, next) {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: req.__('order.orderNotFound')});
  }

  res.json({
    message: req.__('order.orderFound'),
    data: order
  });
}

// UPDATE
async function update(req, res, next) {
  const { status, total } = req.body;
  const order = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // Devuelve el documento actualizado
  );

  if (!order) {
      return res.status(404).json({ message: req.__('order.orderNotFound') });
  }

  res.json({
    message: req.__('order.orderUpdated'),
    data: order
  });
}

// DELETE

async function destroy(req, res, next) {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({ message: req.__('order.orderNotFound') });
    }
    res.json({
      message: req.__('order.orderDeleted'),
      data: order
    });
  }


// NOTA DE ALAN: Este delete de acá abajo lo dejo comentado por lo que dicen sus comentarios, pero hice uno nuevo para poder hacer las pruebas de la traducción

/*
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
*/

module.exports = { create, list, find, update, destroy};