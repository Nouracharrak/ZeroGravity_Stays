const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { sendPaymentConfirmationEmail } = require('../config/mailer.js');

// Route to create a Payment Intent
router.post("/create-payment-intent", async (req, res) => {
    const { amount, currency, userEmail, tripDetails } = req.body;

    // Validate userEmail and tripDetails before proceeding
    if (!userEmail || !tripDetails) {
        console.error('Missing userEmail or tripDetails');
        return res.status(400).json({ error: 'Missing userEmail or tripDetails.' });
    }

    try {
        // Create the Payment Intent with Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            metadata: {
                userEmail,     // Store userEmail in metadata
                tripDetails: JSON.stringify(tripDetails) // Store tripDetails in metadata
            }
        });

        // Respond with the client secret for the Payment Intent
        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error("Error creating payment intent:", error);
        res.status(500).json({ error: error.message });
    }
});

// Route pour gérer la réussite du paiement
router.post('/payment-success', async (req, res) => {
    const { paymentIntentId } = req.body; // On s'attend à ce que l'ID de Payment Intent soit fourni

    if (!paymentIntentId) {
        return res.status(400).send('Missing paymentIntentId.');
    }

    try {
        // Récupérer le Payment Intent pour vérifier son état
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        // Vérifier si le paiement a réussi
        if (paymentIntent.status === 'succeeded') {
            const userEmail = paymentIntent.metadata.userEmail;
            const tripDetails = JSON.parse(paymentIntent.metadata.tripDetails);

            // Envoyer l'e-mail de confirmation
            await sendPaymentConfirmationEmail(userEmail, tripDetails);
            console.log("Payment confirmation email sent to:", userEmail);
            res.status(200).send('Payment confirmation email sent successfully.');
        } else {
            res.status(400).send('Payment not successful.');
        }
    } catch (error) {
        console.error("Error processing payment success:", error);
        res.status(500).send('Error processing payment success.');
    }
});

module.exports = router;


