import React, { useState, useEffect } from 'react';
import { geographyAPI, attractionsAPI, tripsAPI } from '../services/api';

const SearchBar = ({ onSearchResults }) => {
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [plannedCities, setPlannedCities] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    geographyAPI.getCountries().then(res => setCountries(res.data));
    attractionsAPI.getCategories().then(res => setCategories(res.data || []));
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      geographyAPI.getCities(selectedCountry).then(res => setCities(res.data));
    }
  }, [selectedCountry]);

  const handleLiveSearch = async () => {
    if (!selectedCity) return;
    setLoading(true);
    try {
      const response = await attractionsAPI.exploreLive(selectedCity, selectedCategory);
      onSearchResults(response.data.attractions || [], "Live Search");
    } catch (err) {
      console.error("Error searching:", err);
    } finally {
      setLoading(false);
    }
  };

  const addCityToPlan = () => {
    if (selectedCity) {
      const cityObj = cities.find(c => c.id.toString() === selectedCity.toString());
      if (cityObj) {
        const countryName = countries.find(c => c.id.toString() === selectedCountry)?.name || 'Unknown';
        setPlannedCities([...plannedCities, { ...cityObj, countryName }]);
      }
    }
  };

  const handlePlanTrip = async (e) => {
    e.preventDefault();
    if (plannedCities.length === 0 || !startDate || !endDate) return;
    setLoading(true);
    try {
      const tripData = { city_ids: plannedCities.map(c => c.id), start_date: startDate, end_date: endDate };
      const response = await tripsAPI.planMultiCountryTrip(tripData);
      onSearchResults(response.data.attractions || [], "Multi-City Route");
    } catch (err) {
      console.error("Error planning:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 max-w-4xl mx-auto space-y-6">
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Country</label>
          <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)} className="w-full border p-2.5 rounded-lg text-sm bg-slate-50">
            <option value="">Select...</option>
            {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">City</label>
          <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="w-full border p-2.5 rounded-lg text-sm bg-slate-50">
            <option value="">Select...</option>
            {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Category</label>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full border p-2.5 rounded-lg text-sm bg-slate-50">
            <option value="">All Categories</option>
            {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
          </select>
        </div>
        
        <button 
          type="button" 
          onClick={handleLiveSearch} 
          disabled={loading}
          className={`px-5 py-2.5 rounded-lg font-bold text-white transition ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>

        <button type="button" onClick={addCityToPlan} className="bg-slate-800 text-white font-bold px-4 py-2.5 rounded-lg hover:bg-slate-700 transition">
          + Add
        </button>
      </div>

      {plannedCities.length > 0 && (
        <form onSubmit={handlePlanTrip} className="pt-6 border-t mt-4 space-y-4">
          <h3 className="font-bold text-slate-800">Multi-City Planner</h3>
          <div className="flex gap-4">
             <input type="date" required onChange={(e) => setStartDate(e.target.value)} className="border p-2 rounded w-full" />
             <input type="date" required onChange={(e) => setEndDate(e.target.value)} className="border p-2 rounded w-full" />
             <button type="submit" disabled={loading} className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-emerald-700">
               {loading ? 'Generating...' : 'Plan Trip'}
             </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default SearchBar;