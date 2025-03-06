import React, { useEffect, useState } from "react";
import "../styles/List.scss";
import Navbar from "../components/Navbar";
import { useDispatch, useSelector } from "react-redux";
import { setTripList } from "../redux/state";
import Loader from "../components/Loader";
import ListingCard from "../components/ListingCard";
import Footer from "../components/Footer";

const TripList = () => {
  const [loading, setLoading] = useState(true);
  const userId = useSelector((state) => state.user._id);
  const tripList = useSelector((state) => state.user.tripList);
  const dispatch = useDispatch();

  const getTripList = async () => {
    try {
      const response = await fetch(`http://localhost:3001/Users/${userId}/trips`, {
        method: "GET",
      });
      const data = await response.json();
      dispatch(setTripList(data));
      setLoading(false);
    } catch (err) {
      console.log("Fetch Trip List failed", err.message);
    }
  };
  useEffect(() => {
    getTripList();
  }, []);
  return loading ? (
    <Loader />
  ) : (
    <>
      <Navbar />
      <h1 className="title-list">Your Previous Visit Request</h1>
      <div className="list">
        {tripList?.map(({listingId,customerId,startDate,endDate,totalPrice,booking=true})=>(
         <ListingCard
         listingId={listingId._id}
         creator={customerId._id}
         listingPhotoPaths={listingId.listingPhotoPaths}
         thana={listingId.thana}
         postcode={listingId.postcode}
         category={listingId.category}
         startDate={startDate}
         endDate={endDate}
         totalPrice={totalPrice}
         booking={booking}
         
         />
        ))}
      </div>
      <Footer/>
    </>
  );
};

export default TripList;
