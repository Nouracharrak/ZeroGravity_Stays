import {useCallback, useState, useEffect,} from 'react'
import "../styles/list.scss"
import Loader from '../componenets/Loader'
import Navbar from '../componenets/Navbar'
import Footer from '../componenets/Footer'
import ListingCard from '../componenets/ListingCard'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setListings } from '../redux/state'

const CategoriesPage = () => {
    const [laoding, setLoading] = useState(true)
    const {category} = useParams()
    const dispatch = useDispatch()
    const listings = useSelector((state) => state.listings);


  const getFeedListings = useCallback(async () => {
    try {
      const response = await fetch(
        `https://zero-gravity-stays.vercel.app/properties?category=${category}`,
        { method: 'GET' }
      );
      const data = await response.json();
      dispatch(setListings({ listings: data }));
      setLoading(false);
    } catch (err) {
      console.log('Fetch Listings failed', err.message);
      setLoading(false); // En cas d'erreur, on arrête le chargement
    }
  }, [dispatch, category]); // Ajout de dispatch et selectedCategory dans les dépendances

  // Effect qui se déclenche à chaque fois que la catégorie sélectionnée change
  useEffect(() => {
    if (category) {
      getFeedListings();
    }
}, [category]);
  return laoding ? <Loader/> : (
    <>
    <Navbar/>
    <h1 className="title-list">Your categogy </h1>
      <div className="list">
        {listings?.map(
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

export default CategoriesPage
