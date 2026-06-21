import React, { useState, useEffect } from 'react';
import { tripsAPI } from '../services/api';
import MapView from './MapView';
import { Map, MapPin } from 'lucide-react';

const TripSummary = ({ tripId }) => {
    const [itinerary, setItinerary] = useState([]);
    const [tripDetails, setTripDetails] = useState(null); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tripId) return;
        const loadTrip = async () => {
            try {
                const itinRes = await tripsAPI.getTripItinerary(tripId);
                setItinerary(itinRes.data);

                const tripRes = await tripsAPI.getSingleTrip(tripId);
                setTripDetails(tripRes.data);
            } catch (error) {
                console.error("Error loading itinerary", error);
            } finally {
                setLoading(false);
            }
        };
        loadTrip();
    }, [tripId]);

    const dates = [...new Set(itinerary.map(i => i.visit_date))].sort();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-xl font-bold text-fuchsia-600 animate-pulse">Loading itinerary summary...</div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-5xl mx-auto bg-white/50 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white" dir="ltr">
            
            <div className="mb-12 text-center">
                <div className="inline-block p-4 bg-gradient-to-br from-fuchsia-500 to-rose-600 rounded-3xl text-white mb-6 shadow-lg shadow-fuchsia-500/30">
                    <Map size={48} strokeWidth={2} />
                </div>
                <h1 className="text-4xl font-black text-slate-800 tracking-tight">
                   My Itinerary Summary 
                   {tripDetails?.city && (
                       <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-purple-600">
                           in {tripDetails.city.name}, {tripDetails.city.country?.name}
                       </span>
                   )}
                </h1>
            </div>
            
            {dates.length === 0 ? (
                <div className="text-center p-16 text-slate-500 bg-white/80 rounded-3xl border-2 border-dashed border-slate-200 shadow-sm">
                    <MapPin size={48} className="mx-auto mb-4 text-slate-300" />
                    <h3 className="text-xl font-bold">There are no attractions on this schedule.</h3>
                </div>
            ) : (
                <div className="space-y-12">
                    {dates.map((date, index) => (
                        <div key={date} className="bg-white p-6 rounded-3xl shadow-lg shadow-slate-100/50 border border-slate-100 overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-fuchsia-400 to-purple-500"></div>
                            
                            <h2 className="text-2xl font-black text-slate-800 mb-6 pl-4 flex items-center gap-3">
                                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-xl text-sm border border-purple-200 shadow-sm">Day {index + 1}</span>
                                {date}
                            </h2>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50">
                                            <th className="p-4 text-slate-500 font-bold text-sm uppercase tracking-wider rounded-l-xl">Attraction Name</th>
                                            <th className="p-4 text-slate-500 font-bold text-sm uppercase tracking-wider">Start Time</th>
                                            <th className="p-4 text-slate-500 font-bold text-sm uppercase tracking-wider rounded-r-xl">End Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {itinerary
                                            .filter(i => i.visit_date === date)
                                            .sort((a, b) => a.start_time.localeCompare(b.start_time))
                                            .map(item => (
                                                <tr key={item.id} className="hover:bg-fuchsia-50/50 transition-colors group">
                                                    <td className="p-4 font-bold text-slate-800 group-hover:text-fuchsia-700 transition-colors">
                                                        {item.attraction?.name || `Attraction ${item.attraction_id}`}
                                                    </td>
                                                    <td className="p-4 text-slate-600 font-mono font-medium">
                                                        {item.start_time ? item.start_time.substring(0,5) : '-'}
                                                    </td>
                                                    <td className="p-4 text-slate-600 font-mono font-medium">
                                                        {item.end_time ? item.end_time.substring(0,5) : '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Added Interactive Map at the bottom */}
            {itinerary.length > 0 && (
                <div className="mt-16 bg-white p-6 rounded-3xl shadow-xl shadow-purple-100/50 border border-slate-100">
                    <h2 className="text-3xl font-black text-slate-800 mb-8 text-center flex items-center justify-center gap-3">
                        <span className="text-2xl">🗺️</span> Interactive Route Map
                    </h2>
                    <MapView attractions={itinerary} />
                </div>
            )}
        </div>
    );
};

export default TripSummary;