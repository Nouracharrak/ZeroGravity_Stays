import Loader from "../componenets/Loader";
import Navbar from "../componenets/Navbar";
import Footer from "../componenets/Footer";
import "../styles/list.scss";
import React, { useEffect, useState } from "react";
import { setTripList } from "../redux/state";
import { useDispatch, useSelector } from "react-redux";
import ListingCard from "../componenets/ListingCard";
import URL from "../constants/api";
import CheckoutForm from "../componenets/ChekoutForm";

const TripList = () => {
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [openCheckout, setOpenCheckout] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState("");
  const userId = useSelector((state) => state.user._id);
  const userEmail = useSelector((state) => state.user.email);
  const tripList = useSelector((state) => state.user.tripList);
  const [paidTrips, setPaidTrips] = useState({});

  const dispatch = useDispatch();

  const getTripList = async () => {
    try {
      const response = await fetch(`${URL.FETCH_USERS}/${userId}/trips`);
      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      dispatch(setTripList(data));
      
      // Initialiser l'état des paiements
      const paidStatus = {};
      data.forEach(trip => {
        // Supposons que votre API renvoie un champ 'isPaid' pour chaque voyage
        paidStatus[trip.listingId] = trip.isPaid || false;
      });
      setPaidTrips(paidStatus);
    } catch (err) {
      console.log('Fetch Trip List Failed', err.message);
      setError('Failed to fetch trip list. Please try again later.');
    } finally {
      setLoading(false);
    }
  };  
  useEffect(() => {
    if (userId) getTripList();
  }, [userId]);

  const handleBooking = (trip) => {
    setSelectedTrip(trip);
    setOpenCheckout(true);
  };

  const handlePaymentSuccess = async (paymentDetails) => {
    try {
      const response = await fetch(URL.SEND_CONFIRMATION, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentIntentId: paymentDetails.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to send payment confirmation email");
      }
      // Marquer le voyage comme payé
      setPaidTrips((prev) => ({
        ...prev,
        [selectedTrip.listingId]: true,
      }));

      setPaymentSuccess(true);
      setOpenCheckout(false);
    } catch (error) {
      console.error("Error sending email confirmation:", error);
      alert("Failed to send email confirmation. Please try again.");
    }
  };

  const handlePaymentFailure = (errorMessage) => {
    setPaymentSuccess(false);
    alert("Payment failed: " + errorMessage);
  };

  return loading ? (
    <Loader />
  ) : (
    <>
      <Navbar />
      <h1 className="title-list">Your Trip List</h1>
      {error && <div className="error-message">{error}</div>}
      <div className="list">
        {tripList.map((trip) => (
          <div key={trip.listingId} className="listing-item">
            <ListingCard {...trip.listingDetails} {...trip} />
            <button
              className={
                paidTrips[trip.listingId] ? "paid-button" : "pay-now-button"
              }
              onClick={() => !paidTrips[trip.listingId] && handleBooking(trip)}
              disabled={paidTrips[trip.listingId]}
            >
              {paidTrips[trip.listingId] ? "Paid" : "Pay Now"}
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
            <li>
              Destination: {selectedTrip.listingDetails.city},{" "}
              {selectedTrip.listingDetails.province}
            </li>
            <li>Price: {selectedTrip.totalPrice} €</li>
            <li>
              Booking Dates: {selectedTrip.startDate} to {selectedTrip.endDate}
            </li>
          </ul>
          <button onClick={() => setPaymentSuccess(false)}>Close</button>
        </div>
      )}

      <Footer />
    </>
  );
};

export default TripList;
