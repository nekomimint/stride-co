// importamos
const {Order} = require('../models/documents');

//función que devuelve true si el usuario puede acceder a esa orden
function canAccess(req, order){
  return req.canAny || String(order.userId) === String(req.user.id);
}


// CREATE
async function create(req, res, next) {
    const order = await Order.create({...req.body, userId: req.user.id});
    res.status(201).json({
      message: "Orden creada",
      data: order
    });
}

// READ toda la lista
async function list(req, res, next) {
    const filter = req.canAny ? {} : {userId: req.user.id};
    const orders = await Order.findAll(filter);
    res.json({
      message: "Lista de ordenes",
      data: orders
    });
}

// READ solo uno
async function find(req, res, next) {
  const order = await Order.findByPk(req.params.id);

  if(!order)
  {
    return res.status(404).json({message: 'Orden no encontrada'});
  }

  if(!canAccess(req, order))
  {
    return res.status(403).json({message: 'La orden no pertenece al usuario actual'})
  }

  res.json({
    message: "Orden por id",
    data: order
  });
}

// UPDATE
async function update(req, res, next) {
  const order = await Order.findByPk(req.params.id);

  if (!order) {
    return res.status(404).json({message: 'Orden no encontrada'});
  }

  if(!canAccess(req, order)){
    return res.status(403).json({message: 'La orden no pertenece al usuario actual'});
  }

  const {status, total} = req.body;
  if(status !== undefined){
    order.status = status;
  }
  if(total !== undefined){
    order.total = total;
  }
  await order.save();

  res.json({
    message: "Orden actualizada",
    data: order
  });
}

// DELETE

// no podemos eliminar solamente cambiar de estado
// y para eso ya existe el update

async function destroy(req, res, next) {
  const order = await Order.findByPk(req.params.id);

  if(!order){
    return res.status(404).json({message: 'Orden no encontrada'});
  }

  if(!canAccess(req, order))
  {
    return res.status(403).json({message: 'La orden no pertenece al usuario actual'})
  }
  await order.destroy;

  res.json({
    message: "Orden eliminada",
    data: order
  });
}


/*function destroy(req, res, next) {
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
}*/

module.exports = { create, list, find, update, destroy};