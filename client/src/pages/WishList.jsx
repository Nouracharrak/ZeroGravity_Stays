import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ListingCard from "../componenets/ListingCard";
import URL from "../constants/api";
import { setWishList } from "../redux/state";
import Navbar from "../componenets/Navbar"; 
import Footer from "../componenets/Footer"; 

const WishList = () => {
  const dispatch = useDispatch();
  const wishListIds = useSelector((state) => state.user?.wishList || []);
  const userId = useSelector((state) => state.user?._id);
  const [fullWishList, setFullWishList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Récupérer la wishlist complète de l'utilisateur
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!userId) return; // Vérifie que l'utilisateur est bien connecté

      try {
        setLoading(true);
        const response = await fetch(`${URL.FETCH_USERS}/${userId}/wishlist`);
        if (!response.ok) throw new Error("Erreur lors de la récupération de la wishlist");
        
        const wishListData = await response.json();
        dispatch(setWishList(wishListData)); // Mise à jour du Redux Store
        setFullWishList(wishListData);
      } catch (error) {
        console.error("Erreur lors de la récupération de la wishlist:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [userId, dispatch]);

  // Ajouter ou retirer un élément de la wishlist
  const handleToggleWishlist = async (listingId) => {
    if (!userId) return;

    try {
      const response = await fetch(`${URL.FETCH_USERS}/${userId}/wishlist/${listingId}`, {
        method: 'PATCH',
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) throw new Error("Erreur lors de la mise à jour de la wishlist");

      const updatedWishList = await response.json();
      dispatch(setWishList(updatedWishList)); // Mise à jour du Redux Store
      setFullWishList(updatedWishList);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la wishlist:", error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <Navbar />
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
      <Footer />
    </div>
  );
};

export default WishList;
