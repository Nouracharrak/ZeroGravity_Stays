import React, { useState, useEffect, useCallback } from 'react';
import { categories } from '../data';
import ListingCard from './ListingCard';
import Loader from './Loader';
import { useDispatch, useSelector } from 'react-redux';
import { setListings } from '../redux/state';
import URL from "../constants/api";

const Listings = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const listings = useSelector((state) => state.user.listings);

  const getFeedListings = useCallback(async () => {
    try {
      const response = await fetch(
        selectedCategory !== 'All'
          ? `${URL.FETCH_LISTINGS}?category=${selectedCategory}`
          : URL.FETCH_LISTINGS,
        { method: 'GET' }
      );
      const data = await response.json();

      if (Array.isArray(data)) {
        dispatch(setListings({ listings: data }));
      } else {
        console.error('Les données reçues ne sont pas un tableau valide.');
      }

      setLoading(false);
    } catch (err) {
      console.log('Erreur lors de la récupération des listings:', err.message);
      setLoading(false);
    }
  }, [dispatch, selectedCategory]);

  useEffect(() => {
    if (selectedCategory) {
      getFeedListings();
    }
  }, [selectedCategory, getFeedListings]);

  return (
    <div>
      {loading && <Loader />}
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

      {!loading && listings && listings.length > 0 ? (
        <div className="listings">
          {listings.map((listing) => (
            <ListingCard key={listing._id} {...listing} />
          ))}
        </div>
      ) : (
        <p>Aucun listing disponible</p>
      )}
    </div>
  );
};

export default Listings;
