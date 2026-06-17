import React, { useState, useEffect } from 'react';
import { geographyAPI, attractionsAPI } from '../services/api';
// ייבוא רשימת הקטגוריות הקבועות שהגדרנו בשלב הקודם
import { TRAVEL_CATEGORIES } from '../components/categories';

const SearchBar = ({ onSearchResults }) => {
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  // סטייט חדש לניהול הקטגוריות שהמשתמש בחר (מערך של מזהים, למשל: ['culture', 'nature'])
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // טעינת מדינות כשהדף עולה
  useEffect(() => {
    geographyAPI.getCountries().then(res => setCountries(res.data));
  }, []);

  // טעינת ערים כשנבחרת מדינה
  useEffect(() => {
    if (selectedCountry) {
      geographyAPI.getCities(selectedCountry).then(res => setCountries ? setCities(res.data) : null);
    } else {
      setCities([]);
    }
  }, [selectedCountry]);

  // פונקציה לטיפול בלחיצה על קטגוריה (בחירה מרובה - Toggle)
  const handleCategoryClick = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      // אם כבר נבחרה - נסיר אותה
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      // אם לא נבחרה - נוסיף אותה למערך
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  // החיפוש הלייב המעודכן
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
      const cityName = cityObj ? cityObj.name : "היעד הנבחר";

      // - התיקון: במקום setLiveAttractions, אנחנו שולחים את המידע לאבא (App.js)
      if (onSearchResults) {
        onSearchResults(response.data || [], cityName);
      }

    } catch (err) {
      console.error("Error doing live search:", err);
      alert("הייתה בעיה בחיפוש. ודא שהשרת פועל.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 max-w-3xl mx-auto space-y-6 text-right" dir="rtl">
      <h2 className="text-xl font-bold text-gray-800">לאן טסים?</h2>
      
      {/* אזור הבחירה של מדינה ועיר */}
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
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-lg transition shadow-md disabled:bg-gray-400 w-full md:w-auto h-11"
        >
          {loading ? 'מחפש...' : 'מצא אטרקציות'}
        </button>
      </div>

      {/* אזור חדש ומעוצב לבחירת קטגוריות עניין (Chips) */}
      <div className="border-t border-gray-100 pt-4">
        <label className="block text-sm font-bold text-gray-600 mb-3">מה מעניין אותך לעשות בטיול? (ניתן לבחור כמה)</label>
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