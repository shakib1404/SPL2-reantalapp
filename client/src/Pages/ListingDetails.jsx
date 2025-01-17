import { useEffect, useState } from "react";
import "../styles/ListingDetails.scss";
import { useNavigate, useParams } from "react-router-dom";
import { facilities } from "../data";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { DateRange } from "react-date-range";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

// Importing Leaflet and React-Leaflet components
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";

const ListingDetails = () => {
  const [loading, setLoading] = useState(true);
  const { listingId } = useParams();
  const [listing, setListing] = useState(null);
  const [isLandlord, setIsLandlord] = useState(false); // Track landlord status
  const [selectedDate, setSelectedDate] = useState(new Date()); // Booking date
  const [customerDetails, setCustomerDetails] = useState(null);

  const customerId = useSelector((state) => state?.user?._id); // Get user ID
  const userRole = useSelector((state) => state?.user?.role); // Assuming role is stored in Redux

  const navigate = useNavigate();
  //customer details
  const getCustomerDetails = async () => {
    try {
      const response = await fetch(`http://localhost:3001/users/${customerId}`);
      const data = await response.json();
      setCustomerDetails(data);
    } catch (err) {
      console.log("Error fetching customer details:", err.message);
    }
  };

  useEffect(() => {
    if (customerId) {
      getCustomerDetails();
    }
  }, [customerId]);

  // Fetch listing details
  const getListingDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3001/properties/${listingId}`,
        {
          method: "GET",
        }
      );
      const data = await response.json();
      setListing(data);
      setLoading(false);
    } catch (err) {
      console.log("Fetch Listing Details Failed", err.message);
    }
  };

  // Determine if the user is a landlord
  const currentUserRole = async () => {
    if (!customerId) return; // Ensure user is defined before proceeding
    try {
      const response = await fetch(
        `http://localhost:3001/users/${customerId}/properties`
      );
      const data = await response.json();

      // Check if the user has any properties in the propertyList of creator
      const landlord = data.some((property) => property.creator._id === customerId);
      setIsLandlord(landlord);
    } catch (error) {
      console.error("Error checking landlord status:", error);
    }
  };

  // Handle booking date change
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  // Handle booking form submission
  const handleSubmit = async () => {
    try {
      const bookingForm = {
        customerId,
        listingId,
        hostId: listing.creator._id,
        bookingDate: selectedDate.toDateString(), // Use single date
        totalPrice: listing.price, // Single-day price
      };
      console.log(customerId);
      console.log(listingId);
      console.log(listing.creator._id);
      console.log(selectedDate.toDateString());
      console.log(listing.price);


      const response = await fetch("http://localhost:3001/bookings/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingForm),
      });

      if (response.ok) {
        navigate(`/${customerId}/trips`);
      }

      
      await fetch(`http://localhost:3001/notification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: listing.creator._id,
          senderId: customerId,
          listingId,
          type: 'BOOKING_REQUEST',
          message: `${customerDetails.firstname} wants to visit you on ${selectedDate.toDateString()}`
        }),
      });
    } catch (err) {
      console.log("Submit Booking Failed.", err.message);
    }
  };
  const handleChatClick = () => {
    if (isLandlord) {
      // If user is landlord, navigate to the messages associated with this listing
      navigate(`/landlord/inbox/${listingId}`);
    } else {
      // If user is a renter, navigate to chat page
      navigate(`/chat/${listingId}`);
    }
  };
  // Fetch data on component mount
  useEffect(() => {
    getListingDetails();
    currentUserRole();
  }, [customerId, listingId]);

  return loading ? (
    <Loader />
  ) : (
    <>
      <Navbar />
      <div className="listing-details">
        <div className="title">
          <h1>{listing.title}</h1>
          <div></div>
        </div>

        <div className="photos">
          {listing.listingPhotoPaths?.map((item) => (
            <img
              src={`http://localhost:3001/${item.replace("public", "")}`}
              alt="listing photo"
            />
          ))}
        </div>

        <h2>
          {listing.type} in {listing.city}, {listing.province},{" "}
          {listing.country}
        </h2>
        <p>
          {listing.guestCount} guests - {listing.bedroomCount} bedroom(s) -{" "}
          {listing.bedCount} bed(s) - {listing.bathroomCount} bathroom(s)
        </p>
        <hr />

        <div className="profile">
          <img
            src={`http://localhost:3001/${listing.creator.profileimagePath.replace(
              "public",
              ""
            )}`}
          />
          <h3>
            Hosted by {listing.creator.firstname} {listing.creator.lastname}
          </h3>
        </div>
        <hr />

        <h3>Description</h3>
        <p>{listing.description}</p>
        <hr />

        <h3>{listing.highlight}</h3>
        <p>{listing.highlightdescription}</p>
        <hr />

        {/* Location with Leaflet Map */}
        {listing.latitude && listing.longitude && (
          <div className="location">
            <h3>Location</h3>
            <MapContainer
              center={[listing.latitude, listing.longitude]}
              zoom={13}
              style={{ height: "400px", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker
                position={[listing.latitude, listing.longitude]}
                icon={
                  new Icon({
                    iconUrl: "../assets/marker.png",
                    iconSize: [25, 25], // Icon size
                  })
                }
              >
                <Popup>{listing.title}</Popup>
              </Marker>
            </MapContainer>
          </div>
        )}

        <div className="booking">
          <h2>What this place offers?</h2>
          <div className="amenities">
            {listing.amenities[0].split(",").map((item, index) => (
              <div className="facility" key={index}>
                <div className="facility_icon">
                  {
                    facilities.find((facility) => facility.name === item)
                      ?.icon
                  }
                </div>
                <p>{item}</p>
              </div>
            ))}
          </div>

          <hr />
          <div>
            <h2>Choose your stay date:</h2>
            <div className="date-range-calendar">
              <DateRange
                ranges={[
                  {
                    startDate: selectedDate,
                    endDate: selectedDate, // Single date for both start and end
                    key: "selection",
                  },
                ]}
                onChange={(ranges) =>
                  handleDateChange(ranges.selection.startDate)
                } // Handle single date
                showDateDisplay={false} // Hides range details
              />
              <h3>Selected Date: {selectedDate.toDateString()}</h3>
              <h3>Price: ${listing.price}</h3>
              <button className="button" onClick={handleSubmit}>
                Request Booking
              </button>
            </div>
          </div>
        </div>

        {/* Chat Button */}
        {!isLandlord && (
          <div className="chat-button-container">
            <button className="button" onClick={handleChatClick}>
              Chat with Host
            </button>
          </div>
        )}

        {isLandlord&& (
          <div className="chat-button-container">
            <button className="button" onClick={handleChatClick}>
              View Messages
            </button>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default ListingDetails;
