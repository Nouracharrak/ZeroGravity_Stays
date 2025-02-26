import { useParams } from 'react-router-dom';
import '../styles/list.scss';
import { useDispatch, useSelector } from 'react-redux';
import { setListings } from '../redux/state';
import { useState, useEffect } from 'react';
import ListingCard from '../componenets/ListingCard';
import Navbar from '../componenets/Navbar';
import Loader from '../componenets/Loader';
import Footer from "../componenets/Footer"
import URL from "../constants/api"

const SearchPage = () => {
  const [loading, setLoading] = useState(true);
  const { search } = useParams(); // Obtient le paramètre 'search' de l'URL
  const listings = useSelector((state) => state.listings); // Obtient l'état 'listings' depuis Redux
  const dispatch = useDispatch();

  // Fonction pour récupérer les listings correspondant à la recherche
  const getSearchListings = async () => {
    try {
      const response = await fetch(
        `${URL.SEARCH_LISTINGS}/${search}`,
        {
          method: 'GET',
        }
      );
      const data = await response.json();
      console.log('Response Data:', data); // Affiche la réponse pour vérifier la structure

      // Si la structure de la réponse est correcte, dispatch avec les listings
      if (Array.isArray(data)) {
        dispatch(setListings({ listings: data }));
      } else {
        console.log('Error: Invalid data structure', data);
        dispatch(setListings({ listings: [] }));
      }

      setLoading(false); // On arrête le chargement une fois que les données sont récupérées
    } catch (err) {
      console.log('Fetch Search List failed!', err.message);
      setLoading(false); // Arrêter le chargement même en cas d'erreur
    }
  };

  useEffect(() => {
    getSearchListings();
  }, [search]); // Remarque : 'search' est une dépendance, donc la recherche se déclenche chaque fois qu'il change

  return loading ? (
    <Loader />
  ) : (
    <>
      <Navbar />
      <h1 className="title-list">{search}</h1>
      <div className="list">
        {Array.isArray(listings) && listings.length > 0 ? (
          listings.map(
            ({
              _id,
              creator,
              listingPhotosPaths,
              city,
              province,
              country,
              category,
              type,
              price,
              booking = false,
            }) => (
              <ListingCard
                key={_id}
                listingId={_id}
                creator={creator}
                listingPhotoPaths={listingPhotosPaths}
                city={city}
                province={province}
                country={country}
                category={category}
                type={type}
                price={price}
                booking={booking}
              />
            )
          )
        ) : (
          <p>No listings found</p> // Message si aucun listing n'est trouvé
        )}
      </div>
      <Footer/>
    </>
  );
};

export default SearchPage;
