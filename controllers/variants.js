const { Variant } = require('../models/documents');

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

module.exports = { create, list, find, update, destroy };