import "../styles/list.scss";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../componenets/Navbar";
import ListingCard from "../componenets/ListingCard";
import { useEffect, useState } from "react";
import { setPropertyList } from "../redux/state";
import Loader from "../componenets/Loader";
import Footer from "../componenets/Footer"
import URL from "../constants/api"

const PropertyList = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const user = useSelector((state) => state.user);
  const propertyList = useSelector((state) => state.user?.propertyList || []);

  const dispatch = useDispatch();

  const getPropertyList = async () => {
    try {
      setLoading(true);
      setError("");
      
      if (!user?._id) {
        console.error("User ID is missing");
        setError("Utilisateur non identifié. Veuillez vous connecter.");
        setLoading(false);
        return;
      }

      // Vérification du nom correct du token dans le localStorage
      const token = localStorage.getItem("authToken") || localStorage.getItem("token");
      if (!token) {
        console.error("Token d'authentification manquant");
        setError("Session expirée. Veuillez vous reconnecter.");
        setLoading(false);
        return;
      }

      // Construction de l'URL avec le bon paramètre
      const endpoint = `${URL.FETCH_LISTINGS}/${user._id}/listings`;
      console.log("Endpoint appelé:", endpoint);

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      console.log("Statut de la réponse:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Erreur ${response.status}:`, errorText);
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Données de propriétés reçues:", data);

      // Vérification des données reçues
      if (Array.isArray(data)) {
        console.log(`${data.length} propriétés trouvées`);
        dispatch(setPropertyList(data));
      } else {
        console.warn("Les données reçues ne sont pas un tableau:", data);
        const listingsArray = data.listings || [];
        dispatch(setPropertyList(listingsArray));
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des propriétés:", err);
      setError("Impossible de récupérer vos propriétés: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      getPropertyList();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Log pour débogage
  useEffect(() => {
    console.log("Liste de propriétés actuelle:", propertyList);
  }, [propertyList]);

  if (loading) return <Loader />;

  return (
    <>
      <Navbar />
      <h1 className="title-list">Vos propriétés</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="list">
        {propertyList && propertyList.length > 0 ? (
          propertyList.map((property) => {
            // Log pour chaque propriété pour identifier d'éventuels problèmes
            console.log("Rendu de propriété:", property);
            
            return (
              <ListingCard
                key={property._id}
                listingId={property._id}
                creator={property.creator || user._id}
                listingPhotosPaths={property.listingPhotosPaths || []}
                city={property.city || ""}
                province={property.province || ""}
                country={property.country || ""}
                category={property.category || ""}
                type={property.type || ""}
                price={property.price || 0}
                booking={false}
              />
            );
          })
        ) : (
          <p className="empty-list-message">No properties found for the moment.</p>
        )}
      </div>
      
      {/* Section de débogage (à supprimer en production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-section" style={{ margin: "20px", padding: "15px", border: "1px solid #ddd" }}>
          <h3>Données brutes (débogage):</h3>
          <pre>{JSON.stringify({ user, propertyList }, null, 2)}</pre>
        </div>
      )}
      
      <Footer />
    </>
  );
};

export default PropertyList;
