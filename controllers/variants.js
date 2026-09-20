"Este es nuestro arreglo local"
let variants = [];
let nextId = 1;

// CREATE
function create(req, res, next) 
{
    // recogemos los valores de prueba del cuerpo del request
  const { sku, color } = req.body;

  const newVariant = 
  {
    id: nextId++,
    sku: sku,
    color: color
  };

  variants.push(newVariant);

  res.status(201).json(
    {
    message: "Variant created",
    data: newVariant
  });
}

// READ ALL
function list(req, res, next) {
  res.json({
    message: "Lista de variantes",
    data: variants     // solo regresamos la lista
  });
}

// READ ONE BY ID
function find(req, res, next) 
{
  const id = +req.params.id;
  const variant = variants.find(v => v.id === id);

  res.json({
    message: "Variant by id",
    data: variant || {}
  });


}

// UPDATE
function update(req, res, next) 
{
  const id = +req.params.id;
  const { sku, color } = req.body;
  const variant = variants.find(v => v.id === id);

  // si existe el elemento a actualizar
  if (variant) 
 {
    // actualizamos la propiedad que este definida, las dos o uno o ninguna
    if (sku !== undefined) variant.sku = sku;
    if (color !== undefined) variant.color = color;
  }

  res.json({
    message: "Variant updated",
    data: variant || {}
  });
}

// DELETE
function destroy(req, res, next) 
{
  const id = +req.params.id;
  const index = variants.findIndex(v => v.id === id);
  let deletedVariant = {};

  // si existe
  if (index !== -1) 
  {
    // lo eliminamos
    deletedVariant = variants.splice(index, 1)[0];
  }

  // y regresamos justo lo que acabamos de eliminar
  res.json({
    message: "Variant deleted",
    data: deletedVariant
  });
}

module.exports = { create, list, find, update, destroy };