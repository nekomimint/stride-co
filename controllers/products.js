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