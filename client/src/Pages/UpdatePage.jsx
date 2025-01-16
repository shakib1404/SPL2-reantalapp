import React, { useState } from "react";
import "../styles/CreateListing.scss";
import Navbar from "../components/Navbar";
import { categories, types, facilities } from "../data";
import { RemoveCircleOutline, AddCircleOutline } from "@mui/icons-material";
import variables from "../styles/variables.scss";
import { IoIosImages } from "react-icons/io";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { BiTrash } from "react-icons/bi";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

import Footer from "../components/Footer";

const UpdatePage = () => {
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");

  const [formLocation, setFormLocation] = useState({
    streetAddress: "",
    aptSuit: "",
    city: "",
    province: "",
    country: "",
    latitude: null, // Add latitude
    longitude: null, // Add longitude
  });

  const [photos, setPhotos] = useState([]);

  const handleChangeLocation = (e) => {
    const { name, value } = e.target;
    setFormLocation({
      ...formLocation,
      [name]: value,
    });
  };
  //console.log(formLocation);

  const [guestCount, setGuestcount] = useState(1);
  const [bathroomCount, setBathroomcount] = useState(1);
  const [bedCount, setBedcount] = useState(1);
  const [bedroomCount, setBedRoomcount] = useState(1);
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

  const handleUploadPhotos = (e) => {
    const newPhotos = e.target.files;
    setPhotos((prevPhotos) => [...prevPhotos, ...newPhotos]);
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

  const markerIcon = new L.Icon({
    iconUrl: "../../assets/marker.png", // Provide a path to your marker icon image
    iconSize: [32, 32], // Set the size of the icon
    iconAnchor: [16, 32], // Anchor the icon to the bottom center
    popupAnchor: [0, -32], // Set the popup anchor position
  });

  const LocationPicker = ({ setFormLocation }) => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setFormLocation((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
        }));
      },
    });
    return null;
  };

  const [formDescription, setFormDescription] = useState({
    title: "",
    description: "",
    highlight: "",
    highlightdescription: "",
    price: 0,
  });
  const handleChangeDescription = (e) => {
    const { name, value } = e.target;
    setFormDescription({
      ...formDescription,
      [name]: value,
    });
  };

  const { listingId } = useParams();
  const navigate = useNavigate();
  console.log(listingId);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/properties/${listingId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch listing data");
        }
        const data = await response.json();
        console.log(data.category);
        // Populate state with fetched data
        setCategory(data.category);
        setType(data.type);
        setFormLocation({
          streetAddress: data.streetAddress,
          aptSuit: data.aptSuit,
          city: data.city,
          province: data.province,
          country: data.country,
          latitude: data.latitude,
          longitude: data.longitude,
        });
        setPhotos(data.listingPhotoPaths || []);
        setFormDescription({
          title: data.title,
          description: data.description,
          highlight: data.highlight,
          highlightdescription: data.highlightdescription,
          price: data.price,
        });
        setGuestcount(data.guestCount || 1);
        setBathroomcount(data.bathroomCount || 1);
        setBedcount(data.bedCount || 1);
        setBedRoomcount(data.bedroomCount || 1);
        setAmenities(data.amenities[0].split(",") || []);
      } catch (error) {
        console.error("Error fetching listing data:", error);
      }
    };

    fetchListing();
  }, [listingId]);

  console.log(bedroomCount);
  
  

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const listingForm = new FormData();
      listingForm.append("category", category);
      listingForm.append("type", type);
      listingForm.append("streetAddress", formLocation.streetAddress);
      listingForm.append("aptSuit", formLocation.aptSuit);
      listingForm.append("city", formLocation.city);
      listingForm.append("province", formLocation.province);
      listingForm.append("country", formLocation.country);
      listingForm.append("guestCount", guestCount);
      listingForm.append("bathroomCount", bathroomCount);
      listingForm.append("bedroomCount", bedroomCount);
      listingForm.append("bedCount", bedCount);
      listingForm.append("amenities", amenities);
      listingForm.append("title", formDescription.title);
      listingForm.append("description", formDescription.description);
      listingForm.append("highlight", formDescription.highlight);
      listingForm.append("latitude", formLocation.latitude);
      listingForm.append("longitude", formLocation.longitude);
      listingForm.append(
        "highlightdescription",
        formDescription.highlightdescription
      );
      listingForm.append("price", formDescription.price);

      photos.forEach((photo) => {
        listingForm.append("listingPhotos", photo);
      });

     
      const response = await fetch(
        `http://localhost:3001/properties/update/${listingId}`,
        {
          method: "PUT",
          body: listingForm,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Update Listing failed");
      }

      navigate(`/properties/${listingId}`);
    } catch (err) {
      console.error("Update Listing failed", err);
    }
  };

  return (
    <>
      <Navbar />
      <h1>Update Your Place</h1>

      <div className="create-listing">
        <form onSubmit={handleUpdate}>
          <div className="create-listing_step1">
            <h2>Step 1: Tell us about your place</h2>
            <div className="map-section">
              <h4>Click on the map to select your location</h4>
              <MapContainer
                center={[23.8103, 90.4125]} // Center on Dhaka
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: "300px", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                <LocationPicker setFormLocation={setFormLocation} />
                {formLocation.latitude && formLocation.longitude && (
                  <Marker
                    position={[formLocation.latitude, formLocation.longitude]}
                    icon={markerIcon}
                  />
                )}
              </MapContainer>
            </div>

            <hr />
            <h3>Which of these categories best describes your place?</h3>
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
            <h3>What type of place will a person have?</h3>
            <div className="type-list">
              {types?.map((item, index) => (
                // Use parentheses for an implicit return
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
            <h3>Where's your place located?</h3>
            <div className="full">
              <div className="location">
                <p>Street Address</p>
                <input
                  type="text"
                  placeholder="Street Address"
                  name="streetAddress"
                  value={formLocation.streetAddress}
                  onChange={handleChangeLocation}
                  required
                />
              </div>
            </div>
            <div className="half">
              <div className="location">
                <p>Apartment,Suit etc (if applicable)</p>
                <input
                  type="text"
                  placeholder="Apt,Suit etc (if applicable)"
                  name="aptSuit"
                  value={formLocation.aptSuit}
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
                  placeholder="country"
                  name="country"
                  value={formLocation.country}
                  onChange={handleChangeLocation}
                  required
                />
              </div>
            </div>
            <h3>Share some basics about your place</h3>
            <div className="basics">
              <div className="basic">Guests</div>
              <div className="basic_count">
                <RemoveCircleOutline
                  onClick={() => {
                    guestCount > 1 && setGuestcount(guestCount - 1);
                  }}
                  sx={{
                    fontSize: "25px",
                    cursor: "pointer",
                    "&:hover": { color: variables.pinkred },
                  }}
                />
                <p>{guestCount}</p>
                <AddCircleOutline
                  onClick={() => {
                    setGuestcount(guestCount + 1);
                  }}
                  sx={{
                    fontSize: "25px",
                    cursor: "pointer",
                    "&:hover": { color: variables.pinkred },
                  }}
                />
              </div>

              <div className="basic">Bathrooms</div>
              <div className="basic_count">
                <RemoveCircleOutline
                  onClick={() => {
                    bathroomCount > 1 && setBathroomcount(bathroomCount - 1);
                  }}
                  sx={{
                    fontSize: "25px",
                    cursor: "pointer",
                    "&:hover": { color: variables.pinkred },
                  }}
                />
                <p>{bathroomCount}</p>
                <AddCircleOutline
                  onClick={() => {
                    setBathroomcount(bathroomCount + 1);
                  }}
                  sx={{
                    fontSize: "25px",
                    cursor: "pointer",
                    "&:hover": { color: variables.pinkred },
                  }}
                />
              </div>

              <div className="basic">Bedrooms</div>
              <div className="basic_count">
                <RemoveCircleOutline
                  onClick={() => {
                    bedroomCount > 1 && setBedRoomcount(bedroomCount - 1);
                  }}
                  sx={{
                    fontSize: "25px",
                    cursor: "pointer",
                    "&:hover": { color: variables.pinkred },
                  }}
                />
                <p>{bedroomCount}</p>
                <AddCircleOutline
                  onClick={() => {
                    setBedRoomcount(bedroomCount + 1);
                  }}
                  sx={{
                    fontSize: "25px",
                    cursor: "pointer",
                    "&:hover": { color: variables.pinkred },
                  }}
                />
              </div>

              <div className="basic">Beds</div>
              <div className="basic_count">
                <RemoveCircleOutline
                  onClick={() => {
                    bedCount > 1 && setBedcount(bedCount - 1);
                  }}
                  sx={{
                    fontSize: "25px",
                    cursor: "pointer",
                    "&:hover": { color: variables.pinkred },
                  }}
                />
                <p>{bedCount}</p>
                <AddCircleOutline
                  onClick={() => {
                    setBedcount(bedCount + 1);
                  }}
                  sx={{
                    fontSize: "25px",
                    cursor: "pointer",
                    "&:hover": { color: variables.pinkred },
                  }}
                />
              </div>
            </div>
          </div>
          <div className="create-listing_step2">
            <h2>Step 2:Make your place stand out</h2>
            <hr />
            <h3>Tell guests what your place has to offer</h3>

            <div className="amenities">
              {facilities?.map((item, index) => (
                <div
                  className={`facility ${
                    amenities.includes(item.name) ? "selected" : ""
                  }`}
                  key={index}
                  onClick={() => handleSelectAmenities(item.name)}
                >
                  <div className="facility_icon"> {item.icon}</div>
                  <p>{item.name}</p>
                </div>
              ))}
            </div>

            <h3>Add some photos of your place</h3>
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
                        {photos.map((photo, index) => {
                            const isFile = photo instanceof File; // Check if it's a new File object or an existing photo path
                            const photoSrc = isFile
                              ? URL.createObjectURL(photo) // For newly uploaded photos
                              : `http://localhost:3001/${photo.replace("public", "")}`; 
                          return (
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
                                  <img
                                    src={photoSrc} alt="listing photo"
                                      
                                    
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRemovePhoto(index)}
                                  >
                                    <BiTrash />
                                  </button>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
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
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            <h3>What make your place attractive and exciting?</h3>
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
              <p>Highligth</p>
              <input
                type="text"
                placeholder="Highlight"
                name="highlight"
                value={formDescription.highlight}
                onChange={handleChangeDescription}
                required
              />
              <p>Highligth Details</p>
              <textarea
                type="text"
                placeholder="Highlight Details"
                name="highlightdescription"
                value={formDescription.highlightdescription}
                onChange={handleChangeDescription}
                required
              />
              <p>Now,set your PRICE</p>
              <span>$</span>
              <input
                type="Number"
                placeholder="1000"
                name="price"
                className="price"
                value={formDescription.price}
                onChange={handleChangeDescription}
                required
              />
            </div>
          </div>
          <button className="submit_btn" type="submit">
            UPDATE LISTING
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default UpdatePage;