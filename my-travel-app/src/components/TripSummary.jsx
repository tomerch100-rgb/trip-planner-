import React, { useState, useEffect } from 'react';
import { tripsAPI } from '../services/api';

const TripSummary = ({ tripId }) => {
    const [itinerary, setItinerary] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tripId) return;
        const loadTrip = async () => {
            try {
                const response = await tripsAPI.getTripItinerary(tripId);
                setItinerary(response.data);
            } catch (error) {
                console.error("DEBUG: Error loading itinerary", error);
            } finally {
                setLoading(false);
            }
        };
        loadTrip();
    }, [tripId]);

    // קיבוץ לפי תאריכים
    const dates = [...new Set(itinerary.map(i => i.visit_date))].sort();

    if (loading) return <div className="p-10 text-center font-bold text-blue-600">טוען את סיכום המסלול...</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto bg-gray-50 min-h-screen" dir="rtl">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 border-b-2 border-blue-500 pb-2">סיכום המסלול שלי</h1>
            
            {dates.length === 0 ? (
                <div className="text-center p-10 text-gray-500 bg-white rounded-lg border">אין אטרקציות בלו"ז זה.</div>
            ) : (
                dates.map((date, index) => (
                    <div key={date} className="mb-8">
                        <h2 className="text-xl font-semibold text-blue-700 mb-4 bg-white p-3 rounded-lg shadow-sm border border-blue-100 inline-block">
                            יום {index + 1} | {date}
                        </h2>
                        <table className="w-full bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 text-right">
                            <thead className="bg-gray-100 border-b">
                                <tr>
                                    <th className="p-4 text-gray-600">שם אטרקציה</th>
                                    <th className="p-4 text-gray-600">התחלה</th>
                                    <th className="p-4 text-gray-600">סיום</th>
                                </tr>
                            </thead>
                            <tbody>
                                {itinerary
                                    .filter(i => i.visit_date === date)
                                    .sort((a, b) => a.start_time.localeCompare(b.start_time))
                                    .map(item => (
                                        <tr key={item.id} className="border-t hover:bg-gray-50 transition">
                                            <td className="p-4 font-bold text-gray-800">
                                                {item.attraction?.name || `אטרקציה ${item.attraction_id}`}
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