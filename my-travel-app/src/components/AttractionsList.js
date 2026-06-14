import React, { useState, useEffect } from 'react';
import { attractionsAPI } from '../services/api';

const AttractionsList = ({ attractions: initialAttractions, onAddToTrip }) => {
  const [categories, setCategories] = useState([]); 
  const [selectedCategory, setSelectedCategory] = useState(''); 
  const [displayedAttractions, setDisplayedAttractions] = useState([]); 

  // 1. טעינת קטגוריות גלובליות מהשרת
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await attractionsAPI.getCategories();
        setCategories(response.data || []);
      } catch (err) {
        console.error("Failed to load categories from server:", err);
      }
    };
    loadCategories();
  }, []);

  // 2. עדכון האטרקציות כשיש חיפוש חדש
  useEffect(() => {
    setDisplayedAttractions(initialAttractions || []);
    setSelectedCategory(''); 
  }, [initialAttractions]);

  // 3. לוגיקת הסינון המקומי
  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    setSelectedCategory(catId);

    if (!catId || catId === '') {
      setDisplayedAttractions(initialAttractions || []);
    } else {
      const filtered = initialAttractions.filter(attr => 
        attr.category_id === parseInt(catId)
      );
      setDisplayedAttractions(filtered);
    }
  };

  // תנאי הגנה: לא מציג כלום עד שאין באמת תוצאות חיפוש מגוגל/מהשרת
  if (!Array.isArray(initialAttractions) || initialAttractions.length === 0) {
    return null; 
  }

  return (
    <div className="space-y-6">
      
      {/* תפריט הסינון (ללא מפה לידו) */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-700">סינון לפי קטגוריות</h3>
          <p className="text-xs text-gray-500 mt-0.5">בחר קטגוריה כדי לצמצם את רשימת האתרים</p>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="category-select" className="text-xs font-medium text-gray-600 whitespace-nowrap">
            קטגוריה:
          </label>
          <select
            id="category-select"
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="p-2 border border-gray-300 rounded-md bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-w-[200px]"
          >
            <option value="">כל הקטגוריות (ללא סינון)</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* פריסת הכרטיסיות (Grid) - עכשיו פורסות על כל הרוחב ללא המפה! */}
      {displayedAttractions.length === 0 ? (
        <div className="text-center py-16 text-gray-400 flex flex-col items-center justify-center bg-white rounded-lg border border-gray-100 shadow-sm">
          <p className="text-sm font-medium">לא נמצאו אטרקציות בקטגוריה זו.</p>
          <p className="text-xs text-gray-400 mt-1">נסה לבטל את הסינון כדי לראות את כל האתרים ביעד.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedAttractions.map((attraction, index) => (
            <div 
              key={attraction.id || index} 
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col justify-between hover:shadow-md hover:border-blue-300 transition-all"
            >
              <div>
                <h4 className="text-md font-semibold text-gray-800 mb-1">{attraction.name}</h4>
                <p className="text-gray-600 text-xs mb-3 line-clamp-3">
                  {attraction.editorial_summary || attraction.description || 'אין תיאור זמין עבור אטרקציה זו.'}
                </p>
              </div>
              
              <div className="mt-auto">
                <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500 mb-4">
                  <span>⭐ {attraction.rating || 'אין דירוג'}</span>
                  <span className="truncate max-w-[150px]">{attraction.formatted_address || attraction.address}</span>
                </div>
                
               <button
  onClick={(e) => {
    e.preventDefault(); // מונע ריענון דף בטעות
    onAddToTrip(attraction); // שליחת כל אובייקט האטרקציה לאבא
  }}
  className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition text-sm font-medium shadow-sm"
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