const { Product } = require('../models/documents');

// CREATE
async function create(req, res, next) {
    const product = await Product.create(req.body);
    res.status(201).json({
      message: "Producto creado",
      data: product
    });
}

// READ toda la lista
async function list(req, res, next) {
    const products = await Product.find();
    res.json({
      message: "Lista de productos",
      data: products
    });
}

// READ solo uno por ID
async function find(req, res, next) {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.json({
      message: "Producto por id",
      data: product
    });
}

// UPDATE
async function update(req, res, next) {
    const product = await Product.findByIdAndUpdate( req.params.id, req.body, { new: true } );
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.json({
      message: "Producto actualizado",
      data: product
    });
}

// DELETE
async function destroy(req, res, next) {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.json({
      message: "Producto eliminado",
      data: product
    });
}

module.exports = { create, list, find, update, destroy };