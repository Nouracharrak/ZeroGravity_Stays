import { useEffect, useState } from "react";
import "../styles/list.scss";
import Loader from "../componenets/Loader";
import Navbar from "../componenets/Navbar";
import Footer from "../componenets/Footer";
import { useDispatch, useSelector } from "react-redux";
import { setReservationList } from "../redux/state";
import ListingCard from "../componenets/ListingCard";
import URL from "../constants/api";

const ReservationList = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const userId = useSelector((state) => state.user?._id);
  const reservationList = useSelector((state) => state.user?.reservationList || []); 

  const dispatch = useDispatch();

  // Fonction pour récupérer la liste des réservations
  const getReservationList = async () => {
    try {
      setLoading(true);
      setError("");
      
      if (!userId) {
        console.error("User ID is missing!");
        setError("Utilisateur non identifié. Veuillez vous connecter.");
        setLoading(false);
        return;
      }

      // Récupération du token d'authentification
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("Token d'authentification manquant");
        setError("Session expirée. Veuillez vous reconnecter.");
        setLoading(false);
        return;
      }

      // Construction de l'URL avec le bon paramètre (hostId)
      const endpoint = `${URL.FETCH_BOOKINGS}/${userId}/reservations`;
      console.log("Endpoint called:", endpoint);

      const response = await fetch(endpoint, { 
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error ${response.status}:`, errorText);
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Raw reservation data:", data);

      // Vérifier et transformer les données si nécessaire
      if (Array.isArray(data)) {
        console.log(`${data.length} réservations trouvées`);
        dispatch(setReservationList(data));
      } else {
        console.warn("Les données reçues ne sont pas un tableau:", data);
        // Si c'est un objet, essayer de trouver un tableau à l'intérieur
        const reservationsArray = data.reservations || [];
        console.log(`${reservationsArray.length} réservations extraites de l'objet`);
        dispatch(setReservationList(reservationsArray));
      }
    } catch (err) {
      console.error("Fetch Reservation List failed!", err);
      setError("Impossible de récupérer vos réservations: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      getReservationList();
    } else {
      setLoading(false);
    }
  }, [userId]);

  // Console.log pour déboguer
  useEffect(() => {
    console.log("Current reservation list from Redux:", reservationList);
  }, [reservationList]);

  // Rendu du composant
  return (
    <>
      <Navbar />
      <h1 className="title-list">Reservations You've Received</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <Loader />
      ) : (
        <div className="list">
          {reservationList && reservationList.length > 0 ? (
            reservationList.map((reservation) => {
              // Extraction sécurisée des propriétés
              const listingInfo = reservation.listingId || {};
              const customerInfo = reservation.customerId || {};
              
              return (
                <div key={reservation._id} className="reservation-item">
                  <div className="reservation-details">
                    <h3>Réservation de {customerInfo.firstName || 'Client'} {customerInfo.lastName || ''}</h3>
                    <p>Email: {customerInfo.email || 'Non disponible'}</p>
                    <p>Dates: {new Date(reservation.startDate).toLocaleDateString()} - {new Date(reservation.endDate).toLocaleDateString()}</p>
                    <p>Prix total: {reservation.totalPrice}€</p>
                  </div>
                  
                  {listingInfo._id && (
                    <ListingCard
                      listingId={listingInfo._id}
                      creator={userId}
                      listingPhotosPaths={listingInfo.listingPhotosPaths || []}
                      city={listingInfo.city || "N/A"}
                      province={listingInfo.province || ""}
                      country={listingInfo.country || ""}
                      category={listingInfo.category || ""}
                      price={listingInfo.price || 0}
                      booking={true}
                    />
                  )}
                </div>
              );
            })
          ) : (
            <p className="empty-list-message">Vous n'avez reçu aucune réservation pour le moment.</p>
          )}
        </div>
      )}
      
      {/* Section de débogage (à supprimer en production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-section">
          <h3>Données brutes (débogage):</h3>
          <pre>{JSON.stringify(reservationList, null, 2)}</pre>
        </div>
      )}
      
      <Footer />
    </>
  );
};

export default ReservationList;
