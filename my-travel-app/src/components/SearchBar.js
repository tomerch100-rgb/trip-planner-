import React, { useState, useEffect } from 'react';
import { geographyAPI, attractionsAPI, tripsAPI } from '../services/api';

const SearchBar = ({ onSearchResults }) => {
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  
  const [plannedCities, setPlannedCities] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. טעינת מדינות כשהדף עולה
  useEffect(() => {
    geographyAPI.getCountries().then(res => setCountries(res.data));
  }, []);

  // 2. טעינת ערים כשנבחרת מדינה
  useEffect(() => {
    if (selectedCountry) {
      geographyAPI.getCities(selectedCountry).then(res => setCities(res.data));
    } else {
      setCities([]);
    }
  }, [selectedCountry]);

  // 🌟 הפונקציה החסרה: חיפוש חי שמביא נתונים מגוגל ושומר ב-DB המקומי!
  const handleLiveSearch = async () => {
    if (!selectedCity) return;
    setLoading(true);
    try {
      // קריאה ל-explore-live שתמלא לנו את ה-DB באטרקציות של העיר הזו
      const response = await attractionsAPI.exploreLive(selectedCity, "");
      // העברת התוצאות (או מערך ריק במקרה ואין) אל קומפוננטת האב (App.js)
      onSearchResults(response.data.attractions || [], "Live Search");
    } catch (err) {
      console.error("Error doing live search:", err);
    } finally {
      setLoading(false);
    }
  };

  const addCityToPlan = () => {
    if (selectedCity && !plannedCities.find(c => c.id.toString() === selectedCity.toString())) {
      const cityObj = cities.find(c => c.id.toString() === selectedCity.toString());
      const countryName = countries.find(c => c.id.toString() === selectedCountry).name;
      setPlannedCities([...plannedCities, { ...cityObj, countryName }]);
      setSelectedCity('');
    }
  };

  const handlePlanTrip = async (e) => {
    e.preventDefault();
    if (plannedCities.length === 0 || !startDate || !endDate) return;

    setLoading(true);
    try {
      const tripData = {
        city_ids: plannedCities.map(c => c.id),
        start_date: startDate,
        end_date: endDate
      };
      const response = await tripsAPI.planMultiCountryTrip(tripData);
      onSearchResults(response.data.attractions || [], "Multi-City Route");
    } catch (err) {
      console.error("Error planning trip:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 max-w-4xl mx-auto space-y-6">
      
      {/* שלב 1: בחירת יעד וחיפוש אטרקציות */}
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="block text-xs font-bold text-gray-500 mb-1">מדינה</label>
          <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)} className="w-full border p-2.5 rounded-lg text-sm bg-gray-50">
            <option value="">בחר מדינה...</option>
            {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-xs font-bold text-gray-500 mb-1">עיר</label>
          <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="w-full border p-2.5 rounded-lg text-sm bg-gray-50">
            <option value="">בחר עיר...</option>
            {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* הכפתור הראשי שמושך את המידע האמיתי מגוגל */}
        <button 
          type="button" 
          onClick={handleLiveSearch} 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-lg transition whitespace-nowrap"
        >
          {loading ? 'טוען...' : 'חיפוש אטרקציות'}
        </button>

        <button 
          type="button" 
          onClick={addCityToPlan} 
          className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2.5 rounded-lg transition whitespace-nowrap"
        >
          + למסלול מרובה
        </button>
      </div>

      {/* שלב 2 (אופציונלי): בונה טיול מרובה יעדים - יופיע רק אם הוספת ערים למסלול המרובה */}
      {plannedCities.length > 0 && (
        <form onSubmit={handlePlanTrip} className="space-y-4 pt-6 border-t mt-4">
          <h3 className="font-bold text-slate-700">תכנון מסלול מרובה יעדים:</h3>
          
          <div className="space-y-3">
            {Object.entries(plannedCities.reduce((acc, city) => {
              (acc[city.countryName] = acc[city.countryName] || []).push(city);
              return acc;
            }, {})).map(([country, cityList]) => (
              <div key={country} className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-800 text-sm mb-2">{country}</h4>
                <div className="flex flex-wrap gap-2">
                  {cityList.map(city => (
                    <span key={city.id} className="bg-white border border-slate-200 px-3 py-1.5 rounded-full text-xs shadow-sm flex items-center">
                      {city.name}
                      <button type="button" onClick={() => setPlannedCities(plannedCities.filter(c => c.id !== city.id))} className="mr-2 text-red-500 font-bold hover:text-red-700">×</button>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 mb-1">תאריך התחלה</label>
              <input type="date" required onChange={(e) => setStartDate(e.target.value)} className="w-full border p-2.5 rounded-lg text-sm" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 mb-1">תאריך חזרה</label>
              <input type="date" required onChange={(e) => setEndDate(e.target.value)} className="w-full border p-2.5 rounded-lg text-sm" />
            </div>
          </div>

          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition shadow-sm">
            {loading ? 'יוצר תוכנית...' : 'צור טיול כולל'}
          </button>
        </form>
      )}
    </div>
  );
};

export default SearchBar;