import { useSelector } from "react-redux";
import "../styles/ListingCard.scss";
import ListingCard from "../componenets/ListingCard";
import Navbar from "../componenets/Navbar"; 
import Footer from "../componenets/Footer"; 

const Wishlist = () => {
  const wishList = useSelector((state) => state.user.wishList);

  return (
    <>
      <Navbar />
        <h1 className="title-list">Your Wish List</h1>
        <div className="list">
          {wishList.map(
            ({
              _id,
              listingPhotosPaths,
              city,
              province,
              country,
              category,
              type,
              price,
              booking = false
            }) => (
              <ListingCard
                listingId={_id}
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
        <Footer />
    </>
  );
};

export default Wishlist;