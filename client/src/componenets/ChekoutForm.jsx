import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js"; 
import URL from "../constants/api";
import '../styles/checkoutForm.scss';

const CheckoutForm = ({ amount, onClose, onPaymentSuccess, onPaymentFailure }) => { 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const stripe = useStripe();
    const elements = useElements();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");

        if (!stripe || !elements) {
            return; // Assurez-vous que Stripe et Elements sont chargés
        }

        const cardElement = elements.getElement(CardElement); // Récupérez l'élément de carte

        try {
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

            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                },
            });

            if (result.error) {
                setError(result.error.message);
                if (onPaymentFailure) onPaymentFailure(result.error.message);
                alert("Payment failed. Please try again.");
            } else if (result.paymentIntent.status === "succeeded") {
                alert("Payment successful!");
                if (onPaymentSuccess) onPaymentSuccess(result.paymentIntent);
                onClose(); // Ferme le modal après le succès du paiement
            }
        } catch (error) {
            console.error(error);
            setError("An error occurred. Please try again.");
            if (onPaymentFailure) onPaymentFailure(error.message);
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
                        value={amount / 100} // Affichage du montant en euros
                        readOnly // Le montant est fixe ici
                    />
                </label>
            </div>
            <CardElement /> 
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <button type="submit" disabled={loading || !stripe}>
                {loading ? "Processing..." : "Pay Now"}
            </button>
            <button type="button" onClick={onClose}>Close</button> 
        </form>
    );
};

export default CheckoutForm;
