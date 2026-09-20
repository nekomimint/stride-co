//CREATE
function create(req, res, next){
    res.status(201).json({
        message: "Product created",
        data: {}
    });
}

//READ
function list(req, res, next) {
  res.json({
    message: "Product list",
    data: []
  });
}

function find(req, res, next){
    res.json({
    message: "Product by id",
    data: {}
  });
}

//UPDATE
function update(req, res, next){
    res.json({
        message: "Product updated",
        data: {}
    });
}

//DELETE
function destroy(req, res, next){
    res.json({
        message: "Product deleted",
        data: {}
    });
}

module.exports = {create, list, find, update, destroy};