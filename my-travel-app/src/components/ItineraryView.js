import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Calendar, Clock, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet marker icons configuration issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.71.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.71.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.71.1/images/marker-shadow.png',
});

export default function ItineraryView({ plannedLegs = [] }) {
  
  // Flatten all attractions from all legs (cities/countries) into a single array for map mapping
  const allItineraryItems = plannedLegs.flatMap(leg => leg.items || []);

  // Filter attractions with valid coordinates and prepare polyline path mapping arrays
  const validPositions = allItineraryItems
    .filter(attr => attr.latitude && attr.longitude)
    .map(attr => [attr.latitude, attr.longitude]);

  // Set default map fallback anchor positioning to central Rome if coordinates list is empty
  const mapCenter = validPositions.length > 0 ? validPositions[0] : [41.8902, 12.4922];

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-0 w-full">
      
      {/* Left Column Layout: Unified Itinerary Timelines Across Targets */}
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

        {/* Timelines Tracking Architecture - Based on provided planned segments */}
        <div className="space-y-10 relative before:absolute before:inset-0 before:left-4 before:border-l-2 before:border-dashed before:border-slate-200">
          {plannedLegs.map((leg, legIdx) => (
            <div key={legIdx} className="relative pl-10 group">
              {/* Timeline country node marker anchor */}
              <div className="absolute left-2 top-1.5 w-4 h-4 rounded-full border-4 border-white bg-cyan-500 shadow-sm shadow-cyan-200"></div>
              
              <div className="mb-4">
                <h3 className="text-lg font-black text-slate-800">{leg.cityName}</h3>
                <p className="text-xs text-slate-400 font-bold flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5" /> {leg.start_date} to {leg.end_date}
                </p>
              </div>

              {/* Nested attractions loop inside this specific location segment */}
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

      {/* Right Column Layout: Interactive Path Mapping View */}
      <div className="w-full lg:w-1/2 h-[45vh] lg:h-[calc(100vh-8.5rem)] sticky bottom-0 lg:top-0">
        <MapContainer 
          center={mapCenter} 
          zoom={validPositions.length > 1 ? 5 : 12} // Uses a wider zoom if multiple destination legs exist
          className="w-full h-full border-l border-slate-100 shadow-inner"
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          
          {/* Renders the sequential routing connector path line */}
          {validPositions.length > 1 && (
            <Polyline 
              positions={validPositions} 
              pathOptions={{ color: '#0ea5e9', weight: 4, dashArray: '6, 12', lineCap: 'round' }} 
            />
          )}

          {/* Renders interactive target pinpoint map markers */}
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