import { useParams } from "react-router-dom";
import "../styles/list.scss";
import { useDispatch, useSelector } from "react-redux";
import { setListings } from "../redux/state";
import { useState, useEffect } from "react";
import ListingCard from "../componenets/ListingCard";
import Navbar from "../componenets/Navbar";
import Loader from "../componenets/Loader";
import Footer from "../componenets/Footer";
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
          listings.map(({ _id, creator, listingPhotosPaths, city, province, country, category, type, price, booking = false }) => (
            <ListingCard
              key={_id}
              listingId={_id}
              creator={creator}
              listingPhotoPaths={listingPhotosPaths}
              city={city}
              province={province}
              country={country}
              category={category}
              type={type}
              price={price}
              booking={booking}
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

