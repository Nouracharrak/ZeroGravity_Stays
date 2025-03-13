import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/list.scss";
import React, { useEffect, useState } from "react";
import { setTripList } from "../redux/state";
import { useDispatch, useSelector } from "react-redux";
import ListingCard from "../components/ListingCard";
import URL from "../constants/api";
import CheckoutForm from "../components/ChekoutForm";

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
        setError(
          "Information utilisateur manquante. Veuillez vous reconnecter."
        );
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

      const endpoint = `${URL.FETCH_BOOKINGS}/${userId}/trips`;
      console.log("URL appelée:", endpoint);

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Statut de réponse:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Erreur ${response.status}:`, errorText);

        try {
          const errorData = JSON.parse(errorText);
          throw new Error(
            errorData.error || errorData.message || `Erreur ${response.status}`
          );
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
        const tripsArray = Array.isArray(data.trips)
          ? data.trips
          : data.bookings
          ? data.bookings
          : [];

        setTripList(tripsArray);
        dispatch(setTripList(tripsArray));
      } else {
        // Si c'est déjà un tableau
        setTripList(data);
        dispatch(setTripList(data));
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des voyages:", err);
      setError(
        err.message || "Une erreur est survenue lors du chargement des voyages"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Récupérer les voyages payés depuis le localStorage
    try {
      const storedPaidTrips = localStorage.getItem('paidTrips');
      if (storedPaidTrips) {
        setPaidTrips(JSON.parse(storedPaidTrips));
      }
    } catch (error) {
      console.error("Error loading paid trips from localStorage:", error);
    }
  
    // Récupérer la liste des voyages si l'utilisateur est connecté
    if (userId) getTripList();
  }, [userId]);

  const handleBooking = (trip) => {
    setSelectedTrip(trip);
    setOpenCheckout(true);
  };

  const handlePaymentSuccess = async (paymentDetails) => {
    try {
      console.log("Payment successful, details:", paymentDetails);
      
      const token = localStorage.getItem("authToken");
      
      if (!token) {
        console.error("Authentication token missing");
        alert("Authentication token missing. Please log in again.");
        return;
      }
      
      // Utiliser la bonne URL backend
      const response = await fetch(URL.SEND_CONFIRMATION, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          paymentIntentId: paymentDetails.id 
        }),
      });
      
      console.log("Email confirmation response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Email confirmation error details:", errorText);
        throw new Error(`Failed to send confirmation email: ${errorText}`);
      }
      
      // Mettre à jour l'état local des paiements
      const updatedPaidTrips = {
        ...paidTrips,
        [selectedTrip._id]: true  // Utiliser _id ou listingId selon votre modèle
      };
      
      setPaidTrips(updatedPaidTrips);
      localStorage.setItem('paidTrips', JSON.stringify(updatedPaidTrips));
      setPaymentSuccess(true);
      setOpenCheckout(false);
    } catch (error) {
      console.error("Error in payment confirmation process:", error);
      
      // Même en cas d'erreur d'email, confirmer le paiement côté utilisateur
      alert("Payment was successful, but there was an issue with the confirmation email. Your booking is still confirmed.");
      
      // Mettre à jour l'état pour montrer que le paiement a réussi
      setPaidTrips({
        ...paidTrips,
        [selectedTrip._id]: true
      });
      setPaymentSuccess(true);
      setOpenCheckout(false);
    }
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
            <div key={trip._id} className="listing-item">
              {/* Vérifier si listingDetails existe avant d'essayer d'y accéder */}
              {trip.listingDetails ? (
                <>
                  <ListingCard
                    {...trip.listingDetails}
                    startDate={trip.startDate}
                    endDate={trip.endDate}
                    totalPrice={trip.totalPrice}
                  />
                  <button
                    className={
                      paidTrips[trip._id] ? "paid-button" : "pay-now-button"
                    }
                    onClick={() => !paidTrips[trip._id] && handleBooking(trip)}
                    disabled={paidTrips[trip._id]}
                  >
                    {paidTrips[trip._id] ? "Paid" : "Pay Now"}
                  </button>
                </>
              ) : (
                <p>Les détails de cette réservation ne sont plus disponibles</p>
              )}
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
