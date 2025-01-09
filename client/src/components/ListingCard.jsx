import { useState, useEffect } from "react";
import "../styles/ListingCard.scss";

import {
  ArrowForwardIos,
  ArrowBackIosNew,
  Favorite,
  Edit,
  Delete,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setWishList } from "../redux/state";

const ListingCard = ({
  listingId,
  creator,
  listingPhotoPaths,
  city,
  province,
  country,
  category,
  type,
  price,
  startDate,
  endDate,
  totalPrice,
  booking,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLandlord, setIsLandlord] = useState(false);
  const [deleted, setDeleted] = useState(false); // State to hide the card after deletion

  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const wishList = user?.wishList || [];
  const isLiked = wishList?.find((item) => item?._id === listingId);

  const goToPrevSlide = () => {
    setCurrentIndex(
      (prevIndex) =>
        (prevIndex - 1 + listingPhotoPaths.length) % listingPhotoPaths.length
    );
  };

  const goToNextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % listingPhotoPaths.length);
  };

  const patchWishList = async () => {
    if (user?._id !== creator._id) {
      try {
        const method = isLiked ? "DELETE" : "PATCH";
        const response = await fetch(
          `http://localhost:3001/Users/${user?._id}/${listingId}`,
          {
            method,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();
        if (response.ok) {
          dispatch(setWishList(data.wishList));

          await fetch(`http://localhost:3001/notification`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: creator._id,
              senderId: user._id,
              listingId,
              message: isLiked
                ? `${user.firstname} removed your property from their wishlist.`
                : `${user.firstname} added your property to their wishlist.`,
            }),
          });
        } else {
          console.error("Failed to update wishlist:", data.message);
        }
      } catch (error) {
        console.error("Error updating wishlist:", error);
      }
    }
  };

  const deleteListing = async (e) => {
    e.stopPropagation();
    try {
      const response = await fetch(`http://localhost:3001/properties/${listingId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        console.log("Listing deleted successfully");
        setDeleted(true); // Mark as deleted locally
      } else {
        console.error("Failed to delete listing");
      }
    } catch (error) {
      console.error("Error deleting listing:", error);
    }
  };

  const editListing = (e) => {
    e.stopPropagation();
    navigate(`/properties/edit/${listingId}`);
  };

  const checkLandlordStatus = async () => {
    if (!user) return;
    try {
      const response = await fetch(
        `http://localhost:3001/users/${user._id}/properties`
      );
      const data = await response.json();

      const landlord = data.some((property) => property._id === listingId);
      setIsLandlord(landlord);
    } catch (error) {
      console.error("Error checking landlord status:", error);
    }
  };

  useEffect(() => {
    checkLandlordStatus(); // Check landlord status on component mount
  }, [user]);

  if (deleted) {
    return null; // Hide the card if it has been deleted
  }

  return (
    <div
      className="listing-card"
      onClick={() => {
        navigate(`/properties/${listingId}`);
      }}
    >
      <div className="slider-container">
        <div
          className="slider"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {listingPhotoPaths?.map((photo, index) => (
            <div key={index} className="slide">
              <img
                src={`http://localhost:3001/${photo?.replace("public", "")}`}
                alt={`photo ${index + 1}`}
              />
              <div
                className="prev-button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevSlide(e);
                }}
              >
                <ArrowBackIosNew sx={{ fontSize: "15px" }} />
              </div>
              <div
                className="next-button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNextSlide(e);
                }}
              >
                <ArrowForwardIos sx={{ fontSize: "15px" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <h3>
        {city}, {province}, {country}
      </h3>
      <p>{category}</p>

      {!booking ? (
        <>
          <p>{type}</p>
          <p>
            <span>${price}</span> per night
          </p>
        </>
      ) : (
        <>
          <p>
            {startDate} - {endDate}
          </p>
          <p>
            <span>${totalPrice}</span> total
          </p>
        </>
      )}

      <div className="action-buttons">
        {isLandlord && (
          <>
            <button className="edit-button" onClick={editListing}>
              <Edit sx={{ fontSize: "20px", color: "blue" }} />
            </button>
            <button className="delete-button" onClick={deleteListing}>
              <Delete sx={{ fontSize: "20px", color: "red" }} />
            </button>
          </>
        )}

        <button
          className="favorite"
          onClick={(e) => {
            e.stopPropagation();
            patchWishList();
          }}
          disabled={!user}
        >
          {isLiked ? (
            <Favorite sx={{ color: "red" }} />
          ) : (
            <Favorite sx={{ color: "white" }} />
          )}
        </button>
      </div>
    </div>
  );
};

export default ListingCard;
