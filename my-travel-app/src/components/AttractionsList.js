import React, { useState, useEffect } from 'react';
import { attractionsAPI } from '../services/api';

const AttractionsList = ({ attractions: initialAttractions, onAddToTrip }) => {
  const [categories, setCategories] = useState([]); 
  const [selectedCategory, setSelectedCategory] = useState(''); 
  const [maxPrice, setMaxPrice] = useState(''); 
  const [displayedAttractions, setDisplayedAttractions] = useState([]); 
  const [recommendations, setRecommendations] = useState([]); // סטייט חדש להמלצות 🌟

  // טעינת קטגוריות והמלצות מהשרת
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const catResponse = await attractionsAPI.getCategories();
        setCategories(catResponse.data || []);
        
        // שליפת אטרקציות מומלצות על בסיס עבר
        const recResponse = await attractionsAPI.getRecommendations();
        console.log("מה ה-Backend מחזיר בראוט של ההמלצות?:", recResponse.data);
        setRecommendations(recResponse.data || []);
      } catch (err) {
        console.error("Failed to load initial data for attractions:", err);
      }
    };
    loadInitialData();
  }, []);

  // לוגיקת הסינון המקומית (לפי קטגוריה ותקציב)
  useEffect(() => {
    let filtered = initialAttractions || [];

    if (selectedCategory !== '') {
      filtered = filtered.filter(attr => attr.category_id === parseInt(selectedCategory));
    }

    if (maxPrice !== '') {
      filtered = filtered.filter(attr => {
        const price = attr.default_price || attr.actual_price || attr.price || 0;
        return price <= parseFloat(maxPrice);
      });
    }

    setDisplayedAttractions(filtered);
  }, [initialAttractions, selectedCategory, maxPrice]);

  if (!Array.isArray(initialAttractions) || initialAttractions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6 text-right" dir="rtl">
      
      {/* --- אזור אטרקציות מומלצות על בסיס היסטוריה --- */}
      {recommendations.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-5 rounded-xl border border-amber-200 shadow-sm">
          <h3 className="text-md font-bold text-amber-800 mb-3 flex items-center gap-2">
            ✨ מומלץ במיוחד בשבילך (על סמך הטיולים הקודמים שלך)
          </h3>
          <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-thin">
            {recommendations.map((rec, idx) => (
              <div 
                key={rec.id || `rec-${idx}`} 
                className="min-w-[250px] max-w-[280px] bg-white rounded-lg shadow-sm border border-amber-100 p-4 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <h4 className="font-bold text-gray-800 text-sm mb-1 truncate">{rec.name}</h4>
                  <p className="text-gray-500 text-xs line-clamp-2">
                    {rec.editorial_summary || rec.description || rec.address || 'אין תיאור זמין.'}
                  </p>
                </div>
                <button
                  onClick={() => onAddToTrip(rec)}
                  className="w-full mt-3 bg-amber-500 hover:bg-amber-600 text-white py-1.5 rounded-md transition text-xs font-bold shadow-sm"
                >
                  + הוסף לטיול
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* תפריט הסינון המשולב */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1">
          <label className="block text-sm font-bold text-gray-700 mb-1">קטגוריה:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          >
            <option value="">כל הקטגוריות</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-bold text-gray-700 mb-1">תקציב מקסימלי (₪/€/$):</label>
          <input
            type="number"
            min="0"
            placeholder="לדוגמה: 50"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          />
        </div>
      </div>

      {/* גריד האטרקציות הראשי של החיפוש */}
      {displayedAttractions.length === 0 ? (
        <div className="text-center py-10 text-gray-400 bg-white rounded-lg border border-gray-100 shadow-sm">
          <p className="text-sm font-medium">לא נמצאו אטרקציות שמתאימות לסינון שלך.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedAttractions.map((attraction, index) => (
            <div key={attraction.id || index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-semibold text-gray-800">{attraction.name}</h4>
                  <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">
                    {attraction.default_price > 0 ? `${attraction.default_price}` : 'חינם'}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {attraction.editorial_summary || attraction.description || 'אין תיאור זמין עבור אטרקציה זו.'}
                </p>
              </div>
              
              <div className="mt-auto">
                <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500 mb-4">
                  <span>⭐ {attraction.rating || 'N/A'}</span>
                  <span className="truncate max-w-[150px]">{attraction.formatted_address || attraction.address}</span>
                </div>
                
                <button
                  onClick={() => onAddToTrip(attraction)}
                  className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition text-sm font-medium"
                >
                  + הוסף לטיול
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AttractionsList;