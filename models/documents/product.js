const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, default: "Producto sin nombre" },
    price: { type: Number, default: 0 },
    description: String,
    
}, {
    // Configuracion de Mongoose para comportamiento
    timestamps: true
});

// Se convierte en la clase Product de js
module.exports = mongoose.model('Product', productSchema);