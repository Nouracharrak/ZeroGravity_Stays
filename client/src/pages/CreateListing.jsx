import React, { useState } from "react";
import variables from "../styles/variables.scss";
import "../styles/createListing.scss";
import Navbar from "../componenets/Navbar";
import Footer from "../componenets/Footer";
import { categories, types, facilities } from "../data";
import { RemoveCircleOutline, AddCircleOutline } from "@mui/icons-material";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { IoIosImages } from "react-icons/io";
import { BiTrash } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import URL from "../constants/api";

const CreateListing = () => {
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");

  // Location
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

  // Increment and basic count
  const [guestCount, setGuestCount] = useState(1);
  const [bedroomCount, setBedroomCount] = useState(1);
  const [bedCount, setBedCount] = useState(1);
  const [bathroomCount, setBathroomCount] = useState(1);

  // Amenities section
  const [amenities, setAmenities] = useState([]);

  const handleSelectAmenities = (facility) => {
    if (amenities.includes(facility)) {
      setAmenities((prevAmenities) =>
        prevAmenities.filter((option) => option !== facility)
      );
    } else {
      setAmenities((prev) => [...prev, facility]);
    }
  };

  // Upload photos to Cloudinary
  const [photos, setPhotos] = useState([]);

  const handleUploadPhotos = async (e) => {
    const files = Array.from(e.target.files);
    const uploadedPhotos = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "ml_default"); // ⚠️ Remplace par ton "upload_preset" Cloudinary

      try {
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload`, // ⚠️ Remplace YOUR_CLOUD_NAME
          {
            method: "POST",
            body: formData,
          }
        );
        const data = await response.json();
        uploadedPhotos.push(data.secure_url); // Récupère l'URL Cloudinary
      } catch (err) {
        console.error("Image upload failed", err);
      }
    }
    setPhotos((prevPhotos) => [...prevPhotos, ...uploadedPhotos]);
  };

  const handleRemovePhoto = (indexToRemove) => {
    setPhotos((prevPhotos) =>
      prevPhotos.filter((_, index) => index !== indexToRemove)
    );
  };

  // Description section
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const listingForm = {
        creator: creatorId,
        category,
        type,
        streetAddress: formLocation.streetAddress,
        aptSuite: formLocation.aptSuite,
        city: formLocation.city,
        province: formLocation.province,
        country: formLocation.country,
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
        listingPhotos: photos, // Envoie uniquement les URLs Cloudinary
      };

      const response = await fetch(URL.CREATE_LISTINGS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(listingForm),
      });

      if (response.ok) {
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
          <div className="create-listing_step1">
            <h2>Step 1: Tell us about your place</h2>
            <hr />
            <h3>Which of these categories best describes your place?</h3>
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

            <h3>Add some photos of your place</h3>
            <DragDropContext onDragEnd={() => {}}>
              <Droppable droppableId="photos" direction="horizontal">
                {(provided) => (
                  <div className="photos" {...provided.droppableProps} ref={provided.innerRef}>
                    {photos.length < 1 && (
                      <>
                        <input
                          id="image"
                          type="file"
                          style={{ display: "none" }}
                          accept="image/*"
                          onChange={handleUploadPhotos}
                          multiple
                        />
                        <label htmlFor="image" className="alone">
                          <div className="icon">
                            <IoIosImages />
                          </div>
                          <p>Upload from your device</p>
                        </label>
                      </>
                    )}

                    {photos.length >= 1 && (
                      <>
                        {photos.map((photo, index) => (
                          <Draggable key={index} draggableId={index.toString()} index={index}>
                            {(provided) => (
                              <div
                                className="photo"
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <img src={photo} alt="place" />
                                <button type="button" onClick={() => handleRemovePhoto(index)}>
                                  <BiTrash />
                                </button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                      </>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            <button className="button_submit" type="submit">
              Create Your Listing
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default CreateListing;

