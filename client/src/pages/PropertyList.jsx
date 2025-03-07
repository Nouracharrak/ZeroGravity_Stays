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
  const [loading, setLoading] = useState(true)
  const user = useSelector((state) => state.user)
  const propertyList = user?.propertyList;
  console.log(user)

  const dispatch = useDispatch()
  const getPropertyList = async () => {
    try {
      const token = localStorage.getItem("token"); // Récupérer le token
      if (!token) throw new Error("Aucun token trouvé !");
  
      const response = await fetch(`${URL.FETCH_USERS}/${user._id}/properties`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Ajouter le token ici
        }
      });
  
      if (!response.ok) throw new Error(`Erreur ${response.status}: ${response.statusText}`);
  
      const data = await response.json();
      console.log(data);
      dispatch(setPropertyList(data));
      setLoading(false);
    } catch (err) {
      console.log("Fetch all properties failed", err.message);
      setLoading(false);
    }
  };
  useEffect(() => {
    if (user?._id) {
      getPropertyList();
    }
  }, [user]);
  

  return loading ? <Loader /> : (
    <>
      <Navbar />
      <h1 className="title-list">Your Property List</h1>
      <div className="list">
        {propertyList?.map(
          ({
            _id,
            creator,
            listingPhotosPaths,
            city,
            province,
            country,
            category,
            type,
            price,
            booking = false,
          }) => (
            <ListingCard
              listingId={_id}
              creator={creator}
              listingPhotosPaths={listingPhotosPaths}
              city={city}
              province={province}
              country={country}
              category={category}
              type={type}
              price={price}
              booking={booking}
            />
          )
        )}
      </div>
      <Footer/>
    </>
  );
};

export default PropertyList;