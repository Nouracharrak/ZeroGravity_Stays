import { useEffect, useState } from "react";
import "../styles/list.scss";
import Loader from "../componenets/Loader";
import Navbar from "../componenets/Navbar";
import Footer from "../componenets/Footer"
import { useDispatch, useSelector } from "react-redux";
import { setReservationList } from "../redux/state";
import ListingCard from "../componenets/ListingCard";
import URL from "../constants/api"

const ReservationList = () => {
  const [loading, setLoading] = useState(true);
  const userId = useSelector((state) => state.user._id);
  const reservationList = useSelector((state) => state.user.reservationList);

  const dispatch = useDispatch();

  // Fonction pour récupérer la liste des réservations
  const getReservationList = async () => {
    try {
      if (!userId) {
        console.log("User ID is missing!");
        return;
      }

      const response = await fetch(
        `${URL.FETCH_USERS}/${userId}/reservations`,
        { method: "GET" }
      );

      const data = await response.json();
      console.log("Fetched reservation list:", data); // Vérification des données retournées
      dispatch(setReservationList(data));
      setLoading(false);
    } catch (err) {
      console.log("Fetch Reservation List failed!", err.message);
    }
  };

  // Assurer que la requête est effectuée une fois que `userId` est disponible
  useEffect(() => {
    if (userId) {
      getReservationList();
    } else {
      console.log("User ID is missing, skipping fetch.");
    }
  }, [userId]); // Ajout de userId comme dépendance pour relancer l'effet si nécessaire

  return loading ? (
    <Loader />
  ) : (
    <>
      <Navbar />
      <h1 className="title-list">Your Reservation List</h1>
      <div className="list">
        {reservationList?.map(({ listingId, hostId, startDate, endDate, totalPrice, booking = true }) => (
          <ListingCard
            key={listingId?._id || listingId}  // Assurez-vous que listingId est correct
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
        ))}
      </div>
      <Footer />
    </>
  );
};

export default ReservationList;