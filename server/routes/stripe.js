const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { sendPaymentConfirmationEmail } = require('../config/mailer.js');

// Route pour créer un Payment Intent
router.post("/create-payment-intent", async (req, res) => {
    const { amount, currency, userEmail, tripId } = req.body;

    // Validation des champs requis
    if (!userEmail || !tripId) {
        console.error('Missing userEmail or tripId');
        return res.status(400).json({ error: 'Missing userEmail or tripId.' });
    }

    try {
        // Créer le Payment Intent avec Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount,        // Montant en cents (ou la plus petite unité de la devise)
            currency,
            metadata: {
                userEmail,  // Stocker l'email de l'utilisateur dans les métadonnées
                tripId      // Envoyer uniquement l'ID du voyage
            }
        });

        // Répondre avec le client secret pour le Payment Intent
        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error("Error creating payment intent:", error);
        res.status(500).json({ error: error.message });
    }
});

// Route pour gérer la réussite du paiement
router.post('/payment-success', async (req, res) => {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
        return res.status(400).send('Missing paymentIntentId.');
    }

    try {
        // Récupérer le Payment Intent pour vérifier son état
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        // Vérifier si le paiement a réussi
        if (paymentIntent.status === 'succeeded') {
            const userEmail = paymentIntent.metadata.userEmail; // Récupérez l'email
            const tripId = paymentIntent.metadata.tripId; // Récupérez l'ID du voyage
            const tripPrice = paymentIntent.amount; 

            // Envoyer l'e-mail de confirmation
            try {
                await sendPaymentConfirmationEmail(userEmail, tripId, tripPrice);
                console.log("Payment confirmation email sent to:", userEmail);
                
                // Envoyer une réponse de succès
                res.status(200).send({
                    message: 'Payment confirmation email sent successfully.',
                });
            } catch (emailError) {
                console.error("Error sending payment confirmation email:", emailError);
                res.status(500).send("Error sending payment confirmation email.");
            }
        } else {
            res.status(400).send('Payment not successful.'); // Paiement échoué
        }
    } catch (error) {
        console.error("Error processing payment success:", error);
        res.status(500).send('Error processing payment success.');
    }
});

module.exports = router;





