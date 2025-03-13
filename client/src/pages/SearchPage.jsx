import { useParams } from "react-router-dom";
import "../styles/list.scss";
import { useDispatch, useSelector } from "react-redux";
import { setListings } from "../redux/state";
import { useState, useEffect } from "react";
import ListingCard from "../components/ListingCard";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import Footer from "../components/Footer";
import URL from "../constants/api";

const SearchPage = () => {
  const [loading, setLoading] = useState(true);
  const { search } = useParams(); // Récupère le paramètre 'search' de l'URL
  const listings = useSelector((state) => state.listings); // Récupère les annonces depuis Redux
  const dispatch = useDispatch();

  // Fonction pour récupérer les listings correspondant à la recherche
  const getSearchListings = async () => {
    let query = search?.trim(); // Supprime les espaces inutiles

    if (!query || query.toLowerCase() === "all") {
      console.warn("Requête de recherche vide ou non valide.");
      dispatch(setListings({ listings: [] }));
      setLoading(false);
      return;
    }

    try {
      console.log("Requête envoyée :", query);

      const response = await fetch(`${URL.SEARCH_LISTINGS}/${query}`, {
        method: "GET",
      });

      const data = await response.json();
      console.log("Données reçues :", data);

      if (Array.isArray(data)) {
        dispatch(setListings({ listings: data }));
      } else {
        console.error("Erreur: structure de réponse incorrecte", data);
        dispatch(setListings({ listings: [] }));
      }
    } catch (err) {
      console.error("Erreur de récupération des annonces :", err.message);
      dispatch(setListings({ listings: [] }));
    } finally {
      setLoading(false); // Arrêter le chargement même en cas d'erreur
    }
  };

  useEffect(() => {
    getSearchListings();
  }, [search]);

  return loading ? (
    <Loader />
  ) : (
    <>
      <Navbar />
      <h1 className="title-list">Résultats pour : {search}</h1>
      <div className="list">
        {Array.isArray(listings) && listings.length > 0 ? (
          listings.map((listing) => (
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
              booking={listing.booking || false}
            />
          ))
        ) : (
          <p>Aucun résultat trouvé.</p> // Message si aucune annonce ne correspond
        )}
      </div>
      <Footer />
    </>
  );
};

export default SearchPage;


