import React, { useEffect, useState } from 'react';
import { tripsAPI } from '../services/api';
import { CalendarDays, Trash2, MapPin, Loader, ArrowRight } from 'lucide-react';

export default function PersonalArea({ onViewTripSummary }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrip = async (tripId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this trip permanently?");
    if (!confirmDelete) return;

    try {
      await tripsAPI.deleteTrip(tripId);
      setTrips(trips.filter(trip => trip.id !== tripId)); 
      alert("Trip deleted successfully!");
    } catch (err) {
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
                className="absolute top-6 right-6 p-2.5 bg-red-50 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/30 z-10"
                title="Delete Trip"
              >
                <Trash2 size={18} strokeWidth={2.5} />
              </button>

              <div className="mb-6 relative z-10">
                <span className="bg-gradient-to-r from-purple-100 to-fuchsia-100 text-purple-700 text-xs font-black px-4 py-1.5 rounded-full border border-purple-200/50 shadow-sm">
                  Trip #{trip.id}
                </span>
              </div>
              
              <h3 className="text-2xl font-black text-slate-800 mb-3 relative z-10">
                🌍 {trip.city ? `${trip.city.name}, ${trip.city.country?.name}` : `Destination Code: ${trip.city_id}`}
              </h3>
              
              <div className="text-sm font-medium text-slate-500 mb-8 flex-grow space-y-2 relative z-10">
                <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> <strong>Start:</strong> {new Date(trip.start_date).toLocaleDateString('en-US')}</p>
                <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-400"></span> <strong>End:</strong> {new Date(trip.end_date).toLocaleDateString('en-US')}</p>
              </div>

              <button 
                onClick={() => onViewTripSummary(trip.id)}
                className="w-full py-4 flex items-center justify-center gap-2 bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/30 active:scale-95 relative z-10"
              >
                View Itinerary <ArrowRight size={18} strokeWidth={2.5} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}