import React, { useEffect, useState } from "react";
import "../styles/list.scss";
import { useSelector } from "react-redux";
import Navbar from "../componenets/Navbar";
import Footer from "../componenets/Footer";
import ListingCard from "../componenets/ListingCard";
import URL from "../constants/api";

const WishList = () => {
  const wishListIds = useSelector((state) => state.user.wishList);
  const [fullWishList, setFullWishList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListingsDetails = async () => {
      try {
        setLoading(true);
        // Si wishListIds est un tableau d'objets avec _id, on extrait les IDs
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

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <Navbar />
      <h1 className="title-list">Your Wish List</h1>
      <div className="list">
        {fullWishList.map(listing => (
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
        ))}
      </div>
      <Footer />
    </>
  );
};

export default WishList;
