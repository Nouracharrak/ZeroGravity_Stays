import React, { useState, useEffect, useCallback } from 'react';
import { categories } from '../data';
import '../styles/listing.scss';
import ListingCard from './ListingCard';
import Loader from './Loader';
import { useDispatch, useSelector } from 'react-redux';
import { setListings } from '../redux/state'; // Assurez-vous que cette action existe
import URL from "../constants/api"

const Listings = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const listings = useSelector((state) => state.listings); // Correction de 'listing' en 'listings'

  // Utiliser useCallback pour mémoriser la fonction getFeedListings
  const getFeedListings = useCallback(async () => {
    try {
      const response = await fetch(
        selectedCategory !== 'All'
          ? `${URL.FETCH_LISTINGS}?category=${selectedCategory}`
          : URL.FETCH_LISTINGS,
        { method: 'GET' }
      );
      const data = await response.json();
      dispatch(setListings({ listings: data })); // Dispatch des données dans le store Redux
      setLoading(false);
    } catch (err) {
      console.log('Fetch Listings failed', err.message);
      setLoading(false); // En cas d'erreur, on arrête le chargement
    }
  }, [dispatch, selectedCategory]); // Ajout de dispatch et selectedCategory dans les dépendances

  // Effect qui se déclenche à chaque fois que la catégorie sélectionnée change
  useEffect(() => {
    if (selectedCategory) {
      getFeedListings();
    }
}, [selectedCategory]);

  return (
    <div>
      {/* Affichage du loader si les données sont en cours de chargement */}
      {loading && <Loader />}

      {/* Liste des catégories avec gestion du clic pour filtrer */}
      <div className="category-list">
        {categories?.map((category, index) => (
          <div
            className={`category ${category.label === selectedCategory ? "selected" : ""}`}
            key={index}
            onClick={() => setSelectedCategory(category.label)}
          >
            <div className="category_icon">{category.icon}</div>
            <p>{category.label}</p>
          </div>
        ))}
      </div>

      {/* Affichage des listings après le chargement */}
      {loading ? (
        <Loader />
      ) : (
        <div className="listings">
          {listings.map(
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
              booking = false
            }) => (
              <ListingCard
                listingId={_id}
                creator={creator}
                listingPhotosPaths={listingPhotosPaths}
                city={city}
                province={province}
                country={country}
                category={category}
                type={type}
                price={price}
                booking={booking}
              />
            )
          )}
        </div>
      )}
    </div>
  );
};

export default Listings;


