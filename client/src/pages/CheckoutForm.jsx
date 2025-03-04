// CheckoutForm.js
import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import URL from "../constants/api";

const stripePromise = loadStripe("pk_test_51Qz1XhH4A3C3bxRrvtv45UUq516BqFFipdtQqZ6m7c0VQlg6Fuu0vOkOXsi5ZYduSvRSBMBAqBJjGEJO6ByuiNce00mNKMKuKp");

const CheckoutForm = () => {
    const [amount, setAmount] = useState(1000); // Montant en cents (par exemple, 10.00 $)
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(""); // Réinitialiser l'erreur à chaque soumission

        const stripe = await stripePromise;

        try {
            // Appeler votre API pour créer un Payment Intent
            const response = await fetch(`${URL.BACK_LINK}/stripe/create-payment-intent`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ amount, currency: "usd" }),
            });

            if (!response.ok) {
                throw new Error("Failed to create payment intent");
            }

            const { clientSecret } = await response.json();

            // Utiliser le clientSecret pour finaliser le paiement
            const result = await stripe.confirmCardPayment(clientSecret);

            if (result.error) {
                setError(result.error.message);
                alert("Payment failed. Please try again.");
            } else if (result.paymentIntent.status === "succeeded") {
                alert("Payment successful!");
            }
        } catch (error) {
            console.error(error);
            setError("An error occurred. Please try again."); // Gérer les erreurs d'appel API
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>
                    Amount (in €):
                    <input
                        type="number"
                        value={amount / 100}
                        onChange={(e) => setAmount(e.target.value * 100)}
                        min="1"
                        required
                    />
                </label>
            </div>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <button type="submit" disabled={loading}>
                {loading ? "Processing..." : "Pay Now"}
            </button>
        </form>
    );
};

export default CheckoutForm;

