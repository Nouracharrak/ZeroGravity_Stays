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
  const userId = useSelector((state) => state.user?._id);  // Assurez-vous que _id est bien défini
  const reservationList = useSelector((state) => state.user?.reservationList); // Utilisation de l'opérateur optional chaining pour éviter des erreurs si user ou reservationList sont undefined.

  const dispatch = useDispatch();

  // Fonction pour récupérer la liste des réservations
  const getReservationList = async () => {
    try {
      if (!userId) {
        console.log("User ID is missing!");  // Vérification si userId est bien récupéré
        return;
      }

      const response = await fetch(
        `${URL.FETCH_USERS}/${userId}/reservations`,  // Assurez-vous que cette URL est correcte
        { method: "GET" }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch reservations");  // Gestion des erreurs réseau
      }

      const data = await response.json();
      console.log("Fetched reservation list:", data); // Vérification de la réponse

      // Assurez-vous que les données sont un tableau valide
      if (Array.isArray(data)) {
        dispatch(setReservationList(data)); // Mise à jour du state
      } else {
        console.error("La réponse de l'API n'est pas un tableau valide");
      }

      setLoading(false);
    } catch (err) {
      console.log("Fetch Reservation List failed!", err.message);
      setLoading(false);
    }
  };

  // Assurez-vous que la requête est effectuée une fois que `userId` est disponible
  useEffect(() => {
    console.log("userId:", userId);  // Ajout de journalisation pour vérifier si userId est bien défini
    if (userId) {
      getReservationList();
    } else {
      console.log("User ID is missing, skipping fetch.");
    }
  }, [userId]); // Ajout de userId comme dépendance pour relancer l'effet si nécessaire

  // Vérification du contenu de reservationList avant de l'afficher
  if (loading) return <Loader />;

  return (
    <>
      <Navbar />
      <h1 className="title-list">Your Reservation List</h1>
      <div className="list">
        {reservationList?.length > 0 ? (
          reservationList.map(({ listingId, hostId, startDate, endDate, totalPrice, booking = true }) => (
            <ListingCard
              key={listingId?._id || listingId}  // Assurez-vous que listingId est valide
              listingId={listingId?._id || listingId}
              creator={hostId?._id || hostId}
              listingPhotosPaths={listingId?.listingPhotosPaths || []}
              city={listingId?.city}
              province={listingId?.province}
              country={listingId?.country}
              category={listingId?.category}
              startDate={startDate}
              endDate={endDate}
              totalPrice={totalPrice}
              booking={booking}
            />
          ))
        ) : (
          <p>No reservations found.</p>
        )}
      </div>
      <Footer />
    </>
  );
};

export default ReservationList;
