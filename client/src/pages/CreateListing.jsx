import React, { useState } from "react";
import "../styles/createListing.scss";
import Navbar from "../componenets/Navbar";
import Footer from "../componenets/Footer";
import { categories, types, facilities } from "../data";
import { IoIosImages } from "react-icons/io";
import { BiTrash } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import URL from "../constants/api";

const CreateListing = () => {
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");

  const [formLocation, setFormLocation] = useState({
    streetAddress: "",
    aptSuite: "",
    city: "",
    province: "",
    country: "",
  });

  const handleChangeLocation = (e) => {
    const { name, value } = e.target;
    setFormLocation({
      ...formLocation,
      [name]: value,
    });
  };

  const [guestCount, setGuestCount] = useState(1);
  const [bedroomCount, setBedroomCount] = useState(1);
  const [bedCount, setBedCount] = useState(1);
  const [bathroomCount, setBathroomCount] = useState(1);
  const [amenities, setAmenities] = useState([]);
  const [photos, setPhotos] = useState([]);

  const handleSelectAmenities = (facility) => {
    if (amenities.includes(facility)) {
      setAmenities(amenities.filter((item) => item !== facility));
    } else {
      setAmenities([...amenities, facility]);
    }
  };

  // 🔹 Upload des images vers Cloudinary
  const handleUploadPhotos = async (e) => {
    const files = e.target.files;
    const uploadedPhotos = [];

    for (let file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "your_upload_preset"); // 🔹 Remplace par ton preset Cloudinary
      formData.append("folder", "listings");

      try {
        const response = await axios.post(
          URL.CLOUDINARY, // 🔹 Remplace avec ton Cloud Name
          formData
        );
        uploadedPhotos.push(response.data.secure_url);
      } catch (err) {
        console.error("Error uploading image:", err);
      }
    }

    setPhotos((prevPhotos) => [...prevPhotos, ...uploadedPhotos]);
  };

  const handleRemovePhoto = (indexToRemove) => {
    setPhotos(photos.filter((_, index) => index !== indexToRemove));
  };

  const [formDescription, setFormDescription] = useState({
    title: "",
    description: "",
    highlight: "",
    highlightDesc: "",
    price: 0,
  });

  const handleChangeDescription = (e) => {
    const { name, value } = e.target;
    setFormDescription({
      ...formDescription,
      [name]: value,
    });
  };

  const creatorId = useSelector((state) => state.user._id);
  const navigate = useNavigate();

  // 🔹 Soumission du formulaire avec images stockées sur Cloudinary
  const handleSubmit = async (e) => {
    e.preventDefault();

    const listingData = {
      creator: creatorId,
      category,
      type,
      ...formLocation,
      guestCount,
      bedroomCount,
      bedCount,
      bathroomCount,
      amenities,
      title: formDescription.title,
      description: formDescription.description,
      highlight: formDescription.highlight,
      highlightDesc: formDescription.highlightDesc,
      price: formDescription.price,
      listingPhotosPaths: photos, // 🔹 Envoie les URLs Cloudinary
    };

    try {
      const response = await axios.post(URL.CREATE_LISTINGS, listingData);
      if (response.status === 200) {
        navigate("/");
      }
    } catch (err) {
      console.log("Publish Listing failed", err.message);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="create_listing">
        <h1>Publish Your Place</h1>
        <form onSubmit={handleSubmit}>
          <h3>Add Photos</h3>
          <input type="file" multiple accept="image/*" onChange={handleUploadPhotos} />
          <div className="photos">
            {photos.map((photo, index) => (
              <div key={index} className="photo">
                <img src={photo} alt={`Listing Photo ${index + 1}`} />
                <button type="button" onClick={() => handleRemovePhoto(index)}>
                  <BiTrash />
                </button>
              </div>
            ))}
          </div>

          <h3>Category</h3>
          <div className="category-list">
            {categories?.map((item, index) => (
              <div
                className={`category ${category === item.label ? "selected" : ""}`}
                key={index}
                onClick={() => setCategory(item.label)}
              >
                <div className="category_icon">{item.icon}</div>
                <p>{item.label}</p>
              </div>
            ))}
          </div>

          <h3>Type</h3>
          <div className="type-list">
            {types?.map((item, index) => (
              <div
                className={`type ${type === item.name ? "selected" : ""}`}
                key={index}
                onClick={() => setType(item.name)}
              >
                <div className="type_text">
                  <h4>{item.name}</h4>
                  <p>{item.description}</p>
                </div>
                <div className="type_icon">{item.icon}</div>
              </div>
            ))}
          </div>

          <h3>Location</h3>
          <input type="text" placeholder="Street Address" name="streetAddress" value={formLocation.streetAddress} onChange={handleChangeLocation} required />
          <input type="text" placeholder="City" name="city" value={formLocation.city} onChange={handleChangeLocation} required />
          <input type="text" placeholder="Province" name="province" value={formLocation.province} onChange={handleChangeLocation} required />
          <input type="text" placeholder="Country" name="country" value={formLocation.country} onChange={handleChangeLocation} required />

          <h3>Amenities</h3>
          <div className="amenities">
            {facilities?.map((item, index) => (
              <div
                className={`facility ${amenities.includes(item.name) ? "selected" : ""}`}
                key={index}
                onClick={() => handleSelectAmenities(item.name)}
              >
                <div className="facility_icon">{item.icon}</div>
                <p>{item.name}</p>
              </div>
            ))}
          </div>

          <h3>Price</h3>
          <input type="number" placeholder="100" name="price" value={formDescription.price} onChange={handleChangeDescription} required />

          <button className="button_submit" type="submit">
            Create Your Listing
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default CreateListing;

