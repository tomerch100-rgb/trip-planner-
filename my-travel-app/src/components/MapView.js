import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix missing marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.71.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.71.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.71.1/images/marker-shadow.png',
});

// Helper component that recenters the map based on markers
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
    <div className="h-96 w-full rounded-xl overflow-hidden shadow-md border border-gray-200">
      <MapContainer 
        center={positions.length > 0 ? positions[0] : defaultCenter} 
        zoom={13} 
        style={{ height: '100%', width: '100%', zIndex: 1 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Recenter whenever the pins change */}
        <RecenterMap positions={positions} />

        {/* Connecting line between the pins */}
        {positions.length > 1 && (
          <Polyline 
            positions={positions} 
            color="red" 
            dashArray="10, 10" 
            weight={3} 
            opacity={0.7} 
          />
        )}

        {/* The pins themselves */}
        {validAttractions.map((attr, index) => (
          <Marker 
            key={index} 
            position={[
              attr.latitude || attr.attraction?.latitude || 0, 
              attr.longitude || attr.attraction?.longitude || 0
            ]}
          >
            <Popup>
              <div className="text-left" dir="ltr">
                <strong className="block text-sm mb-1">{attr.name || attr.attraction?.name}</strong>
                <p className="text-gray-500 text-xs my-0">{attr.address || 'Address unavailable'}</p>
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