import React, { useState, useEffect, useRef } from 'react';
import '../styles/RentPredictorPage.scss';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function RentPredictorPage() {
  // Form state
  const [formData, setFormData] = useState({
    Location: '',
    Area: '',
    Bed: '',
    Bath: ''
  });
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Response state
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Ref for the dropdown
  const dropdownRef = useRef(null);

  // Popular locations from your dataset
  const popularLocations = [
   "Mohammadpur Dhaka",  
    "Mirpur Dhaka",  
    "Block D Section 12 Mirpur Dhaka",  
    "Dhanmondi Dhaka",  
    "Block E Section 12 Mirpur Dhaka",  
    "Sector 10 Uttara Dhaka",  
    "Paikpara Ahmed Nagar Mirpur Dhaka",  
    "Kallyanpur Mirpur Dhaka",  
    "Section 12 Mirpur Dhaka",  
    "Block B Section 12 Mirpur Dhaka",  
    "Joar Sahara Dhaka",  
    "Block C Section 12 Mirpur Dhaka",  
    "West Shewrapara Mirpur Dhaka",  
    "Shyamoli Dhaka",  
    "PC Culture Housing Mohammadpur Dhaka",  
    "Hazaribag Dhaka",  
    "South Baridhara Residential AreaD. I. T. Project Badda Dhaka",  
    "Block G Bashundhara R-A Dhaka",  
    "Sector 13 Uttara Dhaka",  
    "Uttar Badda Badda Dhaka",  
    "Baitul Aman Housing Society Adabor Dhaka",  
    "Section 1 Mirpur Dhaka",  
    "Mohammadi Housing LTD. Mohammadpur Dhaka",  
    "Badda Dhaka",  
    "Middle Badda Badda Dhaka",  
    "Shahjahanpur Dhaka",  
    "Sector 14 Uttara Dhaka",  
    "Rupnagar R/A Mirpur Dhaka",  
    "Shantinagar Dhaka",  
    "Ibrahimpur Dhaka",  
    "Block D Bashundhara R-A Dhaka",  
    "Malibagh Dhaka",  
    "Avenue 5 Block C Section 11 Mirpur Dhaka",  
    "Block C Bashundhara R-A Dhaka",  
    "Shantibag Malibagh Dhaka",  
    "Sector 12 Uttara Dhaka",  
    "West Dhanmondi and Shangkar Dhanmondi Dhaka",  
    "Sector 11 Uttara Dhaka",  
    "Senpara Parbata Section 10 Mirpur Dhaka",  
    "Kalachandpur Dhaka",  
    "Block A Rajuk Uttara Apartment Project Sector 18 Uttara Dhaka",  
    "Gulshan 2 Gulshan Dhaka",  
    "Maghbazar Dhaka",  
    "Middle Paikpara Mirpur Dhaka",  
    "Banani Dhaka",  
    "North Shahjahanpur Dhaka",  
    "Block F Bashundhara R-A Dhaka",  
    "Sector 3 Uttara Dhaka",  
    "Shah Ali Bag Section 1 Mirpur Dhaka",  
    "Gulshan 1 Gulshan Dhaka",  
    "Block I Bashundhara R-A Dhaka",  
    "Gawair Dakshin Khan Dhaka",  
    "East Kazipara Mirpur Dhaka",  
    "Nayatola Maghbazar Dhaka",  
    "Manikdi Cantonment Dhaka",  
    "Jagannathpur Badda Dhaka",  
    "Ashkona Dakshin Khan Dhaka",  
    "Pirerbag Mirpur Dhaka",  
    "Bashabo Dhaka",  
    "Block A Bashundhara R-A Dhaka",  
    "Kafrul Dhaka",  
    "Section 10 Mirpur Dhaka",  
    "Nadda Dhaka",  
    "Sector 5 Uttara Dhaka",  
    "Sector 9 Uttara Dhaka",  
    "East Shewrapara Mirpur Dhaka",  
    "Kuril Dhaka",  
    "Mohammadia Housing Society Mohammadpur Dhaka",  
    "Baridhara Dhaka",  
    "Block A Section 12 Mirpur Dhaka",  
    "Dakkhin Paikpara Paikpara Mirpur Dhaka",  
    "Block A Section 10 Mirpur Dhaka",  
    "West Rampura Rampura Dhaka",  
    "Tejgaon Dhaka",  
    "South Pirerbag Pirerbag Mirpur Dhaka",  
    "Section 2 Mirpur Dhaka",  
    "Tajmahal Road Mohammadpur Dhaka",  
    "Block D Eastern Housing Pallabi Mirpur Dhaka",  
    "Block A Sayednagar East Vatara Vatara Badda Dhaka",  
    "Vashantek Cantonment Dhaka",  
    "Matikata Cantonment Dhaka",  
    "Block B Nobodoy Housing Society Mohammadpur Dhaka",  
    "Kalabagan Dhaka",  
    "Kathalbagan Dhaka",  
    "Dakshin Khan Dhaka",  
    "West Kalachandpur Kalachandpur Dhaka",  
    "Faydabad Dakshin Khan Dhaka",  
    "Suchona Model Town Bochila Mohammadpur Dhaka",  
    "Avenue 2 Mirpur DOHS Mirpur Dhaka",  
    "Sector 7 Uttara Dhaka",  
    "Eastern Pallabi Pallabi Mirpur Dhaka",  
    "Block J Bashundhara R-A Dhaka",  
    "Sector 4 Uttara Dhaka",  
    "Block F Aziz Moholla Mohammadpur Dhaka",  
    "Block K South Banasree Project Banasree Dhaka",  
    "Block B Section 11 Mirpur Dhaka",  
    "Block B Chandrima Model Town Mohammadpur Dhaka",  
    "Khilgaon Dhaka",  
    "Nurer Chala Badda Dhaka",  
    "Block H Bashundhara R-A Dhaka",
    "Other"
  ];

  // Filter locations when search term changes
  useEffect(() => {
    if (searchTerm) {
      const filtered = popularLocations
        .filter(loc => loc.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
          // Sort by relevance: exact matches first, then starts with, then includes
          const aLower = a.toLowerCase();
          const bLower = b.toLowerCase();
          const term = searchTerm.toLowerCase();
          
          if (aLower === term && bLower !== term) return -1;
          if (bLower === term && aLower !== term) return 1;
          if (aLower.startsWith(term) && !bLower.startsWith(term)) return -1;
          if (bLower.startsWith(term) && !aLower.startsWith(term)) return 1;
          return a.localeCompare(b); // Alphabetical for the rest
        });
      setFilteredLocations(filtered);
      setShowDropdown(true);
    } else {
      setFilteredLocations([]);
      setShowDropdown(false);
    }
  }, [searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleLocationSearch = (e) => {
    setSearchTerm(e.target.value);
    setFormData({
      ...formData,
      Location: e.target.value
    });
  };

  const handleLocationSelect = (location) => {
    setFormData({
      ...formData,
      Location: location
    });
    setSearchTerm(location);
    setShowDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: formData.Location,
          area: parseInt(formData.Area),
          bedrooms: parseInt(formData.Bed),
          bathrooms: parseInt(formData.Bath)
        }),
      });

      if (!response.ok) {
        throw new Error('Prediction failed');
      }

      const data = await response.json();
      setPrediction(data.prediction);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Format prediction to BDT with commas
  const formatCurrency = (value) => {
    if (!value) return '';
    
    // Format as BDT with commas
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'BDT',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <>
      <Navbar />
    <div className="App">
      <header className="App-header">
        <h1>Dhaka House Rent Predictor</h1>
      </header>
      
      <main className="container">
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group location-search" ref={dropdownRef}>
              <label htmlFor="Location">Location</label>
              <input
                type="text"
                id="Location"
                name="Location"
                value={searchTerm}
                onChange={handleLocationSearch}
                placeholder="Search for a location"
                autoComplete="off"
                required
              />
              {showDropdown && filteredLocations.length > 0 && (
                <div className="location-dropdown">
                  {filteredLocations.map((loc) => (
                    <div 
                      key={loc} 
                      className="location-option"
                      onClick={() => handleLocationSelect(loc)}
                    >
                      {loc}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="Area">Area (sq ft)</label>
              <input
                type="number"
                id="Area"
                name="Area"
                value={formData.Area}
                onChange={handleChange}
                min="100"
                placeholder="e.g., 1000"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="Bed">Bedrooms</label>
              <input
                type="number"
                id="Bed"
                name="Bed"
                value={formData.Bed}
                onChange={handleChange}
                min="1"
                max="5"
                placeholder="e.g., 2"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="Bath">Bathrooms</label>
              <input
                type="number"
                id="Bath"
                name="Bath"
                value={formData.Bath}
                onChange={handleChange}
                min="1"
                max="6"
                placeholder="e.g., 2"
                required
              />
            </div>
            
            <button type="submit" disabled={loading}>
              {loading ? 'Predicting...' : 'Predict Rent'}
            </button>
          </form>
        </div>
        
        <div className="result-container">
          {error && <div className="error">{error}</div>}
          
          {prediction !== null && !error && (
            <div className="prediction">
              <h2>Estimated Monthly Rent</h2>
              <div className="prediction-amount">{formatCurrency(prediction)}</div>
              <p>Based on {formData.Bed} bedroom, {formData.Bath} bathroom apartment in {formData.Location} with {formData.Area} sq ft area.</p>
            </div>
          )}
        </div>
      </main>
    </div>
    <Footer/>
    </>
  );
}

export default RentPredictorPage;