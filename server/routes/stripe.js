const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/stripeController");
const { verifyToken } = require("../middleware/auth");

// Route pour créer un Payment Intent
router.post("/create-payment-intent", verifyToken, paymentController.createPaymentIntent);

// Route pour gérer la réussite du paiement
router.post('/payment-success', verifyToken, paymentController.handlePaymentSuccess);

module.exports = router;






