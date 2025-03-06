const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

// Routes
const authRoutes = require("./routes/auth.js");
const listingRoutes = require("./routes/listing.js");
const bookingRoutes = require("./routes/booking.js");
const profileRoutes = require("./routes/profile.js");
const userRoutes = require("./routes/user.js");
const contactRoutes = require("./routes/contact.js");
const stripeRoutes = require("./routes/stripe.js");
const adminRoutes = require('./routes/admin.js');

// Charger les variables d'environnement
dotenv.config();

const app = express();

// Liste des origines autorisées
const allowedOrigins = [
  "https://zero-gravity-stays.vercel.app",
  "http://localhost:3000",                 
  "http://localhost:3001"                 
];

// Configuration CORS simplifiée et unifiée
const corsOptions = {
  origin: function (origin, callback) {
    // Pour les requêtes sans origine (comme les appels API mobiles ou Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("CORS origin rejected:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With", "Content-Disposition"],
  credentials: true, // Permet l'envoi des cookies entre origines
  maxAge: 86400,      // Durée pendant laquelle les résultats des requêtes OPTIONS sont mis en cache
  optionsSuccessStatus: 200 // Utilise 200 au lieu de 204 pour les réponses OPTIONS
};

// Applique la configuration CORS
app.use(cors(corsOptions));

// Middleware pour le parsing JSON
app.use(express.json()); // Permet de parser le corps des requêtes en JSON

// Middleware de logging pour le debug
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log("Origin:", req.headers.origin);
  console.log("Headers:", JSON.stringify(req.headers));
  
  // Pour les requêtes OPTIONS, assurez-vous qu'elles retournent un statut 200
  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS request explicitly");
    
    // Assurez-vous que les en-têtes CORS sont corrects
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header("Access-Control-Allow-Credentials", "true");
      res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
      
      // Répondre avec 200 OK pour les requêtes OPTIONS
      return res.status(200).end();
    }
  }
  
  next();
});

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
app.use('/admin', adminRoutes);
app.use("/users", profileRoutes);
app.use("/users", userRoutes);
app.use("/contact", contactRoutes);
app.use("/properties", listingRoutes);
app.use("/bookings", bookingRoutes);
app.use("/stripe", stripeRoutes);

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error("Global error:", err.message);
  console.error(err.stack);
  
  // Répondre avec une erreur 500, mais s'assurer que les en-têtes CORS sont toujours inclus
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
  }
  
  res.status(500).json({ 
    error: "Internal Server Error",
    message: process.env.NODE_ENV === 'production' ? "An unexpected error occurred" : err.message 
  });
});

// Route par défaut pour les requêtes inconnues
app.use((req, res) => {
  // S'assurer que les en-têtes CORS sont aussi inclus pour les 404
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
  }
  
  res.status(404).json({ error: "Not Found", message: "The requested resource was not found" });
});

module.exports = app;

