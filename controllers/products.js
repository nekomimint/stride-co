const { Product } = require('../models/documents');

// CREATE
async function create(req, res, next) {
    const product = await Product.create(req.body);
    res.status(201).json({
      message: req.__('product.productCreated'),
      data: product
    });
}

// READ toda la lista
async function list(req, res, next) {
    const products = await Product.find();
    res.json({
      message: req.__('product.findProducts'),
      data: products
    });
}

// READ solo uno por ID
async function find(req, res, next) {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: req.__('product.productNotFound')});
    }
    res.json({
      message: req.__('product.productFound'),
      data: product
    });
}

// UPDATE
async function update(req, res, next) {
    const product = await Product.findByIdAndUpdate( req.params.id, req.body, { new: true } );
    if (!product) {
      return res.status(404).json({ message: req.__('product.productNotFound') });
    }
    res.json({
      message: req.__('product.productUpdated'),
      data: product
    });
}

// DELETE
async function destroy(req, res, next) {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: req.__('product.productNotFound') });
    }
    res.json({
      message: req.__('product.productDeleted'),
      data: product
    });
}

module.exports = { create, list, find, update, destroy };