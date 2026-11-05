const {Customer} = require('../models/documents');

// devuelve true si el usuario tiene permiso 'any' o si el cliente le pertenece
// Esta funcion es necesaria pues de lo contrario un cliente 
// podria  ver o actualizar la información de otro cliente
function canAccess(req, customer) {
  if (req.canAny) {
    return true;
  }
  return customer.userId != null && String(customer.userId) === String(req.auth?.sub);
}

// CREATE 
// aqui solo podra entrar admin y sales pues la ruta pide tener permiso any
async function create(req, res, next) {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json({
      message: "Cliente creado",
      data: customer
    });
  } catch (err) {
    next(err);
  }
}


// READ toda la lista
// de igual forma aqui solo podrá entrar admin y sales
async function list(req, res, next) {
  try {
    const customers = await Customer.find();
    res.json({
      message: "Lista de clientes",
      data: customers
    });
  } catch (err) {
    next(err);
  }
}

// READ uno solo
async function find(req, res, next) {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    if (!canAccess(req, customer)) {
      return res.status(403).json({ message: 'No puedes acceder a este cliente' });
    }

    res.json({
      message: "Cliente por id",
      data: customer
    });
  } catch (err) {
    next(err);
  }
}

// UPDATE
async function update(req, res, next) {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    if (!canAccess(req, customer)) {
      return res.status(403).json({ message: 'No puedes modificar este cliente' });
    }

    const changes = { ...req.body };

    // Esta parte es muy importante, si la persona que entra aqui es un simple
    // mortal entonces eliminamos el campo userID de esta forma 
    // evitamos que se reasigne el cliente este cliente a otro usuario
    if (!req.canAny) 
      {
      delete changes.userId;
    }

    customer.set(changes);
    await customer.save(); // save() corre las validaciones del schema

    res.json({
      message: "Cliente actualizado",
      data: customer
    });
  } catch (err) {
    next(err);
  }
}

// DELETE 
// solo el admin podra entrar aqui
async function destroy(req, res, next) {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    res.json({
      message: "Cliente eliminado",
      data: customer
    });
  } catch (err) {
    next(err);
  }
}
module.exports = { create, list, find, update, destroy };