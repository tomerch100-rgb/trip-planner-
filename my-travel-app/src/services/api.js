// src/services/api.js
const API_BASE_URL = 'http://localhost:8000'; // וודא שזה תואם לפורט של ה-FastAPI שלך

export const getCities = async () => {
  const response = await fetch(`${API_BASE_URL}/cities/`);
  return await response.json();
};
// src/components/SearchBar.js
import React, { useState, useEffect } from 'react';
import { getCities } from '../services/api';

const SearchBar = () => {
  const [cities, setCities] = useState([]);

  useEffect(() => {
    getCities().then(data => setCities(data));
  }, []);

  return (
    <div className="flex gap-4 p-6 bg-gray-100 rounded-lg shadow-sm">
      <select className="p-2 border rounded">
        <option>בחר עיר</option>
        {cities.map(city => (
          <option key={city.id} value={city.id}>{city.name}</option>
        ))}
      </select>
      {/* בהמשך נוסיף כאן את הקטגוריות */}
    </div>
  );
};

export default SearchBar;
// src/App.js
import SearchBar from './components/SearchBar';

function App() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Trip Planner</h1>
      <SearchBar />
    </div>
  );
}

export default App;