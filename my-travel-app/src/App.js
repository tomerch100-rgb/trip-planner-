import React, { useState, useContext } from 'react';
import SearchBar from './components/SearchBar';
import { AuthContext } from './context/AuthContext'; // מחקנו את שורת ה-import הכפולה שהייתה מעל
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';

function App() {
  const [attractions, setAttractions] = useState([]);
  const { user } = useContext(AuthContext);
  const [authMode, setAuthMode] = useState('login');

  if (!user) {
    return authMode === 'login' ? (
      <LoginForm onSwitchToRegister={() => setAuthMode('register')} />
    ) : (
      <RegisterForm onSwitchToLogin={() => setAuthMode('login')} />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="rtl">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Trip Planner</h1>
        <p className="text-gray-600">תכנן את הטיול המושלם שלך בהתאמה אישית</p>
      </header>

      <main className="max-w-6xl mx-auto">
        {/* בר החיפוש המדורג */}
        <SearchBar onSearchResults={setAttractions} />

        {/* תצוגת האטרקציות שנמצאו */}
        <div className="mt-10">
          {attractions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {attractions.map((attraction, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col justify-between p-4 border border-gray-100">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{attraction.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {attraction.editorial_summary || 'אין תיאור זמין עבור אטרקציה זו.'}
                    </p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                    <span>⭐ {attraction.rating || 'אין דירוג'}</span>
                    <span className="truncate max-w-[180px]">{attraction.formatted_address}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 mt-10">לא נבחרו אטרקציות עדיין. בחר מדינה ועיר כדי להתחיל בחיפוש חי.</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;