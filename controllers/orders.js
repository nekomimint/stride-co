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
    // faltaba agregregar populate para mostrar la informacion del cliente
    // en lugar de solamente su objectId
    const orders = await Order.find().populate('customerId');
    res.json({
      message: "Lista de ordenes",
      data: orders
    });
}

// READ solo uno
async function find(req, res, next) 
{
  // tambien en lugar de mostrar el id a secas, mostramos la informacion del cliente
  // asociado a esa orden
  const order = await Order.findById(req.params.id).populate('customerId');
  if (!order) 
  {
    return res.status(404).json({ message: "Orden no encontrada" });
  }
  res.json({
    message: "Orden por id",
    data: order
  });
}

// UPDATE
async function update(req, res, next) 
{

    const order = await Order.findByIdAndUpdate(
    req.params.id,
    // como segundo parametro pide el objeto
    // si el objeto no tiene todas las propiedades mongoose es inteligente
    // para saber que solo tiene que actualizar las que si tiene
    req.body,
    { new: true } // Devuelve el documento actualizado
  );
  if (!order) {
    return res.status(404).json({ message: "Orden no encontrada" });
  }
  res.json({
    message: "Orden actualizada",
    data: order
  });

}

// DELETE

// no podemos eliminar solamente cambiar de estado
// y para eso ya existe el update


async function destroy(req, res, next) 
{
      const order = await Order.findByIdAndDelete(req.params.id);
      if (!order) 
      {
        return res.status(404).json({ message: "Orden no encontrada" });
      }
      
      res.json({
        message: "Orden eliminada",
        data: order
      });

}

module.exports = { create, list, find, update, destroy};