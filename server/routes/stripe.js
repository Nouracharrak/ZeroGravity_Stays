// routes/stripe.js
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); 
const {sendPaymentConfirmationEmail} = require('../config/mailer.js');

// Route pour créer un Payment Intent
router.post("/create-payment-intent", async (req, res) => {
    const { amount, currency } = req.body;

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
        });
        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/payment-success', async (req, res) => {
    const { userEmail, tripDetails } = req.body; // Supposons que userEmail et tripDetails viennent de votre logique de paiement
  
    try {
      await sendPaymentConfirmationEmail(userEmail, tripDetails);
      res.status(200).send('Email de confirmation de paiement envoyé.');
    } catch (error) {
      res.status(500).send('Erreur lors de l\'envoi de l\'email de confirmation de paiement.');
    }
  });

module.exports = router;
