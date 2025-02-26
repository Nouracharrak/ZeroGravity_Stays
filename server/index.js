const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const cors = require('cors');
const {router: authRoutes} = require('./routes/auth.js');
const listingRoutes = require('./routes/listing.js');
const path = require('path');
const bookingRoutes = require('./routes/booking.js');  
const userRoutes = require('./routes/user.js');

// Middleware
app.use(express.json()); 
app.use(cors({
    origin: ['https://zero-gravity-stays.vercel.app', 'http://localhost:3000', 'http://localhost:3001'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    maxAge: 3600
  }));
  
  
app.use(express.static('uploads')); 

// Serve files from the 'public/uploads' directory under the '/uploads' URL path
// console.log('Serving static files from:', path.join(__dirname, '../../public/uploads'));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("MongoDB connected");
    const PORT = 3001; 
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 
})
.catch((err) => {
    console.error("MongoDB connection error:", err.message); 
});

// Define routes
app.use("/auth", authRoutes);
app.use("/properties", listingRoutes); 
app.use("/bookings", bookingRoutes); 
app.use("/users", userRoutes);

// Gestion d'erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Erreur interne du serveur');
});

// Route par défaut
app.use((req, res) => {
    res.status(404).send('Page non trouvée');
});

module.exports = app;
