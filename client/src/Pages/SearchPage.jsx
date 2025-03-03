import { useParams } from "react-router-dom";
import "../styles/List.scss";
import { useSelector, useDispatch } from "react-redux";
import { setListings } from "../redux/state";
import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import ListingCard from "../components/ListingCard";
import Footer from "../components/Footer";

const SearchPage = () => {
  const [loading, setLoading] = useState(true);
  const { search } = useParams();
  
  // Filters
  const [bedroomCount, setBedroomCount] = useState("");
  const [bathroomCount, setBathroomCount] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  
  const dispatch = useDispatch();
  const listings = useSelector((state) => state.listings);

  const getSearchListings = async () => {
    try {
      // Create query parameters for search term and filters
      const queryParams = new URLSearchParams({
        searchTerm: search,
        ...(bedroomCount && { bedroomCount }),
        ...(bathroomCount && { bathroomCount }),
        ...(minPrice && { minPrice }),
        ...(maxPrice && { maxPrice }),
      }).toString();

      const response = await fetch(
        `http://localhost:3001/properties/search/${search}?${queryParams}`,
        { method: "GET" }
      );

      const data = await response.json();
      
      // Client-side filtering (to make sure we are applying all filters)
      const filteredListings = data.filter(listing => {
        // Match bedroom count filter
        if (bedroomCount && listing.bedroomCount !== parseInt(bedroomCount)) {
          return false;
        }
        // Match bathroom count filter
        if (bathroomCount && listing.bathroomCount !== parseInt(bathroomCount)) {
          return false;
        }
        // Match min price filter
        if (minPrice && listing.price < parseInt(minPrice)) {
          return false;
        }
        // Match max price filter
        if (maxPrice && listing.price > parseInt(maxPrice)) {
          return false;
        }
        return true;
      });

      dispatch(setListings({ listings: filteredListings }));
      setLoading(false);
    } catch (err) {
      console.log("Fetch Search List failed!", err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    getSearchListings();
  }, [search, bedroomCount, bathroomCount, minPrice, maxPrice]);

  return (
    <>
      <Navbar />
      <h1 className="title-list">{search}</h1>

      <div className="filter-container">
        <select 
          value={bedroomCount} 
          onChange={(e) => setBedroomCount(e.target.value)}
        >
          <option value="">Select Bedrooms</option>
          <option value="1">1 Bedroom</option>
          <option value="2">2 Bedrooms</option>
          <option value="3">3 Bedrooms</option>
          <option value="4">4 Bedrooms</option>
        </select>

        <select 
          value={bathroomCount} 
          onChange={(e) => setBathroomCount(e.target.value)}
        >
          <option value="">Select Bathrooms</option>
          <option value="1">1 Bathroom</option>
          <option value="2">2 Bathrooms</option>
          <option value="3">3 Bathrooms</option>
        </select>

        <input
          type="number"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="list">
          {listings?.length === 0 ? (
            <p>No properties match all selected filters. Try adjusting your criteria.</p>
          ) : (
            listings?.map(({
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
            ))
          )}
        </div>
      )}

      <Footer />
    </>
  );
};

export default SearchPage;
