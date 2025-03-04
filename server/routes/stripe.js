const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); 
const { sendPaymentConfirmationEmail } = require('../config/mailer.js');

// Route pour créer un Payment Intent
router.post("/create-payment-intent", async (req, res) => {
    const { amount, currency, userEmail, tripDetails } = req.body; // Ajoutez ici userEmail et tripDetails

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
        });

        // Si le paiement est réussi, envoyer l'e-mail
        if (paymentIntent.status === 'succeeded') {
            await sendPaymentConfirmationEmail(userEmail, tripDetails);
        }

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Optionnel : Route séparée pour l'envoi d'e-mail après confirmation de paiement
router.post('/payment-success', async (req, res) => {
    const { userEmail, tripDetails } = req.body;

    try {
        await sendPaymentConfirmationEmail(userEmail, tripDetails);
        res.status(200).send('Email de confirmation de paiement envoyé.');
    } catch (error) {
        res.status(500).send('Erreur lors de l\'envoi de l\'email de confirmation de paiement.');
    }
});

module.exports = router;

