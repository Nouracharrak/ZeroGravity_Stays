import Loader from '../componenets/Loader';
import Navbar from '../componenets/Navbar';
import Footer from "../componenets/Footer";
import '../styles/list.scss';
import React, { useEffect, useState } from 'react';
import { setTripList } from '../redux/state';
import { useDispatch, useSelector } from 'react-redux';
import ListingCard from '../componenets/ListingCard';
import URL from "../constants/api";
import CheckoutForm from '../componenets/ChekoutForm'; // Veuillez vérifier l'orthographe

const TripList = () => {
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [openCheckout, setOpenCheckout] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState(''); // Gérer les erreurs

  const userId = useSelector((state) => state.user._id);
  const userEmail = useSelector((state) => state.user.email);
  const tripList = useSelector((state) => state.user.tripList);
  const dispatch = useDispatch();

  const getTripList = async () => {
    try {
      const response = await fetch(`${URL.FETCH_USERS}/${userId}/trips`, {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      dispatch(setTripList(data));
    } catch (err) {
      console.log('Fetch Trip List Failed', err.message);
      setError('Failed to fetch trip list. Please try again later.'); // Mettez à jour l'état d'erreur
    } finally {
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

  const handlePaymentSuccess = (paymentDetails) => {
    setPaymentSuccess(true);
    setOpenCheckout(false);
  };

  const handlePaymentFailure = (errorMessage) => {
    setPaymentSuccess(false); // Réinitialiser le statut de paiement
    alert("Payment failed: " + errorMessage);
  };

  return (
    loading ? (
      <Loader />
    ) : (
      <>
        <Navbar />
        <h1 className="title-list">Your Trip List</h1>
        {error && <div className="error-message">{error}</div>} {/* Afficher le message d'erreur */}
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
            <h2 className="centered-title">Finalize Payment for Booking</h2>
              <CheckoutForm 
                amount={selectedTrip.totalPrice} 
                userEmail={userEmail} 
                tripDetails={selectedTrip}
                onClose={() => setOpenCheckout(false)} 
                onPaymentSuccess={handlePaymentSuccess} 
                onPaymentFailure={handlePaymentFailure} 
              />
            </div>
          </div>
        )}

        {paymentSuccess && (
          <div className="payment-success">
            <h2>Payment Successful!</h2>
            <p>Thank you for your payment.</p>
            <p>Trip Details:</p>
            <ul>
              <li>Destination: {selectedTrip.listingDetails.city}, {selectedTrip.listingDetails.province}</li>
              <li>Price: {selectedTrip.totalPrice} €</li>
              <li>Booking Dates: {selectedTrip.startDate} to {selectedTrip.endDate}</li>
            </ul>
            <button onClick={() => setPaymentSuccess(false)}>Close</button>
          </div>
        )}

        <Footer />
      </>
    )
  );
};

export default TripList;

