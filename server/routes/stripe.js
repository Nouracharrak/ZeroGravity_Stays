const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { sendPaymentConfirmationEmail } = require('../config/mailer.js');

// Route to create a Payment Intent
router.post("/create-payment-intent", async (req, res) => {
    const { amount, currency, userEmail, tripId } = req.body; // Recevez seulement l'ID et le prix

    // Validate userEmail and tripId before proceeding
    if (!userEmail || !tripId) {
        console.error('Missing userEmail or tripId');
        return res.status(400).json({ error: 'Missing userEmail or tripId.' });
    }

    try {
        // Create the Payment Intent with Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            metadata: {
                userEmail,    // Store userEmail in metadata
                tripId        // Send only the trip ID
                // tripPrice      // Optionnel: stockez le prix du voyage si nécessaire
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
            const tripId = paymentIntent.metadata.tripId; // Récupérez l'ID du voyage
            const tripPrice = paymentIntent.amount; // Vous pouvez utiliser paymentIntent.amount en tant que prix

            // Envoyer l'e-mail de confirmation
            try {
                await sendPaymentConfirmationEmail(userEmail, tripId, tripPrice); // Appel correct avec les paramètres individuels
                console.log("Payment confirmation email sent to:", userEmail);
                
                res.status(200).send({
                    message: 'Payment confirmation email sent successfully.',
                });
            } catch (emailError) {
                console.error("Error sending payment confirmation email:", emailError);
                res.status(500).send("Error sending payment confirmation email.");
            }
        } else {
            res.status(400).send('Payment not successful.');
        }
    } catch (error) {
        console.error("Error processing payment success:", error);
        res.status(500).send('Error processing payment success.');
    }
});

module.exports = router;




