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
  const [currentStep, setCurrentStep] = useState('home'); 
  const [liveAttractions, setLiveAttractions] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedCityName, setSelectedCityName] = useState('');
  const [myTripAttractions, setMyTripAttractions] = useState([]); 
  const [createdTripId, setCreatedTripId] = useState(null); 
  
  // Currency Localization States
  const [selectedCountryCode, setSelectedCountryCode] = useState('US');
  const [exchangeRates, setExchangeRates] = useState(null); // Added exchange rates state
  
  // Fetch Live Global Financial Exchanges on Application Mount
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await response.json();
        setExchangeRates(data.rates);
      } catch (error) {
        console.error("Failed to fetch international currency rates:", error);
      }
    };
    fetchRates();
  }, []);

  useEffect(() => {
    if (currentStep === 'attractions' && user) {
      console.log("DEBUG: Triggering recommendations fetch from server...");
      attractionsAPI.getRecommendations()
        .then(res => {
          console.log("DEBUG: Recommendations received from server:", res.data);
          // Take only the top 3 items
          const topThreeRecommendations = (res.data || []).slice(0, 3);
          setRecommendations(topThreeRecommendations);
        })
        .catch(err => {
          console.error("DEBUG: Error fetching recommendations from server:", err);
        });
    }
  }, [currentStep, user]);

  const handleSearchResults = (attractionsData, cityName, countryCode = 'US') => {
    setLiveAttractions(attractionsData || []);
    setSelectedCityName(cityName);
    setSelectedCountryCode(countryCode); // Save the extracted code
    setCurrentStep('attractions'); 
  };

  const handleAddToTrip = (attraction) => {
    if (!attraction || !attraction.name) return; 
    
    if (!myTripAttractions.find(a => a.id === attraction.id)) {
      setMyTripAttractions([...myTripAttractions, attraction]);
      alert(`${attraction.name} added to your trip!`);
    } else {
      alert('This attraction is already added to your itinerary.');
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
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Top Header Navigation Panel */}
      <header className="bg-white p-4 shadow flex justify-between items-center px-8">
        <h1 
          className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => setCurrentStep('home')}
        >
          Triper
        </h1>
        <div className="flex gap-6 items-center">
          <button 
            onClick={() => setCurrentStep('home')} 
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-all duration-200"
          >
            <Home size={18} /> Home
          </button>
          <button onClick={handleLogout} className="text-sm font-bold text-red-500 hover:text-white hover:bg-red-500 px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-red-500/20">
            Logout
          </button>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto w-full" style={{ position: 'relative' }}>
        
        {/* Step 0: Dashboard Home Layout */}
        {currentStep === 'home' && (
          <Dashboard 
            onNewTrip={() => setCurrentStep('destination')} 
            onPersonalArea={() => setCurrentStep('personal_area')} 
          />
        )}

        {/* Step 0.5: Personal Dashboard Area */}
        {currentStep === 'personal_area' && (
          <PersonalArea 
            onViewTripSummary={(tripId) => {
              setCreatedTripId(tripId);
              setCurrentStep('summary'); // Redirects directly to viewing the trip schedule timeline
            }}
          />
        )}

        {/* Step 1: Destination Search Panel View (SearchBar) */}
        {currentStep === 'destination' && (
          <SearchBar onSearchResults={handleSearchResults} />
        )}

        {/* Step 2: Grid Attractions Cards Panel and Explorer Views */}
        {currentStep === 'attractions' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '24px', width: '100%', alignItems: 'flex-start' }} dir="ltr">
              
              {/* Main Left Content Block - Regular Attractions Grid List */}
              <div style={{ flex: '0 0 70%', minWidth: '0' }} className="space-y-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-left">
                  <h2 className="text-2xl font-black text-gray-800">
                    Attractions in {selectedCityName}
                  </h2>
                </div>
                
                <AttractionsList 
                  attractions={liveAttractions} 
                  onAddToTrip={handleAddToTrip} 
                  countryCode={selectedCountryCode} 
                  liveRates={exchangeRates} // Passed down dynamically to ensure accurate math!
                />
              </div>

              {/* Sidebar Right Column Block - Personalized Context Recommendations Panel */}
              <div style={{ flex: '0 0 30%', position: 'sticky', top: '24px' }}>
                <RecommendationsPanel 
                  recommendations={recommendations} 
                  onAddToTrip={handleAddToTrip} 
                />
              </div>
            </div>

            {/* Floating Schedule Builder Commitment Button Anchor */}
            {myTripAttractions.length > 0 && (
              <button 
                onClick={() => setCurrentStep('planning')}
                style={{
                  position: 'fixed',
                  bottom: '32px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: '#c026d3', // fuchsia-600 to match vibrant theme
                  color: '#fff',
                  padding: '16px 36px',
                  borderRadius: '9999px',
                  boxShadow: '0 20px 40px rgba(192, 38, 211, 0.3)',
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
                Build Trip Itinerary ({myTripAttractions.length}) ➔
              </button>
            )}
          </>
        )}

        {/* Step 3: Interactive Itinerary Hourly Grid Scheduling Planner */}
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

        {/* Step 4: Final Trip Itinerary Summary and Target Routing Mapping */}
        {currentStep === 'summary' && (
          <TripSummary tripId={createdTripId} />
        )}
      </main>
    </div>
  );
}

export default App;