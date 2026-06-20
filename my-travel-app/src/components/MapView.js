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
  // Filter attractions with valid coordinates and parse values into floats
  const validAttractions = attractions.filter(
    attr => attr && attr.latitude && attr.longitude
  );

  const validPositions = validAttractions.map(attr => [
    parseFloat(attr.latitude),
    parseFloat(attr.longitude),
  ]);

  // Default coordinate center anchor if the array is empty
  const defaultCenter = [36.4751, 2.8276];
  const mapCenter = validPositions.length > 0 ? validPositions[0] : defaultCenter;

  return (
    // Style configurations enforce 400px container height definitions to prevent canvas collapse issues
    <div style={{ height: "400px", width: "100%", position: "relative" }} className="rounded-xl overflow-hidden shadow-md border border-gray-200 z-0">
      <MapContainer
        center={mapCenter}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* Automatic viewport tracking execution */}
        <RecenterMap positions={validPositions} />

        {/* Dynamic routing line path rendering to connect itinerary stop slots */}
        {validPositions.length > 1 && (
          <Polyline
            positions={validPositions}
            pathOptions={{ color: '#2563eb', weight: 4, dashArray: '5, 10' }}
          />
        )}

        {/* Rendering interactive landmark pinpoint markers */}
        {validAttractions.map((attr, idx) => (
          <Marker
            key={attr.id || idx}
            position={[parseFloat(attr.latitude), parseFloat(attr.longitude)]}
          >
            <Popup>
              <div className="text-left font-sans p-1" dir="ltr">
                <h5 className="font-bold text-gray-900 text-sm mb-0.5">{attr.name}</h5>
                <p className="text-gray-500 text-xs my-0">{attr.address || 'Address not available'}</p>
                {attr.day_number && (
                  <span className="inline-block bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.5 rounded mt-1">
                    Day {attr.day_number} - {attr.start_time}
                  </span>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}