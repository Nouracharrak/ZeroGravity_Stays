import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { facilities } from "../data";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { DateRange } from "react-date-range";
import "../styles/listingDetails.scss";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import Footer from "../components/Footer";
import { useSelector } from "react-redux";
import URL from "../constants/api";

const ListingDetails = () => {
  const [loading, setLoading] = useState(true);
  const { listingId } = useParams();
  console.log("listingId from URL:", listingId);
  const [listing, setListing] = useState(null);

  const getListingDetails = async () => {
    try {
      const response = await fetch(`${URL.FETCH_LISTINGS}/${listingId}`, {
        method: "GET",
      });
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
  console.log("Calculated Days:", dayCount);

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

        {/*Correction des Photos */}
        <div className="photos">
          {listing.listingPhotosPaths && listing.listingPhotosPaths.length > 0 ? (
            listing.listingPhotosPaths.map((url, index) => (
              <img key={index} src={url} alt="listing_photos" />
            ))
          ) : (
            <p>No photos available</p>
          )}
        </div>

        <h2>
          {listing.type} in {listing.city}, {listing.province}, {listing.country}
        </h2>
        <p>
          {listing.guestCount} guests - {listing.bedroomCount} bedroom(s) -{" "}
          {listing.bedCount} bed(s) - {listing.bathroomCount} bathroom(s)
        </p>
        <hr />

        {/* Correction de l'affichage de l'hôte */}
        <div className="profile">
          {listing.creator ? (
            <>
              <img
                src={listing.creator.profileImagePath ? listing.creator.profileImagePath : "/assets/default_profile.png"}
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

        {/*Correction des Commodités */}
        <div className="booking">
  <div>
    <h2>What this place Offers?</h2>
    <div className="amenities">
      {listing.amenities && listing.amenities.length > 0 ? (
        listing.amenities.map((item, index) => (
          <div className="facility" key={index}>
            <div className="facility_icon">
              {facilities.find((facility) => facility.name === item)?.icon}
            </div>
            <p>{item}</p>
          </div>
        ))
      ) : (
        <p>No amenities available</p>
      )}
    </div>
  </div>
          {/* Booking Section */}
          <div>
            <h2>How Long do you want to stay?</h2>
            <div className="date-range-calendar">
              <DateRange ranges={dateRange} onChange={handleSelect} />
              <h2>
                €{listing.price} x {dayCount} {dayCount > 1 ? "nights" : "night"}
              </h2>
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

