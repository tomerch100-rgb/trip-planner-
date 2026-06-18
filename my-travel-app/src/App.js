import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from './context/AuthContext';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import SearchBar from './components/SearchBar';
import AttractionsList from './components/AttractionsList';
import ItineraryPlanner from './components/ItineraryPlanner';
import TripSummary from './components/TripSummary';
import 'leaflet/dist/leaflet.css'; 
import RecommendationsPanel from './components/RecommendationsPanel';
import { attractionsAPI } from './services/api';

function App() {
  const { user, logout } = useContext(AuthContext); 
  const [authMode, setAuthMode] = useState('login');
  const [currentStep, setCurrentStep] = useState('destination');
  const [liveAttractions, setLiveAttractions] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedCityName, setSelectedCityName] = useState('');
  const [myTripAttractions, setMyTripAttractions] = useState([]); 
  const [createdTripId, setCreatedTripId] = useState(null); 

 
  useEffect(() => {
    if (currentStep === 'attractions' && user) {
      console.log("DEBUG: מפעיל משיכת המלצות מהשרת...");
      attractionsAPI.getRecommendations()
        .then(res => {
          console.log("DEBUG: המלצות שהתקבלו מהשרת:", res.data);
          // 🌟 לוקחים רק את 3 ההמלצות הראשונות מתוך ה-154 שהתקבלו!
          const topThreeRecommendations = (res.data || []).slice(0, 3);
          setRecommendations(topThreeRecommendations);
        })
        .catch(err => {
          console.error("DEBUG: שגיאה בקבלת המלצות מהשרת:", err);
        });
    }
  }, [currentStep, user]);

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
        <h1 className="text-xl font-bold text-blue-600">Triper</h1>
        <div className="flex gap-4">
          <button onClick={() => setCurrentStep('destination')} className="text-sm font-bold text-slate-600 hover:text-blue-600">
            New Search
          </button>
          <button onClick={handleLogout} className="text-red-500 font-bold">Sign Out</button>
        </div>
      </header>

      <main className="p-8 max-w-full mx-auto" style={{ position: 'relative' }}>
        {currentStep === 'destination' && (
          <SearchBar onSearchResults={handleSearchResults} />
        )}

        {/* שלב 2: תצוגת הכרטיסיות והמלצות העבר האישיות */}
        {currentStep === 'attractions' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '24px', width: '100%', alignItems: 'flex-start' }} dir="rtl">
              
              {/* עמודה ימנית (ראשית) - אטרקציות רגילות - תופסת 70% מהרוחב */}
              <div style={{ flex: '0 0 70%', minWidth: '0' }} className="space-y-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <h2 className="text-2xl font-black text-gray-800">
                    Attractions in {selectedCityName}
                  </h2>
                </div>
                
                <AttractionsList 
                  attractions={liveAttractions} 
                  onAddToTrip={handleAddToTrip} 
                />
              </div>

              {/* עמודה שמאלית (צדדית) - ריבוע הזהב - תופסת 30% מהרוחב */}
              <div style={{ flex: '0 0 30%', position: 'sticky', top: '24px' }}>
                <RecommendationsPanel 
                  recommendations={recommendations} 
                  onAddToTrip={handleAddToTrip} 
                />
              </div>
            </div>

            {/* 🌟 כפתור בניית מסלול מרחף - הוצאנו אותו מחוץ ל-Flexbox ומרכזנו אותו בתחתית המסך באופן עצמאי חסין כשל! */}
            {myTripAttractions.length > 0 && (
              <button 
                onClick={() => setCurrentStep('planning')}
                style={{
                  position: 'fixed',
                  bottom: '32px',
                  left: '50%',
                  transform: 'translateX(-50%)', // ממרכז את הכפתור בדיוק באמצע המסך אופקית
                  backgroundColor: '#16a34a', // צבע ירוק נקי
                  color: '#fff',
                  padding: '16px 36px',
                  borderRadius: '9999px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                  border: '4px solid #fff',
                  cursor: 'pointer',
                  fontWeight: '900',
                  fontSize: '18px',
                  zIndex: 99999, // מוודא שהוא תמיד צף מעל הכל
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(-50%) scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(-50%) scale(1)'}
              >
                בנה לו"ז טיול ({myTripAttractions.length}) ➔
              </button>
            )}
          </>
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