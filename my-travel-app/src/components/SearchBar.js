import React, { useState, useEffect } from 'react';
import { geographyAPI, attractionsAPI } from '../services/api';

const SearchBar = ({ onSearchResults }) => {
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [loading, setLoading] = useState(false);

  // טעינת מדינות כשהדף עולה
  useEffect(() => {
    geographyAPI.getCountries().then(res => setCountries(res.data));
  }, []);

  // טעינת ערים כשנבחרת מדינה
  useEffect(() => {
    if (selectedCountry) {
      geographyAPI.getCities(selectedCountry).then(res => setCities(res.data));
    } else {
      setCities([]);
    }
  }, [selectedCountry]);

  // החיפוש הלייב שעובד!
  const handleLiveSearch = async () => {
    if (!selectedCity) return;
    setLoading(true);
    try {
      const response = await attractionsAPI.exploreLive(selectedCity, "");
      
      // חילוץ שם העיר כדי שהכותרת תיראה טוב
      const cityObj = cities.find(c => c.id.toString() === selectedCity.toString());
      const cityName = cityObj ? cityObj.name : "היעד הנבחר";

      onSearchResults(response.data.attractions || [], cityName);
    } catch (err) {
      console.error("Error doing live search:", err);
      alert("הייתה בעיה בחיפוש האטרקציות. ודא שהשרת פועל.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 max-w-3xl mx-auto space-y-4 text-right" dir="rtl">
      <h2 className="text-xl font-bold text-gray-800">לאן טסים?</h2>
      
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-sm font-bold text-gray-600 mb-1">מדינה</label>
          <select 
            value={selectedCountry} 
            onChange={(e) => {setSelectedCountry(e.target.value); setSelectedCity('');}} 
            className="w-full border p-2.5 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">בחר מדינה...</option>
            {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="flex-1 w-full">
          <label className="block text-sm font-bold text-gray-600 mb-1">עיר</label>
          <select 
            value={selectedCity} 
            onChange={(e) => setSelectedCity(e.target.value)} 
            disabled={!selectedCountry}
            className="w-full border p-2.5 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
          >
            <option value="">בחר עיר...</option>
            {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <button 
          type="button" 
          onClick={handleLiveSearch} 
          disabled={!selectedCity || loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-lg transition shadow-md disabled:bg-gray-400 w-full md:w-auto"
        >
          {loading ? 'מחפש...' : 'מצא אטרקציות'}
        </button>
      </div>
    </div>
  );
};

export default SearchBar;