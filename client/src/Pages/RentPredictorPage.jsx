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
   "Adabor",
    "Aftab Nagar",
    "Agargaon",
    "Badda",
    "Banani",
    "Banani DOHS",
    "Banasree",
    "Bangshal",
    "Baridhara",
    "Baridhara DOHS",
    "Bashabo",
    "Bashundhara R-A",
    "Cantonment",
    "Dakshin Khan",
    "Dhanmondi",
    "Eskaton",
    "Gulshan",
    "Hatirpool",
    "Hazaribag",
    "Ibrahimpur",
    "Jatra Bari",
    "Joar Sahara",
    "Kachukhet",
    "Kafrul",
    "Kakrail",
    "Kalabagan",
    "Kalachandpur",
    "Kathalbagan",
    "Khilgaon",
    "Khilkhet",
    "Kotwali",
    "Kuril",
    "Lalbagh",
    "Lalmatia",
    "Maghbazar",
    "Malibagh",
    "Mirpur",
    "Mohakhali",
    "Mohakhali DOHS",
    "Mohammadpur",
    "Motijheel",
    "Mugdapara",
    "Nadda",
    "New Market",
    "Niketan",
    "Nikunja",
    "North Shahjahanpur",
    "Rampura",
    "Shahjahanpur",
    "Shantinagar",
    "Shegunbagicha",
    "Shiddheswari",
    "Shyamoli",
    "Shyampur",
    "Sutrapur",
    "Tejgaon",
    "Turag",
    "Uttar Khan",
    "Uttara"
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