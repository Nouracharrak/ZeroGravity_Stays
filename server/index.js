const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

// Routes
const { router: authRoutes } = require("./routes/auth.js");
const listingRoutes = require("./routes/listing.js");
const bookingRoutes = require("./routes/booking.js");
const userRoutes = require("./routes/user.js");
const profileRoutes = require("./routes/profile.js");

// Charger les variables d'environnement
dotenv.config();

const app = express();

// Configuration CORS complète
const corsOptions = {
  origin: ["https://zero-gravity-stays.vercel.app", "http://localhost:3001"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],  // Ajout de OPTIONS
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With"],  // Ajout de X-Requested-With
  credentials: true,  // Ajout important pour les cookies/auth
  maxAge: 86400,  // Augmenté à 24 heures pour réduire les preflight requests
};

// Appliquer CORS
app.use(cors(corsOptions));

// Middleware spécial pour les requêtes OPTIONS (préflight)
app.options('*', (req, res) => {
  res.status(204).end();
});

// Middleware pour vérifier que les en-têtes CORS sont bien appliqués
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || 'https://zero-gravity-stays.vercel.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// Middleware pour le parsing JSON
app.use(express.json());

// Connexion à MongoDB
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
  });

// Définir les routes
app.use("/auth", authRoutes);
app.use("/properties", listingRoutes);
app.use("/bookings", bookingRoutes);
app.use("/users", userRoutes);
app.use("/profile", profileRoutes);

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Internal Server Error");
});

// Route par défaut pour les requêtes inconnues
app.use((req, res) => {
  res.status(404).send("Page non trouvée");
});

module.exports = app;
