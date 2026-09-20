//CREATE
function create(req, res, netx){
    res.status(201).json({
        message: "Role Created",
        data: {}
    });
}

//READ
function list(req, res, next){
    res.json({
        message: "Role list",
        data: [{
            id: 1,
            name: "Admin",
            description: "Administrador del sistema"
        }]
    });
}

function find(req, res, next){
    res.json({
        message: "Role by id",
        data: {}
    });
}

//UPDATE
function update(req, res, next){
    res.json({
        message: "Role updated",
        data: {}
    });
}

//DELETE
function destroy(req, res, next){
    res.json({
        message: "Role deleted",
        data: {}
    });
}

module.exports = {create, list, find, update, destroy};