import { useState, useEffect } from "react";
import ListingCard from "./ListingCard";

const ParentComponent = () => {
  const [listings, setListings] = useState([]);

  const fetchListings = async () => {
    const response = await fetch("http://localhost:3001/properties");
    const data = await response.json();
    setListings(data);
  };

  const handleDelete = (deletedListingId) => {
    setListings((prevListings) =>
      prevListings.filter((listing) => listing._id !== deletedListingId)
    );
  };

  useEffect(() => {
    fetchListings();
  }, []);

  return (
    <div>
      {listings.map((listing) => (
        <ListingCard
          key={listing._id}
          {...listing}
          onDelete={()=>{console.log("hello vai")}}
        />
      ))}
    </div>
  );
};

export default ParentComponent;
