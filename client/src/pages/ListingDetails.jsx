// ListingDetails.js
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { facilities } from "../data";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { DateRange } from "react-date-range";

import "../styles/listingDetails.scss";
import Navbar from "../componenets/Navbar";
import Loader from "../componenets/Loader";
import Footer from "../componenets/Footer";
import { useSelector } from "react-redux";
import URL from "../constants/api"

const ListingDetails = () => {
  const [loading, setLoading] = useState(true);
  const { listingId } = useParams();
  console.log("listingId from URL:", listingId);
  const [listing, setListing] = useState(null);

  const getListingDetails = async () => {
    try {
      const response = await fetch(
        `${URL.FETCH_LISTINGS}/${listingId}`,
        {
          method: "GET",
        }
      );
      const data = await response.json();
      console.log("Listing Data:", data); // Log de la réponse API pour vérifier
      setListing(data);
      setLoading(false);
    } catch (err) {
      console.log("Fetch Listing Details Failed", err.message);
    }
  };

  useEffect(() => {
    getListingDetails();
  }, []);

  // Booking Calendar Logic
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const handleSelect = (ranges) => {
    setDateRange([ranges.selection]);
  };

  const start = new Date(dateRange[0].startDate);
  const end = new Date(dateRange[0].endDate);
  const dayCount = Math.round(end - start) / (1000 * 60 * 60 * 24);
  console.log("Calculated Days:", dayCount); // Log du calcul des jours

  const customerId = useSelector((state) => state?.user?._id);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!customerId || !listingId || !listing.creator || !listing.creator._id) {
      console.log("Error: Missing required data for booking.");
      return;
    }
  
    try {
      const bookingForm = {
        customerId,
        listingId,
        hostId: listing.creator._id,
        startDate: dateRange[0].startDate.toDateString(),
        endDate: dateRange[0].endDate.toDateString(),
        totalPrice: listing.price * dayCount,
      };
  
      const response = await fetch(URL.CREATE_BOOKINGS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingForm),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        navigate(`/${customerId}/trips`);
      } else if (response.status === 400 && data.message === "Les dates sont déjà réservées") {
        alert("Les dates sont déjà réservées. Veuillez choisir d'autres dates.");
      } else {
        console.log("Booking submission failed");
      }
    } catch (err) {
      console.log("Submit booking failed, err.message");
    }
  };
  

  // Si les données sont en cours de chargement
  return loading ? (
    <Loader />
  ) : (
    <>
      <Navbar />
      <div className="listing-details">
        <div className="title">
          <h1>{listing.title}</h1>
          <div></div>
        </div>

        {/* Photos Section */}
        <div className="photos">
          {listing.listingPhotosPaths &&
          listing.listingPhotosPaths.length > 0 ? (
            listing.listingPhotosPaths.map((item, index) => (
              <img
                key={index}
                src={`https://zero-gravity-stays-bevn.vercel.app${item}`}
                alt={`Listing Photo ${index + 1}`}
              />
            ))
          ) : (
            <p>No photos available</p> // Affiche un message si aucune photo n'est disponible
          )}
        </div>

        <h2>
          {listing.type} in {listing.city}, {listing.province},{" "}
          {listing.country}
        </h2>
        <p>
          {listing.guestCount} guests - {listing.bedroomCount} bedroom(s) -{" "}
          {listing.bedCount} bed(s) - {listing.bathroomCount} bathroom(s)
        </p>
        <hr />

        {/* Host Info Section */}
        <div className="profile">
          {listing.creator ? (
            <>
              <img
                src={
                  listing.creator.profileImagePath
                    ? `https://zero-gravity-stays-bevn.vercel.app/uploads/${listing.creator.profileImagePath.replace(
                        /\\/,
                        "/"
                      )}`
                    : "default_image_url"
                }
                alt="Host Profile"
                className="host-photo"
              />

              <h3>
                Hosted By {listing.creator.firstName} {listing.creator.lastName}
              </h3>
            </>
          ) : (
            <p>Loading creator data...</p>
          )}
        </div>

        <hr />

        <h3>Description</h3>
        <p>{listing.description}</p>
        <hr />

        <h3>{listing.highlight}</h3>
        <p>{listing.highlightDesc}</p>
        <hr />

        {/* Amenities Section */}
        <div className="booking">
          <div>
            <h2>What this place Offers?</h2>
            <div className="amenities">
              {listing.amenities && listing.amenities.length > 0 ? (
                listing.amenities[0].split(",").map((item, index) => (
                  <div className="facility" key={index}>
                    <div className="facility_icon">
                      {
                        facilities.find((facility) => facility.name === item)
                          ?.icon
                      }
                    </div>
                    <p>{item}</p>
                  </div>
                ))
              ) : (
                <p>No amenities available</p> // Affiche un message si aucune commodité n'est disponible
              )}
            </div>
          </div>

          {/* Booking Section */}
          <div>
            <h2>How Long do you want to stay?</h2>
            <div className="date-range-calendar">
              <DateRange ranges={dateRange} onChange={handleSelect} />
              {dayCount > 1 ? (
                <h2>
                  ${listing.price} x {dayCount} nights
                </h2>
              ) : (
                <h2>
                  ${listing.price} x {dayCount} night
                </h2>
              )}
              <h2>Total price: {listing.price * dayCount}</h2>
              <p>Start Date: {dateRange[0].startDate.toDateString()}</p>
              <p>End Date: {dateRange[0].endDate.toDateString()}</p>

              <button className="button" type="submit" onClick={handleSubmit}>
                Booking
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ListingDetails;
