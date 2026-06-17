import React, { useState, useEffect } from 'react';
import { attractionsAPI } from '../services/api';

const AttractionsList = ({ attractions: initialAttractions, onAddToTrip }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [displayedAttractions, setDisplayedAttractions] = useState([]);

  // טעינת קטגוריות
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await attractionsAPI.getCategories();
        setCategories(response.data || []);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    loadCategories();
  }, []);

  // סנכרון עם רשימת האטרקציות שמגיעה מה-Parent
useEffect(() => {
    console.log("נתונים שהגיעו מהאבא (initialAttractions):", initialAttractions);
    setDisplayedAttractions(initialAttractions || []);
  }, [initialAttractions])

  const handleApplyFilter = () => {
    let filtered = initialAttractions || [];

    if (selectedCategory) {
      // סינון לפי category_id שהגיע ב-JSON
      filtered = filtered.filter(attr => String(attr.category_id) === String(selectedCategory));
    }

    if (maxPrice) {
      filtered = filtered.filter(attr => (attr.default_price || 0) <= parseFloat(maxPrice));
    }

    setDisplayedAttractions(filtered);
  };

  const handleResetFilter = () => {
    setSelectedCategory('');
    setMaxPrice('');
    setDisplayedAttractions(initialAttractions || []);
  };

  return (
    <div className="space-y-6">
      {/* פילטרים */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1">
          <label className="block text-sm font-bold text-gray-700 mb-1">קטגוריה:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">כל הקטגוריות</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <button onClick={handleApplyFilter} className="bg-blue-600 text-white px-6 py-2 rounded-md font-bold text-sm h-10">סנן</button>
        <button onClick={handleResetFilter} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium text-sm h-10">אפס</button>
      </div>

      {/* תצוגת הכרטיסיות */}
      {displayedAttractions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">לא נמצאו אטרקציות.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayedAttractions.map((attraction) =>{
            console.log(attraction);
            return (
            <div key={attraction.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-semibold text-gray-800">{attraction.name}</h4>
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Cat: {attraction.category_id || 'None'}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{attraction.address}</p>
              </div>
              
              <div className="mt-auto">
                <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500 mb-4">
                  <span>⭐ {attraction.rating || 'N/A'}</span>
                </div>
                <button
                  onClick={() => onAddToTrip(attraction)}
                  className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition text-sm font-medium"
                >
                  + הוסף לטיול
                </button>
              </div>
            </div>
            )
})}
        </div>
      )}
    </div>
  );
};

export default AttractionsList;