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
  
  // Récupérer l'ID utilisateur et la liste des voyages depuis Redux
  const userId = useSelector((state) => state.user._id);
  const tripList = useSelector((state) => state.user.tripList);
  const dispatch = useDispatch();

  // Fonction pour récupérer la liste des voyages de l'utilisateur
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

  // Utilisation de useEffect pour récupérer la liste des voyages lorsque l'utilisateur est disponible
  useEffect(() => {
    if (userId) {
      getTripList();
    } else {
      console.log('Error: User ID is not available');
    }
  }, [userId]);

  // Fonction exécutée lors du clic sur le bouton "Pay Now"
  const handleBooking = (trip) => {
    setSelectedTrip(trip);
    setOpenCheckout(true);
  };

  // Fonction de rappel en cas de succès de paiement
  const handlePaymentSuccess = () => {
    setOpenCheckout(false);
    alert("Payment successful!");
    // Vous pouvez également mettre à jour des états ou rediriger l'utilisateur ici
  };

  // Fonction de rappel en cas d'échec de paiement
  const handlePaymentFailure = (errorMessage) => {
    alert("Payment failed: " + errorMessage);
    // Logique pour gérer les échecs de paiement
  };

  return loading ? (
    <Loader />
  ) : (
    <>
      <Navbar />
      <h1 className="title-list">Your Trip List</h1>
      <div className="list">
        {tripList?.map((trip) => {
          const { listingId, startDate, endDate, totalPrice, listingDetails } = trip;
          const photos = listingDetails?.listingPhotosPaths || [];
          const city = listingDetails?.city || 'Unknown City';
          const province = listingDetails?.province || 'Unknown Province';
          const country = listingDetails?.country || 'Unknown Country';
          const category = listingDetails?.category || 'Unknown Category';

          return (
            <div key={listingId} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <ListingCard
                listingId={listingId}
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
              <button 
                className="pay-now-button" 
                onClick={() => handleBooking(trip)}
              >
                Pay Now
              </button>
            </div>
          );
        })}
      </div>

      {openCheckout && selectedTrip && (
        <div className="checkout-overlay">
          <div className="checkout-modal">
            <h2>Finalize Payment for Booking</h2>
            <CheckoutForm 
              amount={selectedTrip.totalPrice} // Assurez-vous que c'est en cents
              onClose={() => setOpenCheckout(false)} 
              onPaymentSuccess={handlePaymentSuccess} 
              onPaymentFailure={handlePaymentFailure} 
            />
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default TripList;