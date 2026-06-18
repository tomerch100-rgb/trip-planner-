import React, { useState } from 'react';
import MapView from './MapView';
// 🌟 מייבאים את ה-API כדי שנוכל לשמור באמת בדאטהבייס
import { tripsAPI } from '../services/api';

const TripBuilder = ({ savedAttractions = [], destinationName, onTripComplete }) => {
  const [tripDetails, setTripDetails] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [itinerary, setItinerary] = useState([]);

  // לוגיקת מעבר לשלב ב' וחישוב טווח הימים
  const handleStartPlanning = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // חישוב הפרש הימים כולל יום ההתחלה והסיום
    const differenceInTime = end.getTime() - start.getTime();
    const calculatedDays = Math.ceil(differenceInTime / (1000 * 3600 * 24)) + 1;

    if (calculatedDays <= 0) {
      alert("תאריך החזרה חייב להיות זהה או אחרי תאריך היציאה!");
      return;
    }

    setTripDetails({
      destination: destinationName || 'היעד שנבחר',
      daysCount: calculatedDays,
      startDate: startDate,
      endDate: endDate
    });
  };

  // הוספת אטרקציה ללו"ז המשובץ
  const handleSchedule = (attraction) => {
    if (!itinerary.find(item => item.id === attraction.id || item.name === attraction.name)) {
      setItinerary([...itinerary, { ...attraction, day_number: 1, start_time: '10:00' }]);
    } else {
      alert('האטרקציה הזו כבר משובצת בלו"ז!');
    }
  };

  // הסרת אטרקציה מהלו"ז
  const handleRemove = (attractionName) => {
    setItinerary(itinerary.filter(item => item.name !== attractionName));
  };

  // עדכון יום או שעה של אטרקציה משובצת
  const handleChangeSchedule = (index, field, value) => {
    const updated = [...itinerary];
    updated[index][field] = value;
    setItinerary(updated);
  };

  // 🌟 תיקון: הפכנו את הפונקציה ל-async ומבצעים שמירה אמיתית מול ה-FastAPI
 const handleSaveItinerary = async () => {
    try {
      const tripData = {
        city_ids: [1], 
        start_date: tripDetails.startDate,
        end_date: tripDetails.endDate
      };

      // 1. יצירת הטיול בבסיס הנתונים
      const tripResponse = await tripsAPI.planMultiCountryTrip(tripData);
      const newTripId = tripResponse.data.id; 

      // 2. שמירת האטרקציות לתוך הלו"ז של הטיול שנוצר
      if (itinerary.length > 0) {
        const bulkData = {
          items: itinerary.map(item => ({
            trip_id: newTripId,
            attraction_id: item.id,
            visit_date: tripDetails.startDate, 
            start_time: item.start_time || '10:00',
            end_time: '12:00'
          }))
        };
        // קריאה לפונקציה שקיימת אצלך ב-api.js
        await tripsAPI.createBulkItinerary(bulkData);
      }

      console.log("DEBUG: Trip and Itinerary saved successfully with ID:", newTripId);
      alert(`הטיול ל-${tripDetails.destination} נשמר בהצלחה!`);

      // 3. מעבר אוטומטי למסך הסיכום והמפה של האבא
      if (onTripComplete) {
          onTripComplete(newTripId); 
      }

    } catch (error) {
      console.error("DEBUG: Failed to save itinerary to DB:", error);
      alert("שגיאה בשמירת המסלול בשרת. ודא שה-Backend רץ.");
    }
  };

  // הערה: כאן למטה אמור להמשיך ה-return של ה-JSX שלך שמציג את הטופס והכרטיסיות.
  // אל תיגע ב-return, תשאיר אותו כמו שהוא היה אצלך בקובץ במקור!

  // --- שלב א': טופס בחירת תאריכים ---
  if (!tripDetails) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 max-w-md mx-auto text-right" dir="rtl">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">מגדירים את הטיול</h2>
        <p className="text-gray-600 mb-6 text-center text-sm">
          מתי נוסעים אל <span className="font-bold text-blue-600">{destinationName}</span>?
        </p>
        
        <form onSubmit={handleStartPlanning} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">תאריך התחלה:</label>
            <input 
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">תאריך סיום:</label>
            <input 
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold transition shadow-md text-sm"
          >
            המשך לשיבוץ אטרקציות ➔
          </button>
        </form>
      </div>
    );
  }

  {/* שלב 2: תצוגת הכרטיסיות והמלצות העבר האישיות */}
        {currentStep === 'attractions' && (
          <div style={{ display: 'flex', flexDirection: 'row', gap: '24px', width: '100%', alignItems: 'flex-start', position: 'relative' }} dir="rtl">
            
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

            {/* כפתור בניית מסלול מרחף ויציב בפינה התחתונה */}
            {myTripAttractions.length > 0 && (
              <button 
                onClick={() => setCurrentStep('planning')}
                style={{
                  position: 'fixed',
                  bottom: '32px',
                  right: '32px',
                  backgroundColor: '#16a34a', // צבע ירוק
                  color: '#fff',
                  padding: '16px 32px',
                  borderRadius: '9999px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  border: '4px solid #fff',
                  cursor: 'pointer',
                  fontWeight: '900',
                  fontSize: '18px',
                  zIndex: 9999, // מוודא שהוא תמיד מעל האטרקציות והמפה
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                בנה לו"ז טיול ({myTripAttractions.length}) ➔
              </button>
            )}
            
          </div>
        )}
        {/* צד שמאל: ציר הזמן והלו"ז המשובץ */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 max-h-[500px] overflow-y-auto">
          <h3 className="font-bold text-gray-800 mb-4 text-base">המסלול היומי שלי ({itinerary.length})</h3>
          
          {itinerary.length === 0 ? (
            <div className="min-h-[150px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl bg-white">
              <p className="text-gray-400 text-xs">
                לחץ על "שבץ בלו"ז" כדי להתחיל לבנות את הסדר היומי...
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {itinerary.map((item, index) => (
                <li key={item.id || index} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-gray-800 text-sm">{item.name}</span>
                    <button 
                      onClick={() => handleRemove(item.name)}
                      className="text-gray-400 hover:text-red-500 font-bold px-1 transition text-sm"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="flex gap-4 text-xs bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <div className="flex flex-col w-1/2">
                      <label className="text-gray-500 mb-1 font-medium">יום בטיול:</label>
                      <select
                        value={item.day_number}
                        onChange={(e) => handleChangeSchedule(index, 'day_number', parseInt(e.target.value))}
                        className="border border-gray-300 rounded-md p-1 bg-white outline-none focus:border-blue-500"
                      >
                        {Array.from({ length: tripDetails.daysCount }, (_, i) => i + 1).map(day => (
                          <option key={day} value={day}>יום {day}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col w-1/2">
                      <label className="text-gray-500 mb-1 font-medium">שעת התחלה:</label>
                      <input 
                        type="time" 
                        value={item.start_time}
                        onChange={(e) => handleChangeSchedule(index, 'start_time', e.target.value)}
                        className="border border-gray-300 rounded-md p-1 outline-none focus:border-blue-500 bg-white"
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* חלק המפה - מוצג תמיד! אם יש לו"ז מציג את הלו"ז, אחרת מראה את כל הסל */}
      <div className="mt-6">
        <h3 className="font-bold text-gray-800 mb-3 text-base">מפת האטרקציות במסלול</h3>
        <MapView attractions={itinerary.length > 0 ? itinerary : savedAttractions} />
      </div>

      {/* כפתור שמירה סופי */}
      <div className="mt-8 text-left border-t pt-4">
        <button 
          onClick={handleSaveItinerary}
          disabled={itinerary.length === 0}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-2.5 rounded-lg font-bold shadow-md transition disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
        >
          שמור מסלול סופי
        </button>
      </div>
    </div>
  );
};

export default TripBuilder;