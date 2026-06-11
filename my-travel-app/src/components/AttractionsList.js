import React from 'react';

const AttractionsList = ({ attractions, onAddToTrip }) => {
if (!Array.isArray(attractions) || attractions.length === 0) {    return (
      <p className="text-center text-gray-500 mt-10">
        לא נבחרו אטרקציות עדיין. בחר מדינה ועיר כדי להתחיל בחיפוש חי.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {attractions.map((attraction, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col justify-between p-4 border border-gray-100">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{attraction.name}</h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {attraction.editorial_summary || 'אין תיאור זמין עבור אטרקציה זו.'}
            </p>
          </div>
          
          <div className="mt-auto">
            <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500 mb-4">
              <span>⭐ {attraction.rating || 'אין דירוג'}</span>
              <span className="truncate max-w-[150px]">{attraction.formatted_address}</span>
            </div>
            
            {/* כפתור הוספה לטיול */}
            <button
              onClick={() => onAddToTrip(attraction)}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition font-medium"
            >
              + הוסף לטיול
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AttractionsList;