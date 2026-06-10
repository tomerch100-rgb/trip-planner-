import React, { useState, useEffect } from 'react';
import { geographyAPI, attractionsAPI } from '../services/api';

const SearchBar = ({ onSearchResults }) => {
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. שליפת מדינות בטעינת הקומפוננטה
useEffect(() => {
  geographyAPI.getCountries()
    .then(res => {
      console.log("Countries:", res.data);
      setCountries(res.data);
    })
    .catch(err => console.error("Error fetching countries:", err));
}, []);

  // 2. האזנה לבחירת מדינה ושליפת הערים המתאימות לה בלבד
  useEffect(() => {
    if (selectedCountry) {
      geographyAPI.getCities(selectedCountry)
        .then(res => setCities(res.data))
        .catch(err => console.error("Error fetching cities:", err));
    } else {
      setCities([]);
    }
    setSelectedCity(''); // איפוס העיר שנבחרה
  }, [selectedCountry]);

  // 3. הגשת הטופס וביצוע החיפוש החי (Proxy מול גוגל)
  const handleSearch = async (e) => {
    e.preventDefault();
    console.log("countries state:", countries);
    if (!selectedCity) return;
    
    setLoading(true);
    try {
      const res = await attractionsAPI.exploreLive(selectedCity, category);
      onSearchResults(res.data); // העברת התוצאות לקומפוננטה האב
    } catch (err) {
      console.error("Error exploring attractions:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className="bg-white p-6 rounded-lg shadow-md flex flex-wrap gap-4 items-end justify-center">
      {/* דרופדאון מדינות */}
      <div className="flex flex-col min-w-[200px]">
        <label className="text-gray-700 font-medium mb-1">מדינה</label>
        <select 
          value={selectedCountry} 
          onChange={(e) => setSelectedCountry(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">בחר מדינה</option>
          {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* דרופדאון ערים - משתנה דינמית */}
      <div className="flex flex-col min-w-[200px]">
        <label className="text-gray-700 font-medium mb-1">עיר</label>
        <select 
          value={selectedCity} 
          onChange={(e) => setSelectedCity(e.target.value)}
          disabled={!selectedCountry}
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        >
          <option value="">בחר עיר</option>
          {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* קטגוריית עניין */}
      <div className="flex flex-col min-w-[200px]">
        <label className="text-gray-700 font-medium mb-1">קטגוריה</label>
        <select 
          value={category} 
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">הכל</option>
          <option value="museum">מוזיאונים</option>
          <option value="restaurant">מסעדות</option>
          <option value="park">פארקים</option>
          <option value="tourist_attraction">אטרקציות מובילות</option>
        </select>
      </div>

      {/* כפתור חיפוש */}
      <button 
        type="submit" 
        disabled={loading || !selectedCity}
        className="bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700 transition disabled:bg-gray-400"
      >
        {loading ? 'מחפש...' : 'חפש אטרקציות'}
      </button>
    </form>
  );
};

export default SearchBar;