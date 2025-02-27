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
  console.log(formLocation);

  // Increment and basic count
  const [guestCount, setGuestCount] = useState(1);
  const [bedroomCount, setBedroomCount] = useState(1);
  const [bedCount, setBedCount] = useState(1);
  const [bathroomCount, setBathroomCount] = useState(1);

  // Amenities section:
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
  console.log(amenities);

  // Upload, drag and drop, remove photos
  const [photos, setPhotos] = useState([]);

  const handleUploadPhotos = (e) => {
    const files = Array.from(e.target.files);

    console.log("Images sélectionnées :", files);

    const previewPhotos = files.map((file) => ({
      file,
      previewUrl: window.URL.createObjectURL(file),
    }));

    setPhotos((prevPhotos) => [...prevPhotos, ...previewPhotos]);

    console.log("Prévisualisation des images :", previewPhotos);
  };

  const handleDragPhoto = (result) => {
    if (!result.destination) return;
    const items = Array.from(photos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setPhotos(items);
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
  console.log(formDescription);

  const creatorId = useSelector((state) => state.user._id);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!category) {
      alert("Veuillez sélectionner une catégorie");
      return;
    }

    if (!type) {
      alert("Veuillez sélectionner un type");
      return;
    }

    if (!formLocation.streetAddress || !formLocation.city || !formLocation.province || !formLocation.country) {
      alert("Veuillez remplir les informations de localisation");
      return;
    }

    if (!guestCount || !bedroomCount || !bedCount || !bathroomCount) {
      alert("Veuillez remplir les informations sur les équipements");
      return;
    }

    if (!amenities.length) {
      alert("Veuillez sélectionner au moins une commodité");
      return;
    }

    if (!formDescription.title || !formDescription.description || !formDescription.highlight || !formDescription.highlightDesc || !formDescription.price) {
      alert("Veuillez remplir les informations de description");
      return;
    }

    if (photos.length === 0) {
      alert("Veuillez ajouter au moins une photo");
      return;
    }

    try {
      // Upload des images sur Cloudinary avant soumission
      const uploadedPhotos = [];
      for (const photo of photos) {
        console.log("Fichier envoyé :", photo.file);
        const formData = new FormData();
        formData.append("file", photo.file);
        formData.append("upload_preset", "ml_default");

        try {
          const response = await fetch(URL.CLOUDINARY, {
            method: "POST",
            body: formData,
          });
          const data = await response.json();
          uploadedPhotos.push(data.secure_url);
        } catch (err) {
          console.error("Image upload failed", err);
        }
      }

      console.log("Images uploadées :", uploadedPhotos);

      // Création de la requête avec les images uploadées
      const listingForm = new FormData();
      listingForm.append("creator", creatorId);
      listingForm.append("category", category);
      listingForm.append("type", type);
      listingForm.append("streetAddress", formLocation.streetAddress);
      listingForm.append("aptSuite", formLocation.aptSuite);
      listingForm.append("city", formLocation.city);
      listingForm.append("province", formLocation.province);
      listingForm.append("country", formLocation.country);
      listingForm.append("guestCount", guestCount);
      listingForm.append("bedroomCount", bedroomCount);
      listingForm.append("bedCount", bedCount);
      listingForm.append("bathroomCount", bathroomCount);
      listingForm.append("amenities", JSON.stringify(amenities));
      listingForm.append("title", formDescription.title);
      listingForm.append("description", formDescription.description);
      listingForm.append("highlight", formDescription.highlight);
      listingForm.append("highlightDesc", formDescription.highlightDesc);
      listingForm.append("price", formDescription.price);
      // Ajout des images sous forme de tableau dans FormData
      listingForm.append("listingPhotos", JSON.stringify(uploadedPhotos));


      // Envoi des données au backend
      try {
        const response = await fetch(URL.CREATE_LISTINGS, {
          method: "POST",
          body: listingForm,
        });

        if (response.ok) {
          navigate("/");
        } else {
          const error = await response.text();
          console.log("Erreur lors de la création du listing :", error);
        }
      } catch (err) {
        console.log("Erreur lors de la création du listing :", err);
      }
    } catch (err) {
      console.log("Erreur lors de la création du listing :", err);
    }
  };
  return (
    <div>
      <Navbar />
      <div className="create_listing">
        <h1> Publish Your Place</h1>
        <form onSubmit={handleSubmit}>
          <div className="create-listing_step1">
            <h2> Step 1: Tell us about your place</h2>
            <hr />
            <h3> Which of these categories best describes your place? </h3>
            <div className="category-list">
              {categories?.map((item, index) => (
                <div
                  className={`category ${
                    category === item.label ? "selected" : ""
                  }`}
                  key={index}
                  onClick={() => setCategory(item.label)}
                >
                  <div className="category_icon">{item.icon}</div>
                  <p>{item.label}</p>
                </div>
              ))}
            </div>
            <h3> What type of place will guests have?</h3>
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
            <h3> Where's your place located?</h3>
            <div className="full">
              <div className="location">
                <p>Street Address</p>
                <input
                  type="text"
                  placeholder="Street address"
                  name="streetAddress"
                  value={formLocation.streetAddress}
                  onChange={handleChangeLocation}
                  required
                />
              </div>
              <div className="half">
                <div className="location">
                  <p>Apartment, Suite, etc. (if applicable)</p>
                  <input
                    type="text"
                    placeholder="Apt, Suite, etc. (if applicable)"
                    name="aptSuite"
                    value={formLocation.aptSuite}
                    onChange={handleChangeLocation}
                    required
                  />
                </div>
                <div className="location">
                  <p>City</p>
                  <input
                    type="text"
                    placeholder="City"
                    name="city"
                    value={formLocation.city}
                    onChange={handleChangeLocation}
                    required
                  />
                </div>
              </div>
              <div className="half">
                <div className="location">
                  <p>Province</p>
                  <input
                    type="text"
                    placeholder="Province"
                    name="province"
                    value={formLocation.province}
                    onChange={handleChangeLocation}
                    required
                  />
                </div>
                <div className="location">
                  <p>Country</p>
                  <input
                    type="text"
                    placeholder="Country"
                    name="country"
                    value={formLocation.country}
                    onChange={handleChangeLocation}
                    required
                  />
                </div>
              </div>
            </div>
            <h3> Share some basics about your place</h3>
            <div className="basics">
              <div className="basic">
                <p>Guests</p>
                <div className="basic_count">
                  <RemoveCircleOutline
                    onClick={() =>
                      guestCount > 1 && setGuestCount(guestCount - 1)
                    }
                    sx={{
                      fontSize: "25px",
                      cursor: "pointer",
                      "&:hover": { color: variables.pinkred },
                    }}
                  />
                  <p>{guestCount}</p>
                  <AddCircleOutline
                    onClick={() => setGuestCount(guestCount + 1)}
                    sx={{
                      fontSize: "25px",
                      cursor: "pointer",
                      "&:hover": { color: variables.pinkred },
                    }}
                  />
                </div>
              </div>
              <div className="basic">
                <p>Bedrooms</p>
                <div className="basic_count">
                  <RemoveCircleOutline
                    onClick={() =>
                      bedroomCount > 1 && setBedroomCount(bedroomCount - 1)
                    }
                    sx={{
                      fontSize: "25px",
                      cursor: "pointer",
                      "&:hover": { color: variables.pinkred },
                    }}
                  />
                  <p>{bedroomCount}</p>
                  <AddCircleOutline
                    onClick={() => setBedroomCount(bedroomCount + 1)}
                    sx={{
                      fontSize: "25px",
                      cursor: "pointer",
                      "&:hover": { color: variables.pinkred },
                    }}
                  />
                </div>
              </div>
              <div className="basic">
                <p>Beds</p>
                <div className="basic_count">
                  <RemoveCircleOutline
                    onClick={() => bedCount > 1 && setBedCount(bedCount - 1)}
                    sx={{
                      fontSize: "25px",
                      cursor: "pointer",
                      "&:hover": { color: variables.pinkred },
                    }}
                  />
                  <p>{bedCount}</p>
                  <AddCircleOutline
                    onClick={() => setBedCount(bedCount + 1)}
                    sx={{
                      fontSize: "25px",
                      cursor: "pointer",
                      "&:hover": { color: variables.pinkred },
                    }}
                  />
                </div>
              </div>
              <div className="basic">
                <p>Bathrooms</p>
                <div className="basic_count">
                  <RemoveCircleOutline
                    onClick={() =>
                      bathroomCount > 1 && setBathroomCount(bathroomCount - 1)
                    }
                    sx={{
                      fontSize: "25px",
                      cursor: "pointer",
                      "&:hover": { color: variables.pinkred },
                    }}
                  />
                  <p>{bathroomCount}</p>
                  <AddCircleOutline
                    onClick={() => setBathroomCount(bathroomCount + 1)}
                    sx={{
                      fontSize: "25px",
                      cursor: "pointer",
                      "&:hover": { color: variables.pinkred },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="create-listing_step2">
            <h2> Step 2: Make Your Place Stand Out</h2>
            <hr />
            <h3> Tell guests what your place has to offer</h3>
            <div className="amenities">
              {facilities?.map((item, index) => (
                <div
                  className={`facility ${
                    amenities.includes(item.name) ? "selected" : ""
                  }`}
                  key={index}
                  onClick={() => handleSelectAmenities(item.name)}
                >
                  <div className="facility_icon">{item.icon}</div>
                  <p>{item.name}</p>
                </div>
              ))}
            </div>
            <h3> Add some photos of your place</h3>
            <DragDropContext onDragEnd={handleDragPhoto}>
              <Droppable droppableId="photos" direction="horizontal">
                {(provided) => (
                  <div
                    className="photos"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
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
                          <Draggable
                            key={index}
                            draggableId={index.toString()}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                className="photo"
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <img src={photo.previewUrl} alt="place" />{" "}
                                {/* ✅ Correction ici */}
                                <button
                                  type="button"
                                  onClick={() => handleRemovePhoto(index)}
                                >
                                  <BiTrash />
                                </button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        <input
                          id="image"
                          type="file"
                          style={{ display: "none" }}
                          accept="image/*"
                          onChange={handleUploadPhotos}
                          multiple
                        />
                        <label htmlFor="image" className="together">
                          <div className="icon">
                            <IoIosImages />
                          </div>
                          <p>Upload from your device</p>
                        </label>
                      </>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            <h3> What make your place attractive and exciting?</h3>
            <div className="description">
              <p>Title</p>
              <input
                type="text"
                placeholder="Title"
                name="title"
                value={formDescription.title}
                onChange={handleChangeDescription}
                required
              />
              <p>Description</p>
              <textarea
                type="text"
                placeholder="Description"
                name="description"
                value={formDescription.description}
                onChange={handleChangeDescription}
                required
              />
              <p>Highlight</p>
              <input
                type="text"
                placeholder="Highlight"
                name="highlight"
                value={formDescription.highlight}
                onChange={handleChangeDescription}
                required
              />
              <p>Highlight Details</p>
              <textarea
                type="text"
                placeholder="Highlight Details"
                name="highlightDesc"
                value={formDescription.highlightDesc}
                onChange={handleChangeDescription}
                required
              />
              <p>Now, set your Price</p>
              <span>€</span>
              <input
                type="number"
                placeholder="100"
                name="price"
                value={formDescription.price}
                className="price"
                onChange={handleChangeDescription}
                required
              />
            </div>
          </div>
          <button
            className="button_submit"
            type="submit"
            style={{
              padding: "10px 15px",
              backgroundColor: "#D08544",
              border: "none",
              fontSize: "20px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "0.3s ease",
              color: "white",
              borderRadius: "10px",
            }}
          >
            Create Your Listing
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
};
export default CreateListing;
