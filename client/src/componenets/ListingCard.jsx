import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/listingCard.scss";
import {
  ArrowForwardIos,
  ArrowBackIosNew,
  Favorite,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { setWishList } from "../redux/state";
import URL from "../constants/api";

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Sélectionner la wishList depuis Redux
  const user = useSelector((state) => state.user);
  const wishList = user?.wishList || [];

  // Fonction pour vérifier si cet élément est dans la wishList
  const checkIsInWishlist = () => {
    if (!wishList || !listingId || !user) return false;
    
    if (Array.isArray(wishList)) {
      if (wishList.length > 0) {
        if (typeof wishList[0] === 'object') {
          // Si wishList contient des objets complets
          return wishList.some(item => item && item._id === listingId);
        } else {
          // Si wishList contient juste des IDs
          return wishList.includes(listingId);
        }
      }
    }
    return false;
  };
  
  // État local pour l'affichage du cœur
  const [liked, setLiked] = useState(checkIsInWishlist());

  // Mettre à jour l'état liked quand la wishList change
  useEffect(() => {
    setLiked(checkIsInWishlist());
  }, [wishList, listingId, user]);
  
  // Ajouter/retirer de la wishlist
  const patchWishList = async (e) => {
    e.stopPropagation(); // Empêcher la propagation pour ne pas naviguer
    
    if (!user || !user._id) {
      console.log("Utilisateur non connecté");
      return;
    }
    
    if (creator && user._id === creator._id) {
      console.log("L'utilisateur est le créateur du listing");
      return;
    }
    
    try {
      console.log(`Envoi requête PATCH à: ${URL.FETCH_USERS}/${user._id}/${listingId}`);
      
      const token = localStorage.getItem("authToken"); // Récupérer le token si nécessaire
      
      const response = await fetch(
        `${URL.FETCH_USERS}/${user._id}/${listingId}`,
        {
          method: "PATCH",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : "",
          },
        }
      );
  
      console.log("Statut réponse:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Erreur ${response.status}:`, errorText);
        return;
      }
  
      const data = await response.json();
      console.log("Données reçues:", data);
      
      // Utiliser la propriété correcte de la réponse
      if (data.wishlist) {
        dispatch(setWishList(data.wishlist));
        // Mettre à jour l'état local
        setLiked(!liked);
      } else {
        console.error("La réponse ne contient pas la propriété wishlist attendue:", data);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la wishlist:", error);
    }
  };  
  // Fonctions pour le slider
  const goToPrevSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex(
      (prevIndex) =>
        (prevIndex - 1 + listingPhotosPaths.length) % listingPhotosPaths.length
    );
  };

  const goToNextSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex + 1) % listingPhotosPaths.length);
  };

  return (
    <div className="listing-card">
      <div
        className="listing-card-inner"
        onClick={() => {
          navigate(`/properties/${listingId}`);
        }}
      >
        <div className="slider-container">
        <button
            className="favorite"
            onClick={patchWishList}
            disabled={!user}
          >
            <Favorite sx={{ color: liked ? "red" : "white" }} />
          </button>
          <div
            className="slider"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {listingPhotosPaths && listingPhotosPaths.length > 0 ? (
              listingPhotosPaths.map((photo, index) => (
                <div key={index} className="slide">
                  <img src={photo} alt={`photo ${index + 1}`} />

                  <div
                    className="prev-button"
                    onClick={goToPrevSlide}
                  >
                    <ArrowBackIosNew sx={{ fontSize: "15px" }} />
                  </div>
                  <div
                    className="next-button"
                    onClick={goToNextSlide}
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
        
        <div className="listing-info">
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
          
        </div>
      </div>
    </div>
  );
};

export default ListingCard;

