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
  const tripList = useSelector((state) => state.user.tripList) || [];
  const [paidTrips, setPaidTrips] = useState({});
  const dispatch = useDispatch();
  const getTripList = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Vérification des données nécessaires
      if (!userId) {
        console.error("Erreur: userId manquant");
        setError("Information utilisateur manquante. Veuillez vous reconnecter.");
        setLoading(false);
        return;
      }
      
      // Récupération du token
      const token = localStorage.getItem("authToken");
      
      if (!token) {
        console.error("Erreur: Token manquant");
        setError("Vous devez vous reconnecter pour accéder à vos voyages.");
        setLoading(false);
        return;
      }
      
      // URL correcte selon la définition du backend
      const endpoint = `${URL.FETCH_BOOKINGS}/${userId}/trips`;
      console.log("URL appelée:", endpoint);
      
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });
      
      console.log("Statut de réponse:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Erreur ${response.status}:`, errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || errorData.message || `Erreur ${response.status}`);
        } catch (e) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
      }
      
      const data = await response.json();
      console.log("Données reçues:", data);
      
      // Vérification que data est un tableau
      if (!Array.isArray(data)) {
        console.warn("Les données reçues ne sont pas un tableau:", data);
        // Si c'est un objet avec une propriété qui contient le tableau, adaptez le code
        const tripsArray = Array.isArray(data.trips) ? data.trips : 
                          (data.bookings ? data.bookings : []);
        
        setTripList(tripsArray);
        dispatch(setTripList(tripsArray));
      } else {
        // Si c'est déjà un tableau
        setTripList(data);
        dispatch(setTripList(data));
      }
      
    } catch (err) {
      console.error("Erreur lors de la récupération des voyages:", err);
      setError(err.message || "Une erreur est survenue lors du chargement des voyages");
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
      
      // Mettre à jour l'état local des paiements
      const updatedPaidTrips = {
        ...paidTrips,
        [selectedTrip.listingId]: true
      };
      
      setPaidTrips(updatedPaidTrips);
      
      // Sauvegarder dans localStorage pour persistance
      localStorage.setItem('paidTrips', JSON.stringify(updatedPaidTrips));
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
  {tripList.length > 0 ? (
    tripList.map((trip) => (
      <div key={trip.listingId} className="listing-item">
        <ListingCard {...trip.listingDetails} {...trip} />
        <button
          className={paidTrips[trip.listingId] ? "paid-button" : "pay-now-button"}
          onClick={() => !paidTrips[trip.listingId] && handleBooking(trip)}
          disabled={paidTrips[trip.listingId]}
        >
          {paidTrips[trip.listingId] ? "Paid" : "Pay Now"}
        </button>
      </div>
    ))
  ) : (
    <p className="empty-list-message">No trips found.</p>
  )}
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
