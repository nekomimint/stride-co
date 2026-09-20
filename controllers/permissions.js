//CREATE
function create(req, res, next) { 
    res.status(201).json({ 
        message: "Permission created",
         data: {} 
    }); 
}

//READ
function list(req, res, next) {
    res.json({
        message: "Permissions list",
        data: [{
             id: 1, 
             key: "CREATE_USER", 
             description: "Permite crear usuarios" }]
    });
}

function find(req, res, next) { 
    res.json({
        message: "Permission by id",
         data: {} 
    }); 
}

//UPDATE
function update(req, res, next) {
    res.json({ 
        message: "Permission updated", 
        data: {} 
    }); 
}

//DELETE
function destroy(req, res, next) { 
    res.json({ 
        message: "Permission deleted", 
        data: {} 
    }); 
}

module.exports = { create, list, find, update, destroy };