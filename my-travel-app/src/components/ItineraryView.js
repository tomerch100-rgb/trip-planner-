import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Calendar, Clock, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// תיקון לאייקונים של המפה שמגיעים כברירת מחדל ב-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.71.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.71.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.71.1/images/marker-shadow.png',
});

export default function ItineraryView({ plannedLegs = [] }) {
  
  // חילוץ כל האטרקציות מכל המקטעים (המדינות) לרשימה אחת ארוכה עבור המפה
  const allItineraryItems = plannedLegs.flatMap(leg => leg.items || []);

  // סינון אטרקציות שיש להן קואורדינטות תקינות בלבד והכנת מערך ציור המסלול
  const validPositions = allItineraryItems
    .filter(attr => attr.latitude && attr.longitude)
    .map(attr => [attr.latitude, attr.longitude]);

  // נקודת העיגון של המפה (אם יש נתונים נלך אליהם, אחרת מרכז רומא)
  const mapCenter = validPositions.length > 0 ? validPositions[0] : [41.8902, 12.4922];

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-0 w-full">
      
      {/* צד שמאל: הלו"ז המאוחד מכל היעדים */}
      <div className="w-full lg:w-1/2 p-6 overflow-y-auto max-h-[calc(100vh-8.5rem)]">
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 bg-cyan-50 px-2.5 py-1 rounded-full">
            Vacation Blueprint
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-2">
            Your Multi-Destination Itinerary
          </h2>
          <p className="text-sm text-slate-400 mt-0.5 font-medium">
            {plannedLegs.length} Destinations • {allItineraryItems.length} Points of Interest
          </p>
        </div>

        {/* ציר הזמן - מבוסס על המקטעים */}
        <div className="space-y-10 relative before:absolute before:inset-0 before:left-4 before:border-l-2 before:border-dashed before:border-slate-200">
          {plannedLegs.map((leg, legIdx) => (
            <div key={legIdx} className="relative pl-10 group">
              {/* נקודת העוגן של ציר הזמן למדינה */}
              <div className="absolute left-2 top-1.5 w-4 h-4 rounded-full border-4 border-white bg-cyan-500 shadow-sm shadow-cyan-200"></div>
              
              <div className="mb-4">
                <h3 className="text-lg font-black text-slate-800">{leg.cityName}</h3>
                <p className="text-xs text-slate-400 font-bold flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5" /> {leg.start_date} to {leg.end_date}
                </p>
              </div>

              {/* רשימת האטרקציות בתוך המדינה הספציפית הזו */}
              <div className="space-y-4">
                {leg.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:border-cyan-100 transition-all flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-cyan-600">
                        <span className="bg-cyan-50 px-2 py-0.5 rounded flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {item.start_time.substring(0, 5)}
                        </span>
                        <span className="text-slate-400 font-medium">• Stop #{itemIdx + 1}</span>
                      </div>
                      
                      <h4 className="text-base font-black text-slate-800 mt-1">{item.name}</h4>
                      
                      <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {item.address || 'Address pending'}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-500 block">
                        {item.actual_price > 0 ? `€${item.actual_price}` : 'Free Entry'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* צד ימין: המפה האינטראקטיבית */}
      <div className="w-full lg:w-1/2 h-[45vh] lg:h-[calc(100vh-8.5rem)] sticky bottom-0 lg:top-0">
        <MapContainer 
          center={mapCenter} 
          zoom={validPositions.length > 1 ? 5 : 12} // זום רחב יותר אם יש מעבר בין מדינות
          className="w-full h-full border-l border-slate-100 shadow-inner"
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          
          {/* ציור קו המסלול */}
          {validPositions.length > 1 && (
            <Polyline 
              positions={validPositions} 
              pathOptions={{ color: '#0ea5e9', weight: 4, dashArray: '6, 12', lineCap: 'round' }} 
            />
          )}

          {/* ציור הסיכות של האטרקציות */}
          {allItineraryItems
            .filter(attr => attr.latitude && attr.longitude)
            .map((attr, idx) => (
              <Marker key={idx} position={[attr.latitude, attr.longitude]}>
                <Popup>
                  <div className="p-1 font-sans">
                    <h5 className="font-bold text-slate-900 m-0 text-sm">{attr.name}</h5>
                    <p className="text-xs text-slate-400 mt-0.5 mb-0">{attr.address}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      </div>

    </div>
  );
}