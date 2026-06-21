// import React, { useState, useEffect } from 'react';
// import { attractionsAPI } from '../services/api';

// const AttractionsList = ({ attractions: initialAttractions, onAddToTrip }) => {
//   const [categories, setCategories] = useState([]);
//   const [selectedCategory, setSelectedCategory] = useState('');
//   const [maxPrice, setMaxPrice] = useState('');
//   const [displayedAttractions, setDisplayedAttractions] = useState([]);

//   // טעינת קטגוריות
//   useEffect(() => {
//     const loadCategories = async () => {
//       try {
//         const response = await attractionsAPI.getCategories();
//         setCategories(response.data || []);
//       } catch (err) {
//         console.error("Failed to load categories:", err);
//       }
//     };
//     loadCategories();
//   }, []);

//   // סנכרון עם רשימת האטרקציות שמגיעה מה-Parent
// useEffect(() => {
//     console.log("נתונים שהגיעו מהאבא (initialAttractions):", initialAttractions);
//     setDisplayedAttractions(initialAttractions || []);
//   }, [initialAttractions])

//   const handleApplyFilter = () => {
//     let filtered = initialAttractions || [];

//     if (selectedCategory) {
//       // סינון לפי category_id שהגיע ב-JSON
//       filtered = filtered.filter(attr => String(attr.category_id) === String(selectedCategory));
//     }

//     if (maxPrice) {
//       filtered = filtered.filter(attr => (attr.default_price || 0) <= parseFloat(maxPrice));
//     }

//     setDisplayedAttractions(filtered);
//   };

//   const handleResetFilter = () => {
//     setSelectedCategory('');
//     setMaxPrice('');
//     setDisplayedAttractions(initialAttractions || []);
//   };

//   return (
//     <div className="space-y-6">
//       {/* פילטרים */}
//       <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-end gap-4">
//         <div className="flex-1">
//           <label className="block text-sm font-bold text-gray-700 mb-1">קטגוריה:</label>
//           <select
//             value={selectedCategory}
//             onChange={(e) => setSelectedCategory(e.target.value)}
//             className="w-full p-2 border border-gray-300 rounded-md text-sm"
//           >
//             <option value="">כל הקטגוריות</option>
//             {categories.map((cat) => (
//               <option key={cat.id} value={cat.id}>{cat.name}</option>
//             ))}
//           </select>
//         </div>
//         <button onClick={handleApplyFilter} className="bg-blue-600 text-white px-6 py-2 rounded-md font-bold text-sm h-10">סנן</button>
//         <button onClick={handleResetFilter} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium text-sm h-10">אפס</button>
//       </div>

//       {/* תצוגת הכרטיסיות */}
//       {displayedAttractions.length === 0 ? (
//         <div className="text-center py-12 text-gray-500">לא נמצאו אטרקציות.</div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           {displayedAttractions.map((attraction) =>{
//             console.log(attraction);
//             return (
//             <div key={attraction.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col justify-between">
//               <div>
//                 <div className="flex justify-between items-start mb-2">
//                   <h4 className="text-lg font-semibold text-gray-800">{attraction.name}</h4>
//                   <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
//                     Cat: {attraction.category_id || 'None'}
//                   </span>
//                 </div>
//                 <p className="text-gray-600 text-sm mb-4 line-clamp-3">{attraction.address}</p>
//               </div>
              
//               <div className="mt-auto">
//                 <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500 mb-4">
//                   <span>⭐ {attraction.rating || 'N/A'}</span>
//                 </div>
//                 <button
//                   onClick={() => onAddToTrip(attraction)}
//                   className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition text-sm font-medium"
//                 >
//                   + הוסף לטיול
//                 </button>
//               </div>
//             </div>
//             )
// })}
//         </div>
//       )}
//     </div>
//   );
// };

// export default AttractionsList;
import React, { useState, useEffect } from 'react';
import { attractionsAPI } from '../services/api';

const AttractionsList = ({ attractions: initialAttractions, onAddToTrip }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [displayedAttractions, setDisplayedAttractions] = useState([]);

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

  useEffect(() => {
    setDisplayedAttractions(initialAttractions || []);
  }, [initialAttractions]);

  const handleApplyFilter = () => {
    let filtered = initialAttractions || [];

    if (selectedCategory) {
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
    <div className="space-y-6" dir="ltr">
      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-[1.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-end gap-6 text-left mb-8">
        
        {/* Category Filter */}
        <div className="flex-1 w-full">
          <label className="block text-sm font-bold text-slate-700 mb-2">Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-3 border-2 border-slate-100 rounded-xl text-sm font-medium bg-slate-50 hover:bg-white focus:bg-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-700 appearance-none"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Price Filter */}
        <div className="flex-1 w-full">
          <label className="block text-sm font-bold text-slate-700 mb-3 flex justify-between">
            <span>Max Price:</span>
            <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{maxPrice ? `Up to $${maxPrice}` : 'Unlimited'}</span>
          </label>
          <input
            type="range"
            min="0"
            max="1500"
            step="50"
            value={maxPrice || 1500}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full h-2.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600 hover:accent-blue-700 transition-all"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
          <button 
            onClick={handleApplyFilter} 
            className="flex-1 md:w-32 bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            Filter
          </button>
          <button 
            onClick={handleResetFilter} 
            className="flex-1 md:w-32 bg-white hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-xl font-bold text-sm transition-all border-2 border-slate-200 hover:border-slate-300 active:scale-95"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Cards Display */}
      {displayedAttractions.length === 0 ? (
        <div className="text-center py-16 text-slate-500 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-200 font-medium">
          No attractions match your search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {displayedAttractions.map((attraction) => (
            <div key={attraction.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-xl font-black text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors" title={attraction.name}>{attraction.name}</h4>
                </div>
                <div className="flex gap-2 mb-4">
                  <span className="bg-blue-50/80 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-blue-100/50">
                    {attraction.default_price ? `$${attraction.default_price}` : 'Free'}
                  </span>
                  <span className="bg-amber-50/80 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-amber-100/50 flex items-center gap-1">
                    ⭐ {attraction.rating || 'N/A'}
                  </span>
                </div>
                <p className="text-slate-500 text-sm mb-5 line-clamp-2 leading-relaxed" title={attraction.address}>
                  {attraction.address || 'Address unavailable'}
                </p>
              </div>
              
              <div className="mt-auto pt-5 border-t border-slate-100">
                <button
                  onClick={() => onAddToTrip(attraction)}
                  className="w-full bg-slate-50 text-slate-700 hover:bg-blue-600 hover:text-white border border-slate-200 hover:border-blue-600 py-3 rounded-xl transition-all duration-200 text-sm font-bold shadow-sm active:scale-95"
                >
                  + Add to Attraction Bank
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