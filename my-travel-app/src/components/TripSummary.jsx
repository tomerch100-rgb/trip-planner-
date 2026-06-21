import React, { useState, useEffect } from 'react';
import { tripsAPI } from '../services/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import MapView from './MapView';
import 'leaflet/dist/leaflet.css';
import { Map, MapPin } from 'lucide-react';

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
    const [tripDetails, setTripDetails] = useState(null); // 
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
                                    <strong className="text-blue-600">{item.attraction.name}</strong><br />
                                    <span className="text-xs text-gray-500">
                                        {item.visit_date} | {item.start_time ? item.start_time.substring(0, 5) : ''}
                                    </span>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            {/* Timetable schedule grid layout groups */}
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
                                                        {item.start_time ? item.start_time.substring(0, 5) : '-'}
                                                    </td>
                                                    <td className="p-4 text-slate-600 font-mono font-medium">
                                                        {item.end_time ? item.end_time.substring(0, 5) : '-'}
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