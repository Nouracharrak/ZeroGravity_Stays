import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import "../styles/listingCard.scss";
import ListingCard from "../components/ListingCard";
import Navbar from "../components/Navbar"; 
import Footer from "../components/Footer"; 
import URL from "../constants/api";
import Loader from "../components/Loader"; // Assurez-vous d'importer ce composant

const Wishlist = () => {
  const wishList = useSelector((state) => state.user?.wishList || []);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Ajout de l'état error
  
  useEffect(() => {
    const fetchListingDetails = async () => {
      try {
        setLoading(true);
        
        // Si wishList est vide, ne rien faire
        if (!wishList || wishList.length === 0) {
          setListings([]);
          setLoading(false);
          return;
        }
        
        // Récupérer le token d'authentification
        const token = localStorage.getItem("authToken") || localStorage.getItem("token");
        if (!token) {
          setError("Session expirée. Veuillez vous reconnecter.");
          setLoading(false);
          return;
        }
        
        // Normaliser les IDs de la wishlist (au cas où il y aurait des objets)
        const wishlistIds = wishList.map(item => 
          typeof item === 'string' ? item : (item._id ? item._id.toString() : item.toString())
        );
        
        console.log("IDs à récupérer:", wishlistIds);
        
        // Récupérer les détails pour chaque ID
        const listingPromises = wishlistIds.map(id => 
          fetch(`${URL.FETCH_LISTINGS}/${id}`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          })
          .then(res => {
            if (!res.ok) {
              throw new Error(`Erreur ${res.status} pour l'ID ${id}`);
            }
            return res.json();
          })
          .catch(err => {
            console.error(`Erreur récupération listing ${id}:`, err);
            return null; // Récupérer null pour les échecs
          })
        );
        
        // Attendre toutes les requêtes
        const results = await Promise.all(listingPromises);
        
        // Filtrer les résultats null (échecs)
        const validListings = results.filter(listing => listing !== null);
        console.log(`${validListings.length}/${wishlistIds.length} listings récupérés`);
        
        setListings(validListings);
      } catch (error) {
        console.error("Erreur globale:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    // Appel de la fonction
    fetchListingDetails();
  }, [wishList]); // Dépendance à wishList

  // Rendu conditionnel pour le chargement
  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          justifyContent: "center", 
          alignItems: "center", 
          padding: "50px 0",
          minHeight: "50vh"
        }}>
          <Loader />
          <p style={{ marginTop: "20px" }}>DownLoading your wishlist...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <h1 className="title-list">Your Wish List</h1>
      
      {error && (
        <div style={{ 
          color: "red", 
          textAlign: "center", 
          padding: "15px", 
          margin: "15px auto",
          maxWidth: "800px", 
          backgroundColor: "#fff8f8", 
          border: "1px solid #ffcccc", 
          borderRadius: "5px" 
        }}>
          {error}
        </div>
      )}
      
      <div className="list">
        {listings && listings.length > 0 ? (
          listings.map(listing => (
            <ListingCard
              key={listing._id}
              listingId={listing._id}
              creator={listing.creator}
              listingPhotosPaths={listing.listingPhotosPaths || []}
              city={listing.city || ""}
              province={listing.province || ""}
              country={listing.country || ""}
              category={listing.category || ""}
              type={listing.type || ""}
              price={listing.price || 0}
              booking={false}
            />
          ))
        ) : (
          <div style={{ 
            textAlign: "center", 
            padding: "40px", 
            margin: "20px auto", 
            maxWidth: "600px", 
            border: "1px solid #eee", 
            borderRadius: "8px",
            backgroundColor: "#f9f9f9"
          }}>
            <p style={{ fontSize: "18px", marginBottom: "20px" }}>
              No wishlist found
            </p>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Wishlist;

