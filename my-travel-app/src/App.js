import React, { useState, useContext } from 'react';
import SearchBar from './components/SearchBar';
import { AuthContext } from './context/AuthContext';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import AttractionsList from './components/AttractionsList';
import TripBuilder from './components/TripBuilder'; // ייבוא בונה הלו"ז

function App() {
  const [attractions, setAttractions] = useState([]);
  const [destinationName, setDestinationName] = useState('');
  const [savedAttractions, setSavedAttractions] = useState([]); // אטרקציות שנבחרו לטיול
  const { user, logout } = useContext(AuthContext); 
  const [authMode, setAuthMode] = useState('login');

  const handleLogout = () => {
    if (logout) logout();
    else {
      localStorage.removeItem('token');
      window.location.reload(); 
    }
  };

  // פונקציה שמוסיפה אטרקציה מהחיפוש לרשימה של הטיול
  const handleAddToTrip = (attraction) => {
    // מונע הוספה של אותה אטרקציה פעמיים לרשימת הבחירה
    if (!savedAttractions.find(a => a.name === attraction.name)) {
      setSavedAttractions([...savedAttractions, attraction]);
    }
  };

  if (!user) {
    return authMode === 'login' ? (
      <LoginForm onSwitchToRegister={() => setAuthMode('register')} />
    ) : (
      <RegisterForm onSwitchToLogin={() => setAuthMode('login')} />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="rtl">
      <header className="text-center mb-10 relative">
        <div className="absolute top-0 right-0">
          <button onClick={handleLogout} className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-md font-medium transition">
            התנתק
          </button>
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Trip Planner</h1>
        <p className="text-gray-600">תכנן את הטיול המושלם שלך בהתאמה אישית</p>
      </header>

      <main className="max-w-6xl mx-auto space-y-12">
        {/* 1. חיפוש */}
        <section>
<SearchBar onSearchResults={(results, cityName) => {
  setAttractions(results);
  setDestinationName(cityName);
}} />        </section>

        {/* 2. תוצאות חיפוש */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-gray-800">אטרקציות שנמצאו</h2>
          <AttractionsList 
            attractions={attractions} 
            onAddToTrip={handleAddToTrip} 
          />
        </section>

        {/* 3. בונה הלו"ז - מופיע רק אם בחרנו אטרקציות */}
        {/* 3. בונה הלו"ז - מופיע רק אם בחרנו אטרקציות */}
        {savedAttractions.length > 0 && (
          <section className="pt-10 border-t border-gray-200">
            <TripBuilder 
              tripId={9} 
              savedAttractions={savedAttractions} 
              destinationName={destinationName} 
            />
          </section>
        )}
      </main>
    </div>
  );
}

export default App;