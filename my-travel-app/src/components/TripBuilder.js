import React, { useState } from 'react';
import MapView from './MapView';

const TripBuilder = ({ savedAttractions, destinationName }) => {
  const [tripDetails, setTripDetails] = useState(null);
  const [daysCount, setDaysCount] = useState(3); 
  const [itinerary, setItinerary] = useState([]);

  const handleStartPlanning = (e) => {
    e.preventDefault();
    if (daysCount <= 0) return;
    setTripDetails({
      destination: destinationName || 'היעד שנבחר',
      daysCount: daysCount
    });
  };

  const handleSchedule = (attraction) => {
    if (!itinerary.find(item => item.name === attraction.name)) {
      setItinerary([...itinerary, { ...attraction, day_number: 1, start_time: '10:00' }]);
    } else {
      alert('האטרקציה הזו כבר משובצת בלו"ז!');
    }
  };

  const handleRemove = (attractionName) => {
    setItinerary(itinerary.filter(item => item.name !== attractionName));
  };

  const handleChangeSchedule = (index, field, value) => {
    const updated = [...itinerary];
    updated[index][field] = value;
    setItinerary(updated);
  };

  const handleSaveItinerary = () => {
    const finalData = {
      ...tripDetails,
      itinerary: itinerary
    };
    console.log("כל הדאטה שמוכן לשליחה ל-Backend:", finalData);
    alert(`הטיול ל-${tripDetails.destination} ל-${tripDetails.daysCount} ימים נשמר בהצלחה!`);
  };

  // --- שלב א': טופס הימים בלבד ---
  if (!tripDetails) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 max-w-md mx-auto text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">מגדירים את הטיול</h2>
        <p className="text-gray-600 mb-6 text-lg">
          בונה לו"ז עבור <span className="font-bold text-blue-600">{destinationName}</span>
        </p>
        
        <form onSubmit={handleStartPlanning} className="space-y-4">
          <div className="text-right">
            <label className="block text-gray-700 font-medium mb-1">לכמה ימים הטיול?</label>
            <input 
              type="number"
              required
              min="1"
              max="30"
              value={daysCount}
              onChange={(e) => setDaysCount(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 transition"
          >
            המשך לשיבוץ אטרקציות ➔
          </button>
        </form>
      </div>
    );
  }

  // --- שלב ב': מסך בניית הלו"ז ---
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
      <div className="flex justify-between items-center mb-6 border-b pb-4 border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            הלו"ז שלי ל{tripDetails.destination}
          </h2>
          <p className="text-sm text-gray-500">משך הטיול: {tripDetails.daysCount} ימים</p>
        </div>
        <button 
          onClick={() => { setTripDetails(null); setItinerary([]); }}
          className="text-sm text-blue-600 hover:underline"
        >
          שנה מספר ימים (מנקה לו"ז)
        </button>
      </div>

      {/* פתיחת ה-div של הגריד שהייתה חסרה */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* צד ימין: סל האטרקציות */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="font-semibold text-blue-800 mb-4 text-lg">סל האטרקציות ({savedAttractions?.length || 0})</h3>
          
          {savedAttractions?.length === 0 ? (
            <p className="text-sm text-gray-500">
              עדיין לא הוספת אטרקציות. חפש למעלה ולחץ על "+ הוסף לטיול".
            </p>
          ) : (
            <ul className="space-y-3">
              {savedAttractions.map((attr, index) => (
                <li key={index} className="bg-white p-3 rounded shadow-sm border border-gray-200 flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-800 truncate pl-2" title={attr.name}>{attr.name}</span>
                  <button 
                    onClick={() => handleSchedule(attr)}
                    className="text-green-600 font-bold hover:text-white hover:bg-green-500 px-3 py-1 rounded transition border border-green-500 shrink-0"
                  >
                    שבץ בלו"ז ➔
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* צד שמאל: הלו"ז המשובץ */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4 text-lg">הלו"ז שלי ({itinerary.length})</h3>
          
          {itinerary.length === 0 ? (
            <div className="min-h-[150px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded bg-white">
              <p className="text-gray-400 text-sm">
                לחץ על "שבץ בלו"ז" כדי לבנות את המסלול...
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {itinerary.map((item, index) => (
                <li key={index} className="bg-white p-3 rounded shadow-sm border border-gray-300 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-gray-800">{item.name}</span>
                    <button 
                      onClick={() => handleRemove(item.name)}
                      className="text-red-500 hover:text-red-700 font-bold px-2"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="flex gap-4 text-sm bg-gray-50 p-2 rounded border border-gray-100">
                    <div className="flex flex-col w-1/2">
                      <label className="text-gray-600 mb-1 text-xs">יום בטיול:</label>
                      <select
                        value={item.day_number}
                        onChange={(e) => handleChangeSchedule(index, 'day_number', parseInt(e.target.value))}
                        className="border border-gray-300 rounded px-2 py-1 bg-white outline-none focus:border-blue-500"
                      >
                        {Array.from({ length: tripDetails.daysCount }, (_, i) => i + 1).map(day => (
                          <option key={day} value={day}>יום {day}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col w-1/2">
                      <label className="text-gray-600 mb-1 text-xs">שעת התחלה:</label>
                      <input 
                        type="time" 
                        value={item.start_time}
                        onChange={(e) => handleChangeSchedule(index, 'start_time', e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div> {/* סגירת ה-div של הגריד */}

      {/* המפה האינטראקטיבית - מופיעה רק אם יש אטרקציות בלו"ז */}
      {itinerary.length > 0 && (
        <div className="mt-8">
          <MapView attractions={itinerary} />
        </div>
      )}

      <div className="mt-8 text-left border-t pt-6">
        <button 
          onClick={handleSaveItinerary}
          disabled={itinerary.length === 0}
          className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold shadow hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          שמור מסלול סופי
        </button>
      </div>
    </div>
  );
};

export default TripBuilder;