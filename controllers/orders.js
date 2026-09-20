//CREATE
function create(req, res, next){
    res.status(201).json({
        message: "Order created",
        data: {}
    });
}

//READ
function list(req, res, next) {
  res.json({
    message: "Order list",
    data: []
  });
}

function find(req, res, next){
    res.json({
    message: "Order by id",
    data: {}
  });
}

//UPDATE
function update(req, res, next){
    res.json({
        message: "Order updated",
        data: {}
    });
}

//DELETE
function destroy(req, res, next){
    res.json({
        message: "Order deleted",
        data: {}
    });
}

module.exports = {create, list, find, update, destroy};