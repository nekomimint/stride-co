const Product = require("../models/relationals/Product");
const ProductVariant = require("../models/relationals/ProductVariant");

// list
async function list(req, res, next) {
    try {
        const products = await Product.findAll({ include: { model: ProductVariant, as: 'variants' } });
        res.json({ message: 'Products listed', data: products });
    } catch (err) {
        next(err);
    }
}

// find
async function find(req, res, next) {
    try {
        const product = await Product.findByPk(req.params.id, { include: { model: ProductVariant, as: 'variants' } });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product found', data: product });
    } catch (err) {
        next(err);
    }
}

// create
async function create(req, res, next) {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({ message: 'Product created', data: product });
    } catch (err) {
        next(err);
    }
}

// update
async function update(req, res, next) {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        await product.update(req.body);
        res.json({ message: 'Product updated', data: product });
    } catch (err) {
        next(err);
    }
}

// destroy
async function destroy(req, res, next) {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        await product.destroy();
        res.json({ message: 'Product deleted' });
    } catch (err) {
        next(err);
    }
}


module.exports = { create, list, find, update, destroy };


//const { Product } = require('../models/documents');

// Lo estabamos trabajando como modelo documental
// pero era parte del relacional


// // CREATE
// async function create(req, res, next) {
//     const product = await Product.create(req.body);
//     res.status(201).json({
//       message: "Producto creado",
//       data: product
//     });
// }

// // READ toda la lista
// async function list(req, res, next) {
//     const products = await Product.find();
//     res.json({
//       message: "Lista de productos",
//       data: products
//     });
// }

// // READ solo uno por ID
// async function find(req, res, next) {
//     const product = await Product.findById(req.params.id);
//     if (!product) {
//       return res.status(404).json({ message: "Producto no encontrado" });
//     }
//     res.json({
//       message: "Producto por id",
//       data: product
//     });
// }

// // UPDATE
// async function update(req, res, next) {
//     const product = await Product.findByIdAndUpdate( req.params.id, req.body, { new: true } );
//     if (!product) {
//       return res.status(404).json({ message: "Producto no encontrado" });
//     }
//     res.json({
//       message: "Producto actualizado",
//       data: product
//     });
// }

// // DELETE
// async function destroy(req, res, next) {
//     const product = await Product.findByIdAndDelete(req.params.id);
//     if (!product) {
//       return res.status(404).json({ message: "Producto no encontrado" });
//     }
//     res.json({
//       message: "Producto eliminado",
//       data: product
//     });
// }

//module.exports = { create, list, find, update, destroy };