import React from "react";
import "../styles/List.scss";
import { useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import ListingCard from "../components/ListingCard";
import Footer from "../components/Footer";

const WishList = () => {
  const wishList = useSelector((state) => state.user.wishList);

  return (
    <>
      <Navbar />
      <h1 className="title-list">Your Wish List</h1>
      <div className="list">
        {wishList && wishList.length > 0 ? (
          wishList.map(
            ({
              _id,
              creator,
              listingPhotoPaths,
              thana,
              postcode,
              country,
              category,
              type,
              price,
              booking = false,
            }) => (
              <ListingCard
                key={_id}
                listingId={_id}
                creator={creator}
                listingPhotoPaths={listingPhotoPaths}
                thana={thana}
                postcode={postcode}
                country={country}
                category={category}
                type={type}
                price={price}
                booking={booking}
              />
            )
          )
        ) : (
          <p>Your wish list is currently empty.</p>
        )}
      </div>
      <Footer />
    </>
  );
};

export default WishList;
