import React, { useState, useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import SearchBar from './components/SearchBar';
import AttractionsList from './components/AttractionsList';
import TripBuilder from './components/TripBuilder';

function App() {
  const { user, logout } = useContext(AuthContext); 
  const [authMode, setAuthMode] = useState('login');
  const [currentStep, setCurrentStep] = useState('destination');
  const [liveAttractions, setLiveAttractions] = useState([]);
  const [selectedCityName, setSelectedCityName] = useState('');
  
  // ה-State האמיתי שצובר את האטרקציות שבחרת
  const [myTripAttractions, setMyTripAttractions] = useState([]);
  const [viewMode] = useState('all');

  // פונקציית סינון שמשתמשת במידע האמיתי מה-State
  const getMapAttractions = () => {
    if (viewMode === 'all') return myTripAttractions;
    return myTripAttractions.filter(attr => attr.country_id === viewMode);
  };

  const handleSearchResults = (attractions, cityName) => {
    setLiveAttractions(attractions);
    setSelectedCityName(cityName);
    setCurrentStep('attractions');
  };

  const handleAddToTrip = (attraction) => {
    if (!myTripAttractions.find(a => a.id === attraction.id)) {
      setMyTripAttractions(prev => [...prev, attraction]);
      alert(`${attraction.name} נוספה בהצלחה!`);
    } else {
      alert('אטרקציה זו כבר קיימת במסלול.');
    }
  };

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  if (!user) {
    return authMode === 'login' ? (
      <LoginForm onSwitchToRegister={() => setAuthMode('register')} />
    ) : (
      <RegisterForm onSwitchToLogin={() => setAuthMode('login')} />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white p-4 shadow flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">RoamWise</h1>
        <button onClick={handleLogout} className="text-red-500 font-bold">Sign Out</button>
      </header>

      <main className="p-8 max-w-6xl mx-auto">
        {currentStep === 'destination' && (
          <SearchBar onSearchResults={handleSearchResults} />
        )}
        
        {currentStep === 'attractions' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Attractions in {selectedCityName}</h2>
            <AttractionsList 
              attractions={liveAttractions} 
              onAddToTrip={handleAddToTrip} 
            />
            <button 
              onClick={() => setCurrentStep('planning')} 
              className="fixed bottom-8 right-8 bg-green-600 text-white px-6 py-3 rounded-full shadow-xl hover:bg-green-700 transition"
            >
              Build Itinerary ({myTripAttractions.length}) ➔
            </button>
          </div>
        )}

        {currentStep === 'planning' && (
          <TripBuilder 
            savedAttractions={getMapAttractions()} 
            destinationName={selectedCityName} 
          />
        )}
      </main>
    </div>
  );
}

export default App;