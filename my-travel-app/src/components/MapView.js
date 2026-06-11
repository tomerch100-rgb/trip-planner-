import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// תיקון סופי לבאג האייקונים השבורים בריאקט - טעינה מ-CDN רשמי
let DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});
L.Marker.prototype.options.icon = DefaultIcon;

// קומפוננטת עזר שממרכזת את המפה ומזיזה אותה לפי הנקודות הקיימות
const RecenterMap = ({ markers }) => {
  const map = useMap();

  useEffect(() => {
    if (markers && markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      
      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    }
  }, [markers, map]);

  return null;
};

const MapView = ({ attractions }) => {
  // פונקציית עזר לחילוץ קואורדינטות בצורה גמישה
  const getCoordinates = (attr) => {
    const lat = attr.latitude ?? attr.lat ?? attr.geometry?.location?.lat;
    const lng = attr.longitude ?? attr.lng ?? attr.geometry?.location?.lng;
    
    if (lat !== undefined && lng !== undefined && lat !== null && lng !== null) {
      return { lat: parseFloat(lat), lng: parseFloat(lng) };
    }
    return null;
  };

  // מייצר רשימה של נקודות תקינות בלבד
  const validMarkers = attractions
    .map(attr => ({
      ...attr,
      coords: getCoordinates(attr)
    }))
    .filter(item => item.coords !== null);

  const defaultCenter = [35.6762, 139.6503]; 

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
      <h3 className="text-xl font-bold text-gray-800 mb-4">מפת האטרקציות בטיול</h3>
      
      <div className="w-full rounded-lg overflow-hidden z-0 shadow-inner" style={{ height: '400px' }}>
        <MapContainer 
          center={defaultCenter} 
          zoom={12} 
          scrollWheelZoom={true}
          style={{ height: '400px', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <RecenterMap markers={validMarkers.map(m => m.coords)} />

          {validMarkers.map((item, index) => (
            <Marker key={index} position={[item.coords.lat, item.coords.lng]}>
              <Popup>
                <div className="text-right" dir="rtl">
                  <h4 className="font-bold text-gray-900">{item.name}</h4>
                  <p className="text-xs text-gray-600 mt-1">{item.formatted_address || item.address}</p>
                  {item.rating && <p className="text-xs text-yellow-600 mt-1">⭐ {item.rating}</p>}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapView;