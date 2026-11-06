const Inventory = require('../models/relationals/Inventory');
const ProductVariant = require('../models/relationals/ProductVariant');

// CREATE

// body: { variant_id, stock, reserved }
async function create(req, res, next)
{
  try
  {
    const { variant_id, stock, reserved } = req.body;

    // la variante debe existir
    const variant = await ProductVariant.findByPk(variant_id);
    if (!variant) {
      return res.status(404).json({
        message: req.__('variant.variantNotFound'),
        data: null
      });
    }

    // la relacion es 1 a 1, o sea una variante solo puede tener un inventario
    const existing = await Inventory.findOne({ where: { variant_id } });
    if (existing) {
      return res.status(409).json({
        message: req.__('variant.variantInInventory'),
        data: existing
      });
    }

    // lo reservado nunca puede ser mayor al stock
    if ((reserved || 0) > (stock || 0)) {
      return res.status(400).json({
        message: req.__('inventory.reservedGreaterStock'),
        data: null
      });
    }

    const inventory = await Inventory.create(req.body);
    res.status(201).json({ message: req.__('inventory.inventoryCreated'), data: inventory });
  }
  catch (err)
  {
    next(err);
  }
}
// READ todos
async function list(req, res, next)
{
  try
  {
    const inventories = await Inventory.findAll({
      include: { model: ProductVariant, as: 'variant' }
    });
    res.json({ message: req.__('inventory.findInventories'), data: inventories });
  }
  catch (err)
  {
    next(err);
  }
}
// READ por id
async function find(req, res, next)
{
  try
  {
    const id = req.params.id;
    const inventory = await Inventory.findByPk(id, {
      include: { model: ProductVariant, as: 'variant' }
    });

    if (!inventory) {
      return res.status(404).json({
        message: req.__('inventory.inventoryNotFound'),
        data: null
      });
    }

    res.json({
      message: req.__('inventory.inventoryFound'),
      data: inventory
    });
  }
  catch (err)
  {
    next(err);
  }
}
// UPDATE
async function update(req, res, next)
{
  try
  {
    const id = req.params.id;
    const stock = req.body.stock;
    const reserved = req.body.reserved;
    const inventory = await Inventory.findByPk(id);

    if (!inventory) {
      return res.status(404).json({
        message: req.__('inventory.inventoryNotFound')
      });
    }

    let changes = {};

    // Actualizamos los campos que se hayan enviado
    changes.stock = stock !== undefined ? stock : inventory.stock;
    changes.reserved = reserved !== undefined ? reserved : inventory.reserved;

    if (changes.reserved > changes.stock) {
      return res.status(400).json({
        message: req.__('inventory.reservedGreaterStock')
      });
    }

    await inventory.update(changes);

    res.json({
      message: req.__('inventory.inventoryUpdated'),
      data: inventory
    });
  }
  catch (err)
  {
    next(err);
  }
}
// DELETE
async function destroy(req, res, next)
{
  try
  {
    const id = req.params.id;
    const inventory = await Inventory.findByPk(id);

    if (!inventory) {
      return res.status(404).json({
        message: req.__('inventory.inventoryNotFound')
      });
    }

    await inventory.destroy();

    res.json({
      message: req.__('inventory.inventoryDeleted'),
      data: inventory
    });
  }
  catch (err)
  {
    next(err);
  }
}

module.exports = { create, list, find, update, destroy };