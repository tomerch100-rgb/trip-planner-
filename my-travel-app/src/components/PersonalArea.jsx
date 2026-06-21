import React, { useEffect, useState } from 'react';
import { tripsAPI } from '../services/api';
import { CalendarDays, Trash2, MapPin, Loader, ArrowRight } from 'lucide-react';

export default function PersonalArea({ onViewTripSummary }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all user trips on component mount
  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const res = await tripsAPI.getTrips();
      setTrips(res.data);
    } catch (err) {
      console.error("Error fetching trips:", err);
      alert("Failed to load your trips.");
      console.error("Error fetching trips:", err);
      alert("Failed to load your trips.");
    } finally {
      setLoading(false);
    }
  };

  // Delete trip handler function
  const handleDeleteTrip = async (tripId) => {
    const confirmDelete = window.confirm("האם אתה בטוח שברצונך למחוק טיול זה לצמיתות?");
    if (!confirmDelete) return;

    try {
      await tripsAPI.deleteTrip(tripId);
      // Update local state to remove the trip from view instantly without a reload
      setTrips(trips.filter(trip => trip.id !== tripId)); 
      alert("Trip deleted successfully!");
      alert("Trip deleted successfully!");
    } catch (err) {
      console.error("Error deleting trip:", err);
      alert("An error occurred while deleting the trip.");
      console.error("Error deleting trip:", err);
      alert("An error occurred while deleting the trip.");
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
    <div className="max-w-6xl mx-auto p-6" dir="ltr">
      <div className="flex items-center gap-4 mb-10 pb-6 border-b border-fuchsia-100">
        <div className="p-3 bg-gradient-to-br from-fuchsia-500 to-rose-500 rounded-2xl shadow-lg shadow-rose-500/30 text-white">
          <CalendarDays size={32} strokeWidth={2.5} />
        </div>
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600">My Trips</h1>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-20 bg-gradient-to-b from-white to-fuchsia-50/30 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white">
          <div className="mx-auto w-20 h-20 bg-fuchsia-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <MapPin size={40} className="text-fuchsia-400" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-3">You don't have any saved trips yet</h2>
          <p className="text-slate-500 font-medium">Go back to the home page and start planning your dream trip!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trips.map((trip) => (
            <div key={trip.id} className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl shadow-fuchsia-100 hover:shadow-2xl hover:shadow-fuchsia-500/20 hover:-translate-y-2 transition-all duration-500 border border-white relative group flex flex-col overflow-hidden text-left">
              
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-bl from-rose-100/60 to-transparent rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>

              <button 
                onClick={() => handleDeleteTrip(trip.id)}
                className="absolute top-4 right-4 p-2 bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                title="Delete Trip"
              >
                <Trash2 size={18} strokeWidth={2.5} />
              </button>

              <div className="mb-4">
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                  Trip #{trip.id}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                🌍 {trip.city ? `${trip.city.country?.name}, ${trip.city.name}` : `Destination Code: ${trip.city_id}`}
              </h3>
              
              <div className="text-sm text-gray-500 mb-6 flex-grow">
                <p><strong>Start:</strong> {new Date(trip.start_date).toLocaleDateString('en-US')}</p>
                <p><strong>End:</strong> {new Date(trip.end_date).toLocaleDateString('en-US')}</p>
              </div>

              <button 
                onClick={() => onViewTripSummary(trip.id)}
                className="w-full py-4 flex items-center justify-center gap-2 bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/30 active:scale-95 relative z-10"
              >
                View Trip Itinerary <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}