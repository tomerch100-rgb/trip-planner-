import React, { useState, useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import SearchBar from './components/SearchBar';
import AttractionsList from './components/AttractionsList';
// ייבאנו את הרכיב החדש במקום TripBuilder
import ItineraryPlanner from './components/ItineraryPlanner';
import TripSummary from './components/TripSummary';
import 'leaflet/dist/leaflet.css'; 

function App() {
  const { user, logout } = useContext(AuthContext); 
  const [authMode, setAuthMode] = useState('login');
  const [currentStep, setCurrentStep] = useState('destination');
  const [liveAttractions, setLiveAttractions] = useState([]);
  const [selectedCityName, setSelectedCityName] = useState('');
  const [myTripAttractions, setMyTripAttractions] = useState([]); 
  const [createdTripId, setCreatedTripId] = useState(null); 

  const handleSearchResults = (attractionsData, cityName) => {
    setLiveAttractions(attractionsData || []);
    setSelectedCityName(cityName);
    setCurrentStep('attractions'); 
  };

  const handleAddToTrip = (attraction) => {
    if (!attraction || !attraction.name) return; 
    
    if (!myTripAttractions.find(a => a.id === attraction.id)) {
      setMyTripAttractions([...myTripAttractions, attraction]);
      alert(`${attraction.name} הוספה לטיול!`);
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
        <div className="flex gap-4">
          <button onClick={() => setCurrentStep('destination')} className="text-sm font-bold text-slate-600 hover:text-blue-600">
            New Search
          </button>
          <button onClick={handleLogout} className="text-red-500 font-bold">Sign Out</button>
        </div>
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
            {myTripAttractions.length > 0 && (
              <button 
                onClick={() => setCurrentStep('planning')}
                className="fixed bottom-8 right-8 bg-green-600 text-white px-6 py-3 rounded-full shadow-xl hover:bg-green-700 transition"
              >
                Build Itinerary ({myTripAttractions.length}) ➔
              </button>
            )}
          </div>
        )}

        {/* שלב 3: הפעלת רכיב מערכת השעות המתוחכם במקום הישן */}
        {currentStep === 'planning' && (
          <ItineraryPlanner 
            savedAttractions={myTripAttractions} 
            destinationName={selectedCityName} 
            onTripComplete={(tripId) => {
              setCreatedTripId(tripId);
              setCurrentStep('summary');
            }}
          />
        )}

        {currentStep === 'summary' && (
          <TripSummary tripId={createdTripId} />
        )}
      </main>
    </div>
  );
}

export default App;