import React, { useState, useEffect } from 'react';
import { tripsAPI } from '../services/api';

const TripSummary = ({ tripId }) => {
    const [itinerary, setItinerary] = useState([]);
    const [tripDetails, setTripDetails] = useState(null); // 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tripId) return;
        const loadTrip = async () => {
            try {
               // Pull both the schedule and the destination details at the same time!
                const itinRes = await tripsAPI.getTripItinerary(tripId);
                setItinerary(itinRes.data);

                const tripRes = await tripsAPI.getSingleTrip(tripId);
                setTripDetails(tripRes.data);
            } catch (error) {
                console.error("DEBUG: Error loading itinerary", error);
            } finally {
                setLoading(false);
            }
        };
        loadTrip();
    }, [tripId]);

   // Group by dates
    const dates = [...new Set(itinerary.map(i => i.visit_date))].sort();

    if (loading) return <div className="p-10 text-center font-bold text-blue-600">טוען את סיכום המסלול...</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto bg-gray-50 min-h-screen" dir="rtl">
            
           {/*  The new title that introduces the country and city! */}
            <h1 className="text-3xl font-bold text-gray-800 mb-8 border-b-2 border-blue-500 pb-2">
               Summary of my route{tripDetails?.city ? `ב${tripDetails.city.country?.name} (${tripDetails.city.name})` : ''} 
            </h1>
            
            {dates.length === 0 ? (
                <div className="text-center p-10 text-gray-500 bg-white rounded-lg border">There are no attractions on this schedule.</div>
            ) : (
                dates.map((date, index) => (
                    <div key={date} className="mb-8">
                        <h2 className="text-xl font-semibold text-blue-700 mb-4 bg-white p-3 rounded-lg shadow-sm border border-blue-100 inline-block">
                            day {index + 1} | {date}
                        </h2>
                        <table className="w-full bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 text-right">
                            <thead className="bg-gray-100 border-b">
                                <tr>
                                    <th className="p-4 text-gray-600">Attraction name</th>
                                    <th className="p-4 text-gray-600">start</th>
                                    <th className="p-4 text-gray-600">ending</th>
                                </tr>
                            </thead>
                            <tbody>
                                {itinerary
                                    .filter(i => i.visit_date === date)
                                    .sort((a, b) => a.start_time.localeCompare(b.start_time))
                                    .map(item => (
                                        <tr key={item.id} className="border-t hover:bg-gray-50 transition">
                                            <td className="p-4 font-bold text-gray-800">
                                                {item.attraction?.name || `Attraction ${item.attraction_id}`}
                                            </td>
                                            <td className="p-4 text-gray-600 font-mono">
                                                {item.start_time ? item.start_time.substring(0,5) : '-'}
                                            </td>
                                            <td className="p-4 text-gray-600 font-mono">
                                                {item.end_time ? item.end_time.substring(0,5) : '-'}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                ))
            )}
        </div>
    );
};

export default TripSummary;