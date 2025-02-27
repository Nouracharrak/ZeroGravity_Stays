import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/listingCard.scss";
import { ArrowForwardIos, ArrowBackIosNew, Favorite } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import {setWishList} from '../redux/state'
import URL from "../constants/api"

const ListingCard = ({
  listingId,
  creator,
  listingPhotosPaths,
  city,
  province,
  country,
  category,
  type,
  price,
  totalPrice,
  startDate,
  endDate,
  booking,
}) => {
  // Slider pour les images
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevSlide = () => {
    setCurrentIndex(
      (prevIndex) =>
        (prevIndex - 1 + listingPhotosPaths.length) % listingPhotosPaths.length
    );
  };

  const goToNextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % listingPhotosPaths.length);
  };

  const navigate = useNavigate();
  const dispatch = useDispatch();

  //  add the wishList
  const user = useSelector((state) => state.user)
  const wishList = user?.wishList || [];
  const isLiked = wishList.find((item) => item?._id === listingId)
  const patchWishList = async ()=> {
    if (user?._id !== creator._id) {
    const response = await fetch(`${URL.FETCH_USERS}/${user?._id}/${listingId}`, 
      {method: 'PATCH',
       header: {'Content-Type': 'application/jason'} 
      }
    );
    const data = await response.json()
    dispatch(setWishList(data.wishList))
  } else {return }
  }

  return (
    <div className="listing-card">
      <div
        className="listing-card"
        onClick={() => {
          navigate(`/properties/${listingId}`);
        }}
      >
        <div className="slider-container">
          <div
            className="slider"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {listingPhotosPaths && listingPhotosPaths.length > 0 ? (
              listingPhotosPaths.map((photo, index) => (
                <div key={index} className="slide">
                <img
                  src={`https://zero-gravity-stays-bevn.vercel.app${listingPhotosPaths[currentIndex]}`}
                  alt={`ListingPhoto ${currentIndex}`}
                />
                <div
                    className="prev-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      goToPrevSlide(e);
                    }}
                  >
                    <ArrowBackIosNew sx={{ fontSize: "15px" }} />
                  </div>
                  <div
                    className="next-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      goToNextSlide(e);
                    }}
                  >
                    <ArrowForwardIos sx={{ fontSize: "15px" }} />
                  </div>
                </div>
              ))
            ) : (
              <div className="no-photos">
                No photos available or undefined path.
              </div>
            )}
          </div>
        </div>
        <div>
          <h3>
            {city}, {province}, {country}
          </h3>
          <p>{category}</p>
          {!booking ? (
            <>
              <p>{type}</p>
              <p>
                {price} <span>€</span> per night
              </p>
            </>
          ) : (
            <>
              <p>
                {startDate} - {endDate}
              </p>
              <p>
                {totalPrice} <span>€</span> total
              </p>
            </>
          )}
          <button className="favorite" onClick={(e) => {
            e.stopPropagation();
            patchWishList()}}
            disabled={!user}>
            {isLiked ? (
              <Favorite sx={{color: "red"}}/> 
            ): (
                <Favorite sx={{color: "white"}}/>
              )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
