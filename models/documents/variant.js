const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
    productId: { type: Number, required: true },
    sku: { type: String, required: true },
    
    // Atributos específicos de la variante (Embebido)
    attributes: {
        color: String,
        size: String
    },
    
    // Ajuste de precio sobre el original
    additionalPrice: { type: Number, default: 0 }
}, {
    // Configuracion de Mongoose para comportamiento
    timestamps: true
});

// Se convierte en la clase Variant de js
module.exports = mongoose.model('Variant', variantSchema);