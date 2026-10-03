const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    userId: {type: Number, required: true},
    phone: String,
    email: String,
    
    //Lista de direcciones del cliente Embebdio
    addresses: [
        {
            //Required valida
            type: {type: String, enum: ['SHIPPING', 'BILLING'], required: true},
            street: String,
            number: String,
            city: String,
            state: String,
            zipCode: String,
            country: String
        }
    ]



}, {
    //Configuracion de Mongoose para comportamiento
    timestamps: true

});

//Se convierte en la clase Customer de js
module.exports = mongoose.model('Customer', customerSchema);