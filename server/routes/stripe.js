const express = require("express");
const router = express.Router();
const { createPaymentIntent, handlePaymentSuccess } = require("../controllers/stripeController");
// const { verifyToken } = require("../middleware/auth");  // Assure-toi d'importer ton middleware

// Route pour créer un Payment Intent (avec vérification du token)
router.post("/create-payment-intent", createPaymentIntent);

// Route pour gérer la réussite du paiement (avec vérification du token)
router.post("/payment-success", handlePaymentSuccess);

module.exports = router;




