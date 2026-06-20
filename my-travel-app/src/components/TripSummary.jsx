import React, { useState, useEffect } from 'react';
import { tripsAPI } from '../services/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Set up a custom red marker pin for the map instead of the default blue one
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

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
                console.error("DEBUG: Error loading itinerary", error);
            } finally {
                setLoading(false);
            }
        };
        loadTrip();
    }, [tripId]);

    // Filter attractions containing valid positioning coordinates to render on the map layer
    const validLocations = itinerary.filter(
        item => item.attraction?.latitude && item.attraction?.longitude
    );

    // Calculate map central positioning anchor (uses first attraction location, defaults to Paris if empty)
    const mapCenter = validLocations.length > 0 
        ? [validLocations[0].attraction.latitude, validLocations[0].attraction.longitude] 
        : [48.8566, 2.3522]; // Paris default fallback positioning parameters

    // Group dates uniquely and sort chronologically
    const dates = [...new Set(itinerary.map(i => i.visit_date))].sort();

    if (loading) return <div className="p-10 text-center font-bold text-blue-600">Loading trip summary...</div>;

    return (
        <div className="p-6 max-w-6xl mx-auto bg-gray-50 min-h-screen" dir="ltr">
            <h1 className="text-3xl font-black text-gray-800 mb-8 border-b-2 border-blue-500 pb-2">
                My Trip Summary {tripDetails?.city ? `in ${tripDetails.city.country?.name} (${tripDetails.city.name})` : ''} ✈️
            </h1>
            
            {/* 🗺️ Interactive routing layer map wrapper */}
            <div className="mb-10 h-[400px] w-full rounded-2xl overflow-hidden shadow-lg border-4 border-white relative z-0">
                <MapContainer 
                    center={mapCenter} 
                    zoom={validLocations.length > 0 ? 13 : 3} // Zoom outwards to a broad viewpoint if positions are empty
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={false}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    
                    {/* Render target pinpoint markers on map canvas grids */}
                    {validLocations.map(item => (
                        <Marker 
                            key={item.id} 
                            position={[item.attraction.latitude, item.attraction.longitude]}
                            icon={redIcon}
                        >
                            <Popup>
                                <div className="text-center">
                                    <strong className="text-blue-600">{item.attraction.name}</strong><br/>
                                    <span className="text-xs text-gray-500">
                                        {item.visit_date} | {item.start_time ? item.start_time.substring(0,5) : ''}
                                    </span>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            {/* Timetable schedule grid layout groups */}
            {dates.length === 0 ? (
                <div className="text-center p-10 text-gray-500 bg-white rounded-lg border">No itinerary items found.</div>
            ) : (
                dates.map((date, index) => (
                    <div key={date} className="mb-8">
                        <h2 className="text-xl font-bold text-blue-700 mb-4 bg-white p-3 rounded-xl shadow-sm border border-blue-100 inline-block">
                            Day {index + 1} | {date}
                        </h2>
                        <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-200">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-100 border-b">
                                    <tr>
                                        <th className="p-4 text-gray-600 font-bold">Attraction</th>
                                        <th className="p-4 text-gray-600 font-bold">Start Time</th>
                                        <th className="p-4 text-gray-600 font-bold">End Time</th>
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
                    </div>
                ))
            )}
        </div>
    );
};

export default TripSummary;