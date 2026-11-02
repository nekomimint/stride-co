const { Inventory } = require('../models/documents');


// CREATE
async function create(req, res, next) {
    const item = await Inventory.create(req.body);
    res.status(201).json({
      message: "Inventario creado",
      data: item
    });
}

// READ todo
async function list(req, res, next) {
    const inventory = await Inventory.find();
    res.json({
      message: "Lista de inventario",
      data: inventory
    });
}

// READ solo uno
async function find(req, res, next) {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
          return res.status(404).json({ message: "Inventario no encontrado" });
        }
        res.json({
            message: "Inventario por id",
            data: item
        });
}

// UPDATE
async function update(req, res, next) {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    // new: rue devuelve el documento ya actualizado
    if (!item) {
      return res.status(404).json({ message: "Inventario no encontrado" });
    }
    res.json({
      message: "Inventario actualizado",
      data: item
    });
}

// DELETE
async function destroy(req, res, next) {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Inventario no encontrado" });
      }
      res.json({
        message: "Inventario eliminado",
        data: item
      });
}

module.exports = { create, list, find, update, destroy };