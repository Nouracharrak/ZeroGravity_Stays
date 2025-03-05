// Composant CheckoutForm
import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js"; 
import URL from "../constants/api";
import '../styles/checkoutForm.scss'; 

const CheckoutForm = ({ amount, userEmail, tripDetails, onClose, onPaymentSuccess, onPaymentFailure }) => { 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const stripe = useStripe();
    const elements = useElements();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");
    
        if (!stripe || !elements) {
            return; // S'assurer que Stripe et Elements sont chargés
        }
    
        const cardElement = elements.getElement(CardElement); 
    
        try {
            const response = await fetch(`${URL.BACK_LINK}/stripe/create-payment-intent`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    amount,
                    currency: "eur",
                    userEmail,
                    tripId: tripDetails._id,
                }),
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
            } else if (result.paymentIntent.status === "succeeded") {
                if (onPaymentSuccess) {
                    onPaymentSuccess(result.paymentIntent);
                }
                onClose(); 
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
        <div className="checkout-form-container">
            <form className="checkout-form" onSubmit={handleSubmit}>
                <h2>Payment Information</h2>
                <div className="form-group">
                    <label>
                        Amount (in €):
                        <input
                            type="number"
                            value={(amount / 100).toFixed(2)}
                            readOnly
                            aria-label={`Amount: ${amount / 100} €`}
                        />
                    </label>
                </div>
                <div className="form-group">
                    <CardElement className="card-element" />
                    {error && <div className="error-message">{error}</div>}
                </div>
                <div className="form-actions">
                    <button type="submit" disabled={loading || !stripe}>
                        {loading ? "Processing..." : "Pay Now"}
                    </button>
                    <button type="button" onClick={onClose} className="close-button">Close</button>
                </div>
            </form>
        </div>
    );
};

export default CheckoutForm;
