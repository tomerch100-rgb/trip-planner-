import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default Leaflet pin marker asset loading configurations in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.71.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.71.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.71.1/images/marker-shadow.png',
});

// Helper component that automatically recenters and fits map bounds based on added pins
const RecenterMap = ({ positions }) => {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      if (positions.length === 1) {
        map.setView(positions[0], 13);
      } else {
        map.fitBounds(positions, { padding: [50, 50] });
      }
    }
  }, [positions, map]);
  return null;
};

export default function MapView({ attractions = [] }) {
  // Filter out attractions that don't have valid coordinates
  const validAttractions = attractions.filter(attr => {
    const lat = attr.latitude || attr.attraction?.latitude;
    const lon = attr.longitude || attr.attraction?.longitude;
    return lat != null && lon != null;
  });

  const positions = validAttractions.map(attr => [
    attr.latitude || attr.attraction?.latitude,
    attr.longitude || attr.attraction?.longitude
  ]);

  if (positions.length === 0) {
    return (
      <div className="bg-gray-100 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 h-64 text-gray-500 font-bold">
        No locations available to show on map.
      </div>
    );
  }

  // Default center in case we have no positions (fallback)
  const defaultCenter = [51.505, -0.09]; 

  return (
    // Style configurations enforce 400px container height definitions to prevent canvas collapse issues
    <div style={{ height: "400px", width: "100%", position: "relative" }} className="rounded-xl overflow-hidden shadow-md border border-gray-200 z-0">
      <MapContainer
        center={defaultCenter}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Automatic viewport tracking execution */}
        <RecenterMap positions={positions} />

        {/* Dynamic routing line path rendering to connect itinerary stop slots */}
        {positions.length > 1 && (
          <Polyline
            positions={positions}
            pathOptions={{ color: '#2563eb', weight: 4, dashArray: '5, 10' }}
          />
        )}

        {/* Rendering interactive landmark pinpoint markers */}
        {validAttractions.map((attr, idx) => {
          const lat = parseFloat(attr.latitude || attr.attraction?.latitude);
          const lon = parseFloat(attr.longitude || attr.attraction?.longitude);
          return (
          <Marker
            key={attr.id || idx}
            position={[lat, lon]}
          >
            <Popup>
              <div className="text-left font-sans p-1" dir="ltr">
                <h5 className="font-bold text-gray-900 text-sm mb-0.5">{attr.name || attr.attraction?.name}</h5>
                <p className="text-gray-500 text-xs my-0">{attr.address || attr.attraction?.address || 'Address not available'}</p>
                {attr.day_number && (
                  <span className="inline-block bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.5 rounded mt-1">
                    Day {attr.day_number} - {attr.start_time}
                  </span>
                )}
              </div>
            </Popup>
          </Marker>
        );
        })}
      </MapContainer>
    </div>
  );
}