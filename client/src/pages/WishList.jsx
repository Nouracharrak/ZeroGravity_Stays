import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import "../styles/listingCard.scss";
import ListingCard from "../componenets/ListingCard";
import Navbar from "../componenets/Navbar"; 
import Footer from "../componenets/Footer"; 
import URL from "../constants/api";

const Wishlist = () => {
  const wishList = useSelector((state) => state.user.wishList);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fonction pour récupérer les détails complets des listings
    const fetchListingDetails = async () => {
      try {
        setLoading(true);
        
        // Si wishList contient déjà des objets complets
        if (wishList.length > 0 && typeof wishList[0] === 'object' && wishList[0]._id) {
          setListings(wishList);
          setLoading(false);
          return;
        }
        
        // Si wishList contient des IDs, nous devons récupérer les détails
        const listingPromises = wishList.map(id => 
          fetch(`${URL.FETCH_LISTINGS}/${id}`).then(res => res.json())
        );
        
        const listingDetails = await Promise.all(listingPromises);
        setListings(listingDetails);
      } catch (error) {
        console.error("Erreur récupération des détails:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (wishList && wishList.length > 0) {
      fetchListingDetails();
    } else {
      setListings([]);
      setLoading(false);
    }
  }, [wishList]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading">Chargement de votre wishlist...</div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <h1 className="title-list">Your Wish List</h1>
      <div className="list">
        {listings.length > 0 ? (
          listings.map(listing => (
            <ListingCard
              key={listing._id}
              listingId={listing._id}
              creator={listing.creator}
              listingPhotosPaths={listing.listingPhotosPaths}
              city={listing.city}
              province={listing.province}
              country={listing.country}
              category={listing.category}
              type={listing.type}
              price={listing.price}
              booking={false}
            />
          ))
        ) : (
          <div className="empty-wishlist">Votre wishlist est vide</div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Wishlist;
