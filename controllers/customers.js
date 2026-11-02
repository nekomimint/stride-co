const {Customer} = require('../models/documents');


// CREATE
async function create(req, res, next) {
    const customer = await Customer.create(req.body);
    res.status(201).json({
      message: req.__('customers.customerCreated'),
      data: customer
    });
} 


// READ toda la lista
async function list(req, res, next) {
    const customers = await Customer.find();
    res.json({
      message: req.__('customers.findCustomers'),
      data: customers
    });
} 


// READ uno solo
async function find(req, res, next) {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: req.__('customers.customerNotFound')});
    }
    res.json({
      message: req.__('customers.customerFound'),
      data: customer
    });
} 

// UPDATE
async function update(req, res, next) {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // Devuelve el documento actualizado
    );
    if (!customer) {
      return res.status(404).json({ message: req.__('customers.customerNotFound') });
    }
    res.json({
      message: req.__('customers.customerUpdated'),
      data: customer
    });
} 

// DELETE
async function destroy(req, res, next) {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: req.__('customers.customerNotFound') });
    }
    res.json({
      message: req.__('customers.customerDeleted'),
      data: customer
    });
}

module.exports = { create, list, find, update, destroy };