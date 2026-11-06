const Product = require("../models/relationals/Product");
const ProductVariant = require("../models/relationals/ProductVariant");

// list
async function list(req, res, next) {
  try {
    const variants = await ProductVariant.findAll({
      include: { model: Product, as: 'product' }
    });
    res.json({ message: req.__('variant.findVariant'), data: variants });
  } catch (err) {
    next(err);
  }
}

// find
async function find(req, res, next) {
  try {
    const variant = await ProductVariant.findByPk(req.params.id, {
      include: { model: Product, as: 'product' }
    });
    if (!variant) return res.status(404).json({ message: req.__('variant.variantNotFound') });
    res.json({ message: req.__('variant.variantFound'), data: variant });
  } catch (err) {
    next(err);
  }
}

// create
async function create(req, res, next) {
  try {
    const variant = await ProductVariant.create(req.body);
    res.status(201).json({ message: req.__('variant.variantCreated'), data: variant });
  } catch (err) {
    next(err);
  }
}

// update
async function update(req, res, next) {
  try {
    const variant = await ProductVariant.findByPk(req.params.id);
    if (!variant) return res.status(404).json({ message: req.__('variant.variantNotFound') });
    await variant.update(req.body);
    res.json({ message: req.__('variant.variantUpdated'), data: variant });
  } catch (err) {
    next(err);
  }
}

// destroy
async function destroy(req, res, next) {
  try {
    const variant = await ProductVariant.findByPk(req.params.id);
    if (!variant) return res.status(404).json({ message: req.__('variant.variantNotFound') });
    await variant.destroy();
    res.json({ message: req.__('variant.variantDeleted') });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, find, update, destroy };





// Esto estaba como modelo documental
// era con el modelo relacional:
/* const { Variant } = require('../models/documents');

// CREATE
async function create(req, res, next) {
    const variant = await Variant.create(req.body);
    res.status(201).json({
      message: "Variante creada",
      data: variant
    });
}

// READ toda la lista
async function list(req, res, next) {
    const variants = await Variant.find();
    res.json({
      message: "Lista de variantes",
      data: variants
    });
}

// READ solo una por ID
async function find(req, res, next) {
    const variant = await Variant.findById(req.params.id);
    if (!variant) {
      return res.status(404).json({ message: "Variante no encontrada" });
      }
      res.json({
        message: "Variante por id",
        data: variant
      });
}

// UPDATE
async function update(req, res, next) {
    const variant = await Variant.findByIdAndUpdate( req.params.id, req.body, { new: true } );
    if (!variant) {
      return res.status(404).json({ message: "Variante no encontrada" });
    }
    res.json({
      message: "Variante actualizada",
      data: variant
    });
}

// DELETE
async function destroy(req, res, next) {
    const variant = await Variant.findByIdAndDelete(req.params.id);
    if (!variant) {
      return res.status(404).json({ message: "Variante no encontrada" });
    }
    res.json({
      message: "Variante eliminada",
      data: variant
    });
}

module.exports = { create, list, find, update, destroy }; */