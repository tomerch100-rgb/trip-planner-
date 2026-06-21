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
      const activeCategoryNames = TRAVEL_CATEGORIES
        .filter(cat => selectedCategories.includes(cat.id))
        .map(cat => cat.name);

      const categoriesParam = activeCategoryNames.length > 0
        ? activeCategoryNames.join(' and ')
        : 'Top Attractions';

      const response = await attractionsAPI.exploreLive(selectedCity, categoriesParam);
      
      const cityObj = cities.find(c => c.id.toString() === selectedCity.toString());
      const cityName = cityObj ? cityObj.name : "Selected Destination";

      if (onSearchResults) {
        // Extract the country code from the first attraction, default to 'US'
        const fetchedCountryCode = response.data?.[0]?.country_code || 'US';
        
        // Pass it as the third parameter
        onSearchResults(response.data || [], cityName, fetchedCountryCode);
      }

    } catch (err) {
      console.error("Error doing live search:", err);
      alert("Something went wrong with the search. Please make sure the server is running.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 max-w-4xl mx-auto space-y-8 text-left" dir="ltr">
      <div className="space-y-2">
        <h2 className="text-3xl font-black text-slate-800">Where are you traveling?</h2>
        <p className="text-slate-500 font-medium">Select your destination and interests to find the best attractions.</p>
      </div>
      
      {/* Country & City inputs */}
      <div className="flex flex-col md:flex-row gap-6 items-end">
        
        {/* Country Search Input */}
        <div className="flex-1 w-full relative">
          <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Country</label>
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
            className="w-full border-2 border-slate-100 p-4 rounded-xl text-base bg-slate-50/50 hover:bg-white focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-700"
          />
          {/* Country Floating Dropdown */}
          {showCountryDropdown && (
            <ul className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-2xl shadow-slate-200/50 max-h-64 overflow-y-auto py-2">
              {filteredCountries.length > 0 ? (
                filteredCountries.map(c => (
                  <li 
                    key={c.id} 
                    onClick={() => handleSelectCountry(c.id, c.name)}
                    className="px-5 py-3 hover:bg-blue-50 hover:text-blue-700 cursor-pointer text-sm font-bold text-slate-600 transition-colors"
                  >
                    {c.name}
                  </li>
                ))
              ) : (
                <li className="px-5 py-3 text-slate-400 text-sm italic">No countries found...</li>
              )}
            </ul>
          )}
        </div>

        {/* City Search Input */}
        <div className="flex-1 w-full relative">
          <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">City</label>
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
            className="w-full border-2 border-slate-100 p-4 rounded-xl text-base bg-slate-50/50 hover:bg-white focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-700 disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed"
          />
          {/* City Floating Dropdown */}
          {showCityDropdown && selectedCountry && (
            <ul className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-2xl shadow-slate-200/50 max-h-64 overflow-y-auto py-2">
              {filteredCities.length > 0 ? (
                filteredCities.map(c => (
                  <li 
                    key={c.id} 
                    onClick={() => handleSelectCity(c.id, c.name)}
                    className="px-5 py-3 hover:bg-blue-50 hover:text-blue-700 cursor-pointer text-sm font-bold text-slate-600 transition-colors"
                  >
                    {c.name}
                  </li>
                ))
              ) : (
                <li className="px-5 py-3 text-slate-400 text-sm italic">No cities found...</li>
              )}
            </ul>
          )}
        </div>

        {/* Submit Search Button */}
        <button 
          type="button" 
          onClick={handleLiveSearch} 
          disabled={!selectedCity || loading}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 disabled:opacity-50 disabled:shadow-none disabled:transform-none disabled:cursor-not-allowed w-full md:w-auto h-[60px] flex items-center justify-center"
        >
          {loading ? 'Searching...' : 'Find Attractions'}
        </button>
      </div>

      {/* Categories Interest Section */}
      <div className="border-t border-slate-100 pt-6 mt-8">
        <label className="block text-sm font-bold text-slate-700 mb-4 ml-1">What are you interested in doing? (Select multiple)</label>
        <div className="flex flex-wrap gap-3">
          {TRAVEL_CATEGORIES.map((category) => {
            const isSelected = selectedCategories.includes(category.id);
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategoryClick(category.id)}
                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl border-2 text-sm font-bold transition-all cursor-pointer select-none active:scale-95 ${
                  isSelected 
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' 
                    : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="text-lg">{category.icon}</span>
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