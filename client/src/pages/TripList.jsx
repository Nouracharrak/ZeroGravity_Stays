import Loader from '../componenets/Loader';
import Navbar from '../componenets/Navbar';
import Footer from "../componenets/Footer"
import '../styles/list.scss';
import React, { useEffect, useState } from 'react';
import { setTripList } from '../redux/state';
import { useDispatch, useSelector } from 'react-redux';
import ListingCard from '../componenets/ListingCard';

const TripList = () => {
  const [loading, setLoading] = useState(true);
  const userId = useSelector((state) => state.user._id);  // Accès à l'ID de l'utilisateur dans le store
  const tripList = useSelector((state) => state.user.tripList);  // Accès à la liste des voyages dans le store
  const dispatch = useDispatch();

  const getTripList = async () => {
    try {
      const response = await fetch(`https://zero-gravity-stays.vercel.app/users/${userId}/trips`, {
        method: 'GET',
      });
      const data = await response.json();
      dispatch(setTripList(data));  // Mise à jour du store avec la liste des voyages
      setLoading(false);  // Mettre à jour le loading à false une fois que les données sont chargées
    } catch (err) {
      console.log('Fetch Trip List Failed', err.message);
      setLoading(false);  // En cas d'erreur, on met aussi loading à false
    }
  };

  useEffect(() => {
    if (userId) {
      getTripList();
    } else {
      console.log('Error: User ID is not available');
    }
  }, [userId]); // Ajout de userId dans le tableau de dépendances pour qu'il recharge quand l'ID change.

  return loading ? (
    <Loader />
  ) : (
    <>
      <Navbar />
      <h1 className="title-list">Your Trip List</h1>
      <div className="list">
        {tripList?.map((trip) => {
          // Déstructure l'objet trip pour obtenir l'ID du listing et les détails du listing
          const { listingId, startDate, endDate, totalPrice, listingDetails } = trip;

          // Si listingDetails est disponible, nous récupérons les informations
          const photos = listingDetails?.listingPhotosPaths || [];
          const city = listingDetails?.city || 'Unknown City';
          const province = listingDetails?.province || 'Unknown Province';
          const country = listingDetails?.country || 'Unknown Country';
          const category = listingDetails?.category || 'Unknown Category';

          return (
            <ListingCard
              key={listingId}  // Utilisation de listingId comme clé
              listingId={listingId}  // Passe directement l'ID du listing ici (sans _id)
              listingPhotosPaths={photos}
              city={city}
              province={province}
              country={country}
              category={category}
              startDate={startDate}
              endDate={endDate}
              totalPrice={totalPrice}
              booking={true}
            />
          );
        })}
      </div>
      <Footer/>
    </>
  );
};

export default TripList;



