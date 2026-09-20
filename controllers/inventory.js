//CREATE
function create(req, res, next){
    res.status(201).json({
        message: "Inventory created",
        data: {}
    });
}

//READ
function list(req, res, next) {
  res.json({
    message: "Inventory list",
    data: []
  });
}

function find(req, res, next){
    res.json({
    message: "Inventory by id",
    data: {}
  });
}

//UPDATE
function update(req, res, next){
    res.json({
        message: "Inventory updated",
        data: {}
    });
}

//DELETE
function destroy(req, res, next){
    res.json({
        message: "Inventory deleted",
        data: {}
    });
}

module.exports = {create, list, find, update, destroy};