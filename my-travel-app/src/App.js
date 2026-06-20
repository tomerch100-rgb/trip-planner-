import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from './context/AuthContext';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import SearchBar from './components/SearchBar';
import AttractionsList from './components/AttractionsList';
import ItineraryPlanner from './components/ItineraryPlanner';
import TripSummary from './components/TripSummary';
import Dashboard from './components/Dashboard'; 
import PersonalArea from './components/PersonalArea';
import 'leaflet/dist/leaflet.css'; 
import RecommendationsPanel from './components/RecommendationsPanel';
import { attractionsAPI } from './services/api';
import { Home } from 'lucide-react';

function App() {
  const { user, logout } = useContext(AuthContext); 
  const [authMode, setAuthMode] = useState('login');
  const [currentStep, setCurrentStep] = useState('home'); // מתחילים בדף הבית
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
          // לוקחים רק את 3 ההמלצות הראשונות
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
      
      {/* תפריט ניווט עליון (Header) */}
      <header className="bg-white p-4 shadow flex justify-between items-center px-8">
        <h1 
          className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 cursor-pointer"
          onClick={() => setCurrentStep('home')}
        >
          Triper
        </h1>
        <div className="flex gap-6 items-center">
          {currentStep !== 'home' && (
            <button 
              onClick={() => setCurrentStep('home')} 
              className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600 transition"
            >
              <Home size={18} /> דף הבית
            </button>
          )}
          <button onClick={handleLogout} className="text-sm font-bold text-red-500 hover:text-red-700 transition">
            התנתק
          </button>
        </div>
      </header>

      <main className="p-8 max-w-full mx-auto" style={{ position: 'relative' }}>
        
        {/* שלב 0: דף הבית */}
        {currentStep === 'home' && (
          <Dashboard 
            onNewTrip={() => setCurrentStep('destination')} 
            onPersonalArea={() => setCurrentStep('personal_area')} 
          />
        )}

        {/* שלב 0.5: האזור האישי החדש שלנו */}
        {currentStep === 'personal_area' && (
          <PersonalArea 
            onViewTripSummary={(tripId) => {
              setCreatedTripId(tripId);
              setCurrentStep('summary'); // מפנה ישר לצפייה בלו"ז הטיול
            }}
          />
        )}

        {/* שלב 1: חיפוש יעד (SearchBar) */}
        {currentStep === 'destination' && (
          <SearchBar onSearchResults={handleSearchResults} />
        )}

        {/* שלב 2: תצוגת הכרטיסיות (האטרקציות) */}
        {currentStep === 'attractions' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '24px', width: '100%', alignItems: 'flex-start' }} dir="rtl">
              
              {/* עמודה ימנית (ראשית) - אטרקציות רגילות */}
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

              {/* עמודה שמאלית (צדדית) - המלצות */}
              <div style={{ flex: '0 0 30%', position: 'sticky', top: '24px' }}>
                <RecommendationsPanel 
                  recommendations={recommendations} 
                  onAddToTrip={handleAddToTrip} 
                />
              </div>
            </div>

            {/* כפתור בניית מסלול מרחף */}
            {myTripAttractions.length > 0 && (
              <button 
                onClick={() => setCurrentStep('planning')}
                style={{
                  position: 'fixed',
                  bottom: '32px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: '#16a34a',
                  color: '#fff',
                  padding: '16px 36px',
                  borderRadius: '9999px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                  border: '4px solid #fff',
                  cursor: 'pointer',
                  fontWeight: '900',
                  fontSize: '18px',
                  zIndex: 99999,
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

        {/* שלב 3: תכנון הלו"ז */}
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

        {/* שלב 4: סיכום הטיול (אפשר להגיע לכאן גם מהאזור האישי וגם מסיום תכנון טיול חדש) */}
        {currentStep === 'summary' && (
          <TripSummary tripId={createdTripId} />
        )}
      </main>
    </div>
  );
}

export default App;