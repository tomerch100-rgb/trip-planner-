import React, { useState, useEffect } from 'react';
import { geographyAPI, attractionsAPI } from '../services/api';

const SearchBar = ({ onSearchResults }) => {
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [category, setCategory] = useState('');
  const [maxPrice, setMaxPrice] = useState(''); // הסטייט החדש למחיר
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    geographyAPI.getCountries()
      .then(res => setCountries(res.data))
      .catch(err => console.error("Error fetching countries:", err));
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      geographyAPI.getCities(selectedCountry)
        .then(res => setCities(res.data))
        .catch(err => console.error("Error fetching cities:", err));
    } else {
      setCities([]);
    }
    setSelectedCity('');
  }, [selectedCountry]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!selectedCity) return;
    
    setLoading(true);
    try {
      const res = await attractionsAPI.exploreLive(selectedCity, category);
      
      // חילוץ המערך כמו שעשינו קודם
      let attractionsArray = [];
      if (Array.isArray(res.data)) attractionsArray = res.data;
      else if (res.data?.attractions) attractionsArray = res.data.attractions;
      else if (res.data?.data) attractionsArray = res.data.data;
      else if (res.data?.results) attractionsArray = res.data.results;

      // הסינון החדש: אם המשתמש הזין מחיר מקסימלי, נסנן את האטרקציות
      if (maxPrice) {
        attractionsArray = attractionsArray.filter(attr => {
          // ודא שהשדה price באמת קיים באובייקט שמגיע מהשרת שלך
          // אם קוראים לו אחרת (למשל actual_price), שנה את זה כאן:
          const itemPrice = attr.price || 0; 
          return itemPrice <= Number(maxPrice);
        });
      }

      // מוצאים את שם העיר מתוך מערך הערים לפי ה-ID שנבחר
      const selectedCityObj = cities.find(c => c.id.toString() === selectedCity.toString());
      const cityName = selectedCityObj ? selectedCityObj.name : '';

      // מעבירים החוצה גם את האטרקציות וגם את שם העיר
      onSearchResults(attractionsArray, cityName);
    } catch (err) {
      console.error("Error exploring attractions:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className="bg-white p-6 rounded-lg shadow-md flex flex-wrap gap-4 items-end justify-center">
      <div className="flex flex-col min-w-[150px]">
        <label className="text-gray-700 font-medium mb-1">מדינה</label>
        <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)} className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">בחר מדינה</option>
          {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="flex flex-col min-w-[150px]">
        <label className="text-gray-700 font-medium mb-1">עיר</label>
        <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} disabled={!selectedCountry} className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100">
          <option value="">בחר עיר</option>
          {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="flex flex-col min-w-[150px]">
        <label className="text-gray-700 font-medium mb-1">קטגוריה</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">הכל</option>
          <option value="Museums">מוזיאונים</option>
          <option value="Restaurants">מסעדות</option>
          <option value="Parks">פארקים</option>
          <option value="Tourist Attractions">אטרקציות מובילות</option>
        </select>
      </div>

      {/* השדה החדש של התקציב */}
      <div className="flex flex-col min-w-[120px]">
        <label className="text-gray-700 font-medium mb-1">מחיר מקסימלי (₪)</label>
        <input 
          type="number" 
          min="0"
          placeholder="ללא הגבלה"
          value={maxPrice} 
          onChange={(e) => setMaxPrice(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button type="submit" disabled={loading || !selectedCity} className="bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700 transition disabled:bg-gray-400">
        {loading ? 'מחפש...' : 'חפש אטרקציות'}
      </button>
    </form>
  );
};

export default SearchBar;