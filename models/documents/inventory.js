const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    productId: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    
}, {
    // Configuracion de Mongoose para comportamiento
    timestamps: true
});

// Se convierte en la clase Inventory de js
module.exports = mongoose.model('Inventory', inventorySchema);