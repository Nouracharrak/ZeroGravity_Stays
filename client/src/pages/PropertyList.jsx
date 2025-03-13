import "../styles/list.scss";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import ListingCard from "../components/ListingCard";
import { useEffect, useState } from "react";
import { setPropertyList } from "../redux/state";
import Loader from "../components/Loader";
import Footer from "../components/Footer"
import URL from "../constants/api"

const PropertyList = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // État local pour stocker les propriétés en cas de problème avec Redux
  const [localProperties, setLocalProperties] = useState([]);
  
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
        // Stockage dans l'état local ET dans Redux
        setLocalProperties(data);
        dispatch(setPropertyList(data));
      } else {
        console.warn("Les données reçues ne sont pas un tableau:", data);
        const listingsArray = data.listings || [];
        setLocalProperties(listingsArray);
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
  }, [user?._id]); // Dépendance plus précise

  // Log pour débogage
  useEffect(() => {
    console.log("Liste de propriétés Redux:", propertyList);
    console.log("Liste de propriétés locale:", localProperties);
  }, [propertyList, localProperties]);

  // Fonction pour déterminer quelle liste utiliser
  const getPropertiesToDisplay = () => {
    // Si la liste locale contient des données mais pas Redux, utiliser la liste locale
    if (localProperties.length > 0 && propertyList.length === 0) {
      console.log("Utilisation de la liste locale car Redux est vide");
      return localProperties;
    }
    // Sinon utiliser la liste Redux (qui pourrait être vide si pas de propriétés)
    console.log("Utilisation de la liste Redux");
    return propertyList;
  };

  const displayProperties = getPropertiesToDisplay();

  // Utilisation d'un rendu conditionnel pour le loading
  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <Loader />
          <p style={{ marginTop: "20px" }}>Downloading your properties...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <h1 className="title-list">Your properties</h1>
      
      {error && (
        <div className="error-message" style={{ 
          color: "red", 
          textAlign: "center", 
          padding: "15px", 
          margin: "15px auto",
          maxWidth: "800px", 
          border: "1px solid #ffcccc", 
          borderRadius: "5px", 
          backgroundColor: "#fff8f8" 
        }}>
          {error}
        </div>
      )}
      
      <div className="list">
        {displayProperties.length > 0 ? (
          displayProperties.map((property, index) => {
            console.log(`Rendu de propriété ${index}:`, property);
            
            // Vérification des propriétés essentielles
            if (!property || !property._id) {
              console.warn("Propriété invalide:", property);
              return null;
            }
            
            return (
              <div key={property._id} style={{ margin: "10px 0" }}>
                <ListingCard
                  listingId={property._id}
                  creator={property.creator || user?._id}
                  listingPhotosPaths={property.listingPhotosPaths || []}
                  city={property.city || ""}
                  province={property.province || ""}
                  country={property.country || ""}
                  category={property.category || ""}
                  type={property.type || ""}
                  price={property.price || 0}
                  booking={false}
                />
              </div>
            );
          })
        ) : (
          <div style={{ 
            textAlign: "center", 
            padding: "30px", 
            margin: "20px auto",
            maxWidth: "600px",
            border: "1px solid #eee",
            borderRadius: "8px",
            backgroundColor: "#f9f9f9"
          }}>
            <p className="empty-list-message">No Properties found.</p>
          </div>
        )}
      </div>
      
      {/* Section de débogage */}
      {/* <div style={{ margin: "30px auto", padding: "15px", border: "1px solid #ddd", maxWidth: "800px", borderRadius: "5px" }}>
        <h3>Informations de débogage:</h3>
        <p>État de chargement: {loading ? "En cours" : "Terminé"}</p>
        <p>Nombre de propriétés (Redux): {propertyList.length}</p>
        <p>Nombre de propriétés (Local): {localProperties.length}</p>
        <p>Nombre de propriétés affichées: {displayProperties.length}</p>
        
        {/* Afficher les 2 premières propriétés pour exemple */}
        {/* {displayProperties.length > 0 && (
          <div>
            <h4>Exemple de propriété:</h4>
            <pre style={{ overflowX: "auto" }}>
              {JSON.stringify(displayProperties[0], null, 2)}
            </pre>
          </div>
        )}
      </div> */}
      
      <Footer />
    </>
  );
};

export default PropertyList;

