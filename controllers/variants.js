//CREATE
function create(req, res, next){
    res.status(201).json({
        message: "Variant created",
        data: {}
    });
}

//READ
function list(req, res, next) {
  res.json({
    message: "Variant list",
    data: []
  });
}

function find(req, res, next){
    res.json({
    message: "Variant by id",
    data: {}
  });
}

//UPDATE
function update(req, res, next){
    res.json({
        message: "Variant updated",
        data: {}
    });
}

//DELETE
function destroy(req, res, next){
    res.json({
        message: "Variant deleted",
        data: {}
    });
}

module.exports = {create, list, find, update, destroy};