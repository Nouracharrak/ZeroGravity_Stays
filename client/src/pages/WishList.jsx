// components/WishList.js

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ListingCard from "../componenets/ListingCard";
import URL from "../constants/api";
import { setWishList } from "../redux/state";

const WishList = () => {
  const dispatch = useDispatch();
  const wishListIds = useSelector((state) => state.user.wishList);
  const [fullWishList, setFullWishList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Récupérer les détails des listings de la wishlist
  useEffect(() => {
    const fetchListingsDetails = async () => {
      try {
        setLoading(true);
        const ids = wishListIds.map(item => typeof item === 'string' ? item : item._id);

        const promises = ids.map(id =>
          fetch(`${URL.FETCH_LISTINGS}/${id}`).then(res => res.json())
        );

        const listings = await Promise.all(promises);
        setFullWishList(listings);
      } catch (error) {
        console.error("Error fetching listings details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (wishListIds?.length > 0) {
      fetchListingsDetails();
    } else {
      setLoading(false);
    }
  }, [wishListIds]);

  const handleToggleWishlist = async (listingId) => {
    try {
      const response = await fetch(`${URL.FETCH_LISTINGS}/${listingId}`, {
        method: 'PATCH', // Utiliser PATCH pour ajouter/retirer un élément de la wishlist
      });
      const result = await response.json();

      if (result.wishList) {
        dispatch(setWishList(result.wishList)); // Mettre à jour le store Redux avec la nouvelle wishlist
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la wishlist:", error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Your Wish List</h1>
      <div className="list">
        {fullWishList.length === 0 ? (
          <p>Your wishlist is empty.</p>
        ) : (
          fullWishList.map(listing => (
            <div key={listing._id}>
              <ListingCard {...listing} />
              <button onClick={() => handleToggleWishlist(listing._id)}>
                {wishListIds.includes(listing._id) ? "Remove from Wishlist" : "Add to Wishlist"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WishList;

