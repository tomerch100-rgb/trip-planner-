import React, { useState } from 'react';
import { tripsAPI } from '../services/api';

// הקומפוננטה מקבלת את מזהה הטיול הפעיל ואת רשימת האטרקציות שהמשתמש שמר בצד
const TripBuilder = ({ tripId, savedAttractions }) => {
  const [itineraryItems, setItineraryItems] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // תואם במדויק למודל ItineraryCreate שלך
  const [formData, setFormData] = useState({
    attraction_id: '',
    visit_date: '',
    start_time: '',
    end_time: '',
    actual_price: 0.0
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // הוספת אייטם לסטייט המקומי לפני שליחה לשרת
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!formData.attraction_id || !formData.visit_date || !formData.start_time || !formData.end_time) return;

    const newItem = {
      trip_id: tripId,
      attraction_id: parseInt(formData.attraction_id),
      visit_date: formData.visit_date,
      start_time: formData.start_time + ":00", // פורמט שרת מתאים ל-time
      end_time: formData.end_time + ":00",
      actual_price: parseFloat(formData.actual_price) || 0.0
    };

    // מיון אוטומטי של הרשימה לפי תאריך ושעה לתצוגה כרונולוגית
    const updatedItinerary = [...itineraryItems, newItem].sort((a, b) => {
      const dateA = new Date(`${a.visit_date}T${a.start_time}`);
      const dateB = new Date(`${b.visit_date}T${b.start_time}`);
      return dateA - dateB;
    });

    setItineraryItems(updatedItinerary);
    
    // איפוס חלקי של הטופס (משאירים את התאריך כדי להקל על הזנת אירועים באותו יום)
    setFormData({ ...formData, attraction_id: '', start_time: '', end_time: '', actual_price: 0.0 });
  };

  // שליחת ה-Bulk לשרת לפי מודל BulkItineraryCreate
  const handleSaveBulk = async () => {
    if (itineraryItems.length === 0) return;
    setLoading(true);

    try {
      // payload התואם לסכמת BulkItineraryCreate הכוללת את השדה items
      const payload = { items: itineraryItems };
      await tripsAPI.createBulkItinerary(payload);
      alert('הלו"ז נשמר בהצלחה בשרת!');
      setItineraryItems([]); // ניקוי הלו"ז המקומי לאחר שמירה
    } catch (err) {
      console.error('שגיאה בשמירת הלו"ז:', err);
      alert('שגיאה בשמירת הנתונים.');
    } finally {
      setLoading(false);
    }
  };

  const removeLocalItem = (indexToRemove) => {
    setItineraryItems(itineraryItems.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto mt-8" dir="rtl">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">בניית לוח זמנים לטיול</h2>
      
      {/* טופס הוספת אטרקציה ללו"ז */}
      <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end mb-8 bg-blue-50 p-4 rounded-lg border border-blue-100">
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">אטרקציה</label>
          <select required name="attraction_id" value={formData.attraction_id} onChange={handleChange} className="w-full border rounded p-2">
            <option value="">בחר אטרקציה...</option>
            {savedAttractions?.map(attr => (
              <option key={attr.id} value={attr.id}>{attr.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">תאריך ביקור</label>
          <input required type="date" name="visit_date" value={formData.visit_date} onChange={handleChange} className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">שעת התחלה</label>
          <input required type="time" name="start_time" value={formData.start_time} onChange={handleChange} className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">שעת סיום</label>
          <input required type="time" name="end_time" value={formData.end_time} onChange={handleChange} className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">מחיר בפועל</label>
          <input type="number" step="0.1" name="actual_price" value={formData.actual_price} onChange={handleChange} className="w-full border rounded p-2" placeholder="0.0" />
        </div>
        <div className="col-span-1 md:col-span-6 flex justify-end mt-2">
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700">
            + הוסף ללו"ז
          </button>
        </div>
      </form>

      {/* תצוגת ציר הזמן (Timeline) של הלו"ז */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4 border-b pb-2">תחנות מתוכננות ({itineraryItems.length})</h3>
        {itineraryItems.length === 0 ? (
          <p className="text-gray-500 text-center py-4">טרם נוספו אטרקציות ללו"ז זה.</p>
        ) : (
          <ul className="space-y-3">
            {itineraryItems.map((item, index) => {
              // שליפת שם האטרקציה להצגה ידידותית
              const attrName = savedAttractions?.find(a => a.id === item.attraction_id)?.name || `אטרקציה ${item.attraction_id}`;
              return (
                <li key={index} className="flex justify-between items-center bg-gray-50 p-3 border rounded border-gray-200">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-800">{attrName}</span>
                    <span className="text-sm text-gray-600">
                      📅 {item.visit_date} | 🕒 {item.start_time.substring(0,5)} - {item.end_time.substring(0,5)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-green-600">₪{item.actual_price}</span>
                    <button onClick={() => removeLocalItem(index)} className="text-red-500 hover:text-red-700 font-bold">✕</button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* כפתור שמירה לשרת ב-Bulk */}
      <button 
        onClick={handleSaveBulk} 
        disabled={loading || itineraryItems.length === 0}
        className="w-full bg-green-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-green-700 disabled:bg-gray-400 transition"
      >
        {loading ? 'שומר נתונים מול השרת...' : 'שמור לו"ז מלא לשרת'}
      </button>
    </div>
  );
};

export default TripBuilder;