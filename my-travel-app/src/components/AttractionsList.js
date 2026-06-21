import React, { useState, useEffect } from 'react';
import { attractionsAPI } from '../services/api';

const AttractionsList = ({ attractions: initialAttractions, onAddToTrip }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [displayedAttractions, setDisplayedAttractions] = useState([]);

  // Load categories from the server
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

  // Sync with attractions list arriving from parent component
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
      {/* Filters Panel */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-end gap-6 text-left">
        
        {/* Category Filter */}
        {/* Category Filter */}
        <div className="flex-1 w-full">
          <label className="block text-sm font-bold text-slate-700 mb-2">Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-3 border-2 border-slate-100 rounded-xl text-sm font-medium bg-slate-50 hover:bg-white focus:bg-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-700 appearance-none"
          >
            <option value="">All Categories</option>
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Price Filter Slider */}
        <div className="flex-1 w-full">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Max Price: <span className="text-blue-600">{maxPrice ? `Up to ${maxPrice} ₪` : 'Unlimited'}</span>
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

        {/* Filter Actions */}
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={handleApplyFilter} 
            className="flex-1 md:w-32 bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            Filter
            Filter
          </button>
          <button 
            onClick={handleResetFilter} 
            className="flex-1 md:w-32 bg-white hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-xl font-bold text-sm transition-all border-2 border-slate-200 hover:border-slate-300 active:scale-95"
          >
            Reset
            Reset
          </button>
        </div>
      </div>

      {/* Attractions Grid Cards */}
      {displayedAttractions.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
          No attractions found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {displayedAttractions.map((attraction) => (
            <div key={attraction.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-bold text-gray-800 line-clamp-1" title={attraction.name}>
                    {attraction.name}
                  </h4>
                </div>
                
                <div className="flex gap-2 mb-3">
                  <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded-md border border-blue-100">
                    {attraction.default_price ? `${attraction.default_price} ₪` : 'Free'}
                  </span>
                  <span className="bg-amber-50/80 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-amber-100/50 flex items-center gap-1">
                    ⭐ {attraction.rating || 'N/A'}
                  </span>
                </div>
                
                <p className="text-gray-500 text-sm mb-4 line-clamp-2" title={attraction.address}>
                  {attraction.address || 'Address not available'}
                </p>
              </div>
              
              <div className="mt-auto pt-5 border-t border-slate-100">
                <button
                  onClick={() => onAddToTrip(attraction)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-md transition text-sm font-bold shadow-sm"
                >
                  + Add to Trip Bank
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