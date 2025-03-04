import Loader from '../componenets/Loader';
import Navbar from '../componenets/Navbar';
import Footer from "../componenets/Footer";
import '../styles/list.scss';
import React, { useEffect, useState } from 'react';
import { setTripList } from '../redux/state';
import { useDispatch, useSelector } from 'react-redux';
import ListingCard from '../componenets/ListingCard';
import URL from "../constants/api";
import CheckoutForm from '../componenets/ChekoutForm';

const TripList = () => {
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [openCheckout, setOpenCheckout] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const userId = useSelector((state) => state.user._id);
  const tripList = useSelector((state) => state.user.tripList);
  const dispatch = useDispatch();

  const getTripList = async () => {
    try {
      const response = await fetch(`${URL.FETCH_USERS}/${userId}/trips`, {
        method: 'GET',
      });
      const data = await response.json();
      dispatch(setTripList(data));
      setLoading(false);
    } catch (err) {
      console.log('Fetch Trip List Failed', err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      getTripList();
    }
  }, [userId]);

  const handleBooking = (trip) => {
    setSelectedTrip(trip);
    setOpenCheckout(true);
  };

  const handlePaymentSuccess = async (paymentDetails) => {
    setPaymentSuccess(paymentDetails);
    setOpenCheckout(false);
    
    // Envoyer le récapitulatif de paiement par email
    await sendPaymentConfirmation(paymentDetails);
  };

  const sendPaymentConfirmation = async (paymentDetails) => {
    // Exemple de requête à votre backend pour envoyer un email de confirmation
    try {
      await fetch(`${URL.SEND_CONFIRMATION}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'user@example.com', // Mettez l'adresse email de l'utilisateur ici
          tripDetails: paymentDetails,
        }),
      });
    } catch (error) {
      console.error('Error sending confirmation email:', error);
    }
  };

  const handlePaymentFailure = (errorMessage) => {
    alert("Payment failed: " + errorMessage);
  };

  return loading ? (
    <Loader />
  ) : (
    <>
      <Navbar />
      <h1 className="title-list">Your Trip List</h1>
      <div className="list">
        {tripList.map((trip) => (
          <div key={trip.listingId} className="listing-item">
            <ListingCard {...trip.listingDetails} {...trip} />
            <button 
              className="pay-now-button" 
              onClick={() => handleBooking(trip)}
            >
              Pay Now
            </button>
          </div>
        ))}
      </div>

      {openCheckout && selectedTrip && (
        <div className="checkout-overlay">
          <div className="checkout-modal">
            <h2>Finalize Payment for Booking</h2>
            <CheckoutForm 
              amount={selectedTrip.totalPrice} 
              onClose={() => setOpenCheckout(false)} 
              onPaymentSuccess={handlePaymentSuccess} 
              onPaymentFailure={handlePaymentFailure} 
            />
          </div>
        </div>
      )}

      {paymentSuccess && (
        <div className="payment-summary">
          <h2>Payment Successful!</h2>
          <p>Thank you for your payment.</p>
          <p>Trip Details:</p>
          <ul>
            <li>Destination: {selectedTrip.listingDetails.city}, {selectedTrip.listingDetails.province}</li>
            <li>Price: ${selectedTrip.totalPrice}</li>
            <li>Booking Dates: {selectedTrip.startDate} to {selectedTrip.endDate}</li>
          </ul>
          <button onClick={() => setPaymentSuccess(false)}>Close</button>
        </div>
      )}

      <Footer />
    </>
  );
};

export default TripList;