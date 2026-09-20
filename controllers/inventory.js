let inventory = [];
let nextId = 1;

// CREATE
function create(req, res, next) 
{
  const { productId, stock } = req.body;
  const newItem = {
    id: nextId++,
    productId: productId || null,
    stock: stock !== undefined ? stock : 0
  };
  inventory.push(newItem);

  res.status(201).json({
    message: "invetario craedo",
    data: newItem
  });
}

// READ todo
function list(req, res, next) {
  res.json({
    message: "Lista de inventario",
    data: inventory
  });
}

// READ solo uno
function find(req, res, next) {
  const id = +req.params.id;
  const item = inventory.find(i => i.id === id);

  res.json({
    message: "Inventario por id",
    data: item || {}
  });
}

// UPDATE
function update(req, res, next) {
  const id = +req.params.id;
  const { stock } = req.body;
  const item = inventory.find(i => i.id === id);

  if (item) {
    if (stock !== undefined) item.stock = stock;
  }

  res.json({
    message: "Inventario actualizado",
    data: item || {}
  });
}

// DELETE
function destroy(req, res, next) {
  const id = +req.params.id;
  const index = inventory.findIndex(i => i.id === id);
  let deletedItem = {};

  if (index !== -1) {
    deletedItem = inventory.splice(index, 1)[0];
  }

  res.json({
    message: "Inventario eliminado",
    data: deletedItem
  });
}

module.exports = { create, list, find, update, destroy };