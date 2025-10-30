// server.js
const express = require('express');
const mongoose = require('mongoose');
const Meal = require('./models/Meal'); // Importa el modelo
const app = express();
app.use(express.json()); 

// ===================================
// 1. CONEXIÓN A MONGODB
// ===================================
// MONGO_URI es la conexión definida en docker-compose.yml
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/NutriTrackDB';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Conectado a MongoDB (NutriTrackDB) con éxito.'))
  .catch(err => console.error('Error de conexión a MongoDB:', err.message));

// ===================================
// 2. ENDPOINTS CRUD PARA MEALS
// ===================================

// C (CREATE): POST /api/meals
app.post('/api/meals', async (req, res) => {
    try {
        const newMeal = new Meal(req.body);
        await newMeal.save();
        res.status(201).send(newMeal); 
    } catch (error) {
        res.status(400).send({ message: 'Error al crear la comida.', error: error.message });
    }
});

// R (READ): GET /api/meals/:userId
app.get('/api/meals/:userId', async (req, res) => {
    try {
        const meals = await Meal.find({ userId: req.params.userId }).sort({ date: -1 });
        
        if (meals.length === 0) {
            return res.status(404).send({ message: 'No se encontraron registros para este usuario.' });
        }
        res.send(meals);
    } catch (error) {
        res.status(500).send({ message: 'Error al obtener los registros.', error: error.message });
    }
});

// D (DELETE): DELETE /api/meals/:id
app.delete('/api/meals/:id', async (req, res) => {
    try {
        const result = await Meal.findByIdAndDelete(req.params.id);
        
        if (!result) {
            return res.status(404).send({ message: 'Registro de comida no encontrado.' });
        }
        res.send({ message: 'Registro de comida eliminado con éxito.' });
    } catch (error) {
        res.status(500).send({ message: 'Error al eliminar el registro.', error: error.message });
    }
});


// ===================================
// 3. INICIO DEL SERVIDOR
// ===================================
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor API REST (NutriTrack) corriendo en puerto ${PORT}`);
});