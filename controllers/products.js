let products = [];
let nextId = 1;

// CREATE
function create(req, res, next) {
  const { name, price } = req.body;
  const newProduct = {
    id: nextId++,
    // || si es null nos va a a regresar: "producto sin nombre"
    name: name || "Producto sin nombre",
    price: price || 0
  };
  products.push(newProduct);

  res.status(201).json({
    message: "Producto creado",
    data: newProduct
  });
}

// READ toda la lista
function list(req, res, next) {
  res.json({
    message: "Lista de productos",
    data: products
  });
}

// READ solo 1
function find(req, res, next) {
  const id = +req.params.id;
  const product = products.find(p => p.id === id);

  res.json({
    message: "Product by id",
    data: product || {}
  });
}

// UPDATE
function update(req, res, next) 
{
  const id = +req.params.id;
  const { name, price } = req.body;
  const product = products.find(p => p.id === id);

  if (product) {
    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = price;
  }

  res.json({
    message: "producto actualizado",
    data: product || {}
  });
}

// DELETE
function destroy(req, res, next) {
  const id = +req.params.id;
  const index = products.findIndex(p => p.id === id);
  let deletedProduct = {};

  if (index !== -1) {
    deletedProduct = products.splice(index, 1)[0];
  }

  res.json({
    message: "producto eliminado",
    data: deletedProduct
  });
}

module.exports = { create, list, find, update, destroy };