import Loader from '../components/Loader';
import Navbar from '../components/Navbar';
import Footer from "../components/Footer";
import '../styles/list.scss';
import React, { useEffect, useState } from 'react';
import { setTripList } from '../redux/state';
import { useDispatch, useSelector } from 'react-redux';
import ListingCard from '../components/ListingCard';
import URL from "../constants/api";
import CheckoutForm from '../components/CheckoutForm';

const TripList = () => {
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [openCheckout, setOpenCheckout] = useState(false);

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
    } else {
      console.log('Error: User ID is not available');
    }
  }, [userId]);

  const handleBooking = (trip) => {
    setSelectedTrip(trip);
    setOpenCheckout(true);
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
            <ListingCard
              key={listingId}
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
          );
        })}
      </div>

      {/* Bouton de paiement pour chaque voyage sélectionné*/}
      {selectedTrip && openCheckout && (
        <div className="checkout-modal">
          <h2>Finalize Payment for Booking</h2>
          <CheckoutForm amount={selectedTrip.totalPrice} onClose={() => setOpenCheckout(false)} />
        </div>
      )}

      <button 
        className="pay-now-button" 
        onClick={() => handleBooking(selectedTrip)} 
        disabled={!selectedTrip}
      >
        Pay Now
      </button>

      <Footer />
    </>
  );
};

export default TripList;


