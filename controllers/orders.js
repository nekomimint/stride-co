// importamos
const {Order} = require('../models/documents');
const {Customer} = require('../models/documents');

// Función que devuelve true si el usuario puede acceder a esa orden
// aqui el detalle es que si recordamos las ordenes guardan el objetct_id
// de la coleccion customers. entonces estas rutas funcionanban
// recibiendo el object id, en cambio en el payload nosotros recibimos
// el id del usuario. Pero sabemos que la coleccion customers guarda el id
// del usuario (el id del modelo relacional)
async function canAccess(req, order){
  if (req.canAny) {
    return true;
  }

  //Buscamos el customer cuyo identificador coincida con el usuario del token (req.auth.sub)
  const customer = await Customer.findOne({ userId: req.auth.sub });

  // Si no existe un cliente asociado a ese token, no puede acceder
  if (!customer) {
    return false;
  }
  //comparamos el _id del customer con el customerID de la orden
  return String(order.customerId) === String(customer._id);
}
// CREATE
async function create(req, res, next) {
    try {
        // Usamos req.auth.sub porque ahí es donde express-jwt guarda el payload del token
        const userId = req.auth?.sub;

        const order = await Order.create({
            ...req.body, 
            userId: userId
        });
        
        res.status(201).json({
          message: req.__('order.orderCreated'),
          data: order
        });

    } catch (error) {
        next(error);
    }
}

// READ toda la lista
async function list(req, res, next) {
    try {
        const filter = req.canAny ? {} : {userId: req.user.id};
        const orders = await Order.find(filter);
        res.json({
          message: req.__('order.findOrders'),
          data: orders
        });
    } catch (error) {
        next(error);
    }
}

// READ solo uno
async function find(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);

    if(!order) {
      return res.status(404).json({message: req.__('order.orderNotFound')});
    }

    // Al ser async, usamos await
    if(!(await canAccess(req, order))) {
      return res.status(403).json({message: req.__('order.orderNotInUser')});
    }

    res.json({
      message: req.__('order.orderFound'),
      data: order
    });
  } catch (error) {
    next(error);
  }
}

// UPDATE
async function update(req, res, next) {
  try {
    // Buscamos el documento por ID
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({message: req.__('order.orderNotFound')});
    }

    if(!canAccess(req, order)){
      return res.status(403).json({message: req.__('order.orderNotInUser')});
    }

    const {status, total} = req.body;
    if(status !== undefined){
      order.status = status;
    }
    if(total !== undefined){
      order.total = total;
    }
    
    // Guardamos los cambios usando el método de instancia save() compatible con documentos
    await order.save();

    res.json({
      message: req.__('order.orderUpdated'),
      data: order
    });
  } catch (error) {
    next(error);
  }
}

// DELETE
async function destroy(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);

    if(!order){
      return res.status(404).json({message: req.__('order.orderNotFound')});
    }

    if(!canAccess(req, order)) {
      return res.status(403).json({message: req.__('order.orderNotInUser')});
    }

    await Order.findByIdAndDelete(req.params.id);

    res.json({
      message: req.__('order.orderDeleted'),
      data: order
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { create, list, find, update, destroy };