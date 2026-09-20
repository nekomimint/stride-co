//CREATE
function create(req, res, next){
    res.status(201).json({
        message: "Customer created",
        data: {}
    });
}

//READ
function list(req, res, next) {
  res.json({
    message: "Customer list",
    data: []
  });
}

function find(req, res, next){
    res.json({
    message: "Customer by id",
    data: {}
  });
}

//UPDATE
function update(req, res, next){
    res.json({
        message: "Customer updated",
        data: {}
    });
}

//DELETE
function destroy(req, res, next){
    res.json({
        message: "Customer deleted",
        data: {}
    });
}

module.exports = {create, list, find, update, destroy};