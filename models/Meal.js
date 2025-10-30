// models/Meal.js
const mongoose = require('mongoose');

// Definimos el esquema de una comida
const mealSchema = new mongoose.Schema({
    // Referencia al usuario (usamos ObjectId para la relación)
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true 
    },
    // El campo 'type' (desayuno, comida, cena, etc.)
    type: { 
        type: String, 
        required: true 
    }, 
    // Los 'items' que contiene la comida (usamos Array para subdocumentos)
    items: { 
        type: Array, 
        required: true 
    }, 
    // El total de calorías (para reportes)
    totalCalories: { 
        type: Number, 
        required: true 
    },
    // La fecha y hora de la comida
    date: { 
        type: Date, 
        default: Date.now 
    },
});

// Mongoose usará 'meals' como el nombre de la colección en MongoDB
module.exports = mongoose.model('Meal', mealSchema);