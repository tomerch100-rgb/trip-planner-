import React, { useEffect, useState } from 'react';
import { tripsAPI } from '../services/api';
import { CalendarDays, Trash2, MapPin, Loader, ArrowRight } from 'lucide-react';

export default function PersonalArea({ onViewTripSummary }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // משיכת כל הטיולים של המשתמש בטעינת העמוד
  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const res = await tripsAPI.getTrips();
      setTrips(res.data);
    } catch (err) {
      console.error("שגיאה במשיכת טיולים:", err);
      alert("לא הצלחנו לטעון את הטיולים שלך.");
    } finally {
      setLoading(false);
    }
  };

  // פונקציית מחיקת טיול
  const handleDeleteTrip = async (tripId) => {
    const confirmDelete = window.confirm("האם אתה בטוח שברצונך למחוק טיול זה לצמיתות?");
    if (!confirmDelete) return;

    try {
      await tripsAPI.deleteTrip(tripId);
      // עדכון הסטייט המקומי כדי להעלים את הטיול מהמסך ללא ריענון
      setTrips(trips.filter(trip => trip.id !== tripId)); 
      alert("הטיול נמחק בהצלחה!");
    } catch (err) {
      console.error("שגיאה במחיקת טיול:", err);
      alert("אירעה שגיאה במחיקת הטיול.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-blue-600">
        <Loader className="animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6" dir="rtl">
      <div className="flex items-center gap-3 mb-10 border-b pb-4">
        <CalendarDays size={32} className="text-blue-600" />
        <h1 className="text-3xl font-black text-gray-800">הטיולים שלי</h1>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
          <MapPin size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-600 mb-2">עדיין אין לך טיולים שמורים</h2>
          <p className="text-gray-400">חזור לדף הבית והתחל לתכנן את טיול החלומות שלך!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <div key={trip.id} className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 relative group flex flex-col">
              
              {/* כפתור מחיקה - מופיע בריחוף */}
              <button 
                onClick={() => handleDeleteTrip(trip.id)}
                className="absolute top-4 left-4 p-2 bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                title="מחק טיול"
              >
                <Trash2 size={18} />
              </button>

              <div className="mb-4">
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                  טיול #{trip.id}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">
  🌍            {trip.city ? `${trip.city.country?.name}, ${trip.city.name}` : `יעד קוד: ${trip.city_id}`}
                </h3>
              
              <div className="text-sm text-gray-500 mb-6 flex-grow">
                <p><strong>התחלה:</strong> {new Date(trip.start_date).toLocaleDateString('he-IL')}</p>
                <p><strong>סיום:</strong> {new Date(trip.end_date).toLocaleDateString('he-IL')}</p>
              </div>

              <button 
                onClick={() => onViewTripSummary(trip.id)}
                className="w-full py-3 flex items-center justify-center gap-2 bg-slate-50 hover:bg-blue-50 text-blue-600 font-bold rounded-xl transition-colors border border-blue-100"
              >
                צפה בלו"ז הטיול <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}