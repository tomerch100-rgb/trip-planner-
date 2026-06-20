import React, { useState, useEffect } from 'react';
import { geographyAPI, attractionsAPI } from '../services/api';
// Importing the travel categories config file
import { TRAVEL_CATEGORIES } from '../components/categories';

const SearchBar = ({ onSearchResults }) => {
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  
  // Storing selected IDs
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  
  // Autocomplete search states
  const [countrySearch, setCountrySearch] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load countries on mount
  useEffect(() => {
    geographyAPI.getCountries().then(res => setCountries(res.data));
  }, []);

  // Load cities when country changes
  useEffect(() => {
    if (selectedCountry) {
      geographyAPI.getCities(selectedCountry).then(res => setCities(res.data));
    } else {
      setCities([]);
    }
  }, [selectedCountry]);

  const handleSelectCountry = (countryId, countryName) => {
    setSelectedCountry(countryId);
    setCountrySearch(countryName);
    setShowCountryDropdown(false);
    // Reset city selection when country changes
    setSelectedCity('');
    setCitySearch('');
  };

  const handleSelectCity = (cityId, cityName) => {
    setSelectedCity(cityId);
    setCitySearch(cityName);
    setShowCityDropdown(false);
  };

  // Filter lists dynamically based on input
  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );
  const filteredCities = cities.filter(c => 
    c.name.toLowerCase().includes(citySearch.toLowerCase())
  );

  const handleCategoryClick = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const handleLiveSearch = async () => {
    if (!selectedCity) return;
    setLoading(true);
    try {
      const activeGoogleTypes = TRAVEL_CATEGORIES
        .filter(cat => selectedCategories.includes(cat.id))
        .flatMap(cat => cat.googleTypes);

      const categoriesParam = activeGoogleTypes.join(',');

      const response = await attractionsAPI.exploreLive(selectedCity, categoriesParam);
      
      const cityObj = cities.find(c => c.id.toString() === selectedCity.toString());
      const cityName = cityObj ? cityObj.name : "Selected Destination";

      if (onSearchResults) {
        onSearchResults(response.data || [], cityName);
      }

    } catch (err) {
      console.error("Error doing live search:", err);
      alert("Something went wrong with the search. Please make sure the server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 max-w-3xl mx-auto space-y-6 text-left" dir="ltr">
      <h2 className="text-xl font-bold text-gray-800">Where are you traveling?</h2>
      
      {/* Country & City inputs */}
      <div className="flex flex-col md:flex-row gap-4 items-end">
        
        {/* Country Search Input */}
        <div className="flex-1 w-full relative">
          <label className="block text-sm font-bold text-gray-600 mb-1">Country</label>
          <input 
            type="text"
            value={countrySearch}
            onChange={(e) => {
              setCountrySearch(e.target.value);
              setShowCountryDropdown(true);
              if (e.target.value === '') {
                setSelectedCountry('');
                setSelectedCity('');
                setCitySearch('');
              }
            }}
            onFocus={() => setShowCountryDropdown(true)}
            onBlur={() => setTimeout(() => setShowCountryDropdown(false), 200)}
            placeholder="Type a country name..."
            className="w-full border p-2.5 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none transition"
          />
          {/* Country Floating Dropdown */}
          {showCountryDropdown && (
            <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
              {filteredCountries.length > 0 ? (
                filteredCountries.map(c => (
                  <li 
                    key={c.id} 
                    onClick={() => handleSelectCountry(c.id, c.name)}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 transition"
                  >
                    {c.name}
                  </li>
                ))
              ) : (
                <li className="px-4 py-2 text-gray-400 text-sm">No countries found...</li>
              )}
            </ul>
          )}
        </div>

        {/* City Search Input */}
        <div className="flex-1 w-full relative">
          <label className="block text-sm font-bold text-gray-600 mb-1">City</label>
          <input 
            type="text"
            value={citySearch}
            onChange={(e) => {
              setCitySearch(e.target.value);
              setShowCityDropdown(true);
              if (e.target.value === '') {
                setSelectedCity('');
              }
            }}
            onFocus={() => setShowCityDropdown(true)}
            onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
            placeholder={selectedCountry ? "Type a city name..." : "Select a country first"}
            disabled={!selectedCountry}
            className="w-full border p-2.5 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {/* City Floating Dropdown */}
          {showCityDropdown && selectedCountry && (
            <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
              {filteredCities.length > 0 ? (
                filteredCities.map(c => (
                  <li 
                    key={c.id} 
                    onClick={() => handleSelectCity(c.id, c.name)}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 transition"
                  >
                    {c.name}
                  </li>
                ))
              ) : (
                <li className="px-4 py-2 text-gray-400 text-sm">No cities found...</li>
              )}
            </ul>
          )}
        </div>

        {/* Submit Search Button */}
        <button 
          type="button" 
          onClick={handleLiveSearch} 
          disabled={!selectedCity || loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-lg transition shadow-md disabled:bg-gray-400 w-full md:w-auto h-11"
        >
          {loading ? 'Searching...' : 'Find Attractions'}
        </button>
      </div>

      {/* Categories Interest Section */}
      <div className="border-t border-gray-100 pt-4">
        <label className="block text-sm font-bold text-gray-600 mb-3">What are you interested in doing? (Select multiple)</label>
        <div className="flex flex-wrap gap-2">
          {TRAVEL_CATEGORIES.map((category) => {
            const isSelected = selectedCategories.includes(category.id);
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategoryClick(category.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium transition cursor-pointer ${
                  isSelected 
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' 
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default SearchBar;