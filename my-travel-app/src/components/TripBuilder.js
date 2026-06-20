import React, { useState } from 'react';
import MapView from './MapView';

const TripBuilder = ({ savedAttractions = [], destinationName, onTripComplete }) => {
  const [tripDetails, setTripDetails] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [itinerary, setItinerary] = useState([]);

  // Step validation state tracker and calculating trip duration days range scope
  const handleStartPlanning = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Day gap calculations including both boundaries seamlessly
    const differenceInTime = end.getTime() - start.getTime();
    const calculatedDays = Math.ceil(differenceInTime / (1000 * 3600 * 24)) + 1;

    if (calculatedDays <= 0) {
      alert("Return date must be equal to or after the departure date!");
      return;
    }

    setTripDetails({
      destination: destinationName || 'Selected Destination',
      daysCount: calculatedDays,
      startDate: startDate,
      endDate: endDate
    });
  };

  // Appends a new item into the target selected itinerary list tracker
  const handleSchedule = (attraction) => {
    if (!itinerary.find(item => item.id === attraction.id || item.name === attraction.name)) {
      setItinerary([...itinerary, { ...attraction, day_number: 1, start_time: '10:00' }]);
    } else {
      alert('This attraction is already scheduled in your itinerary!');
    }
  };

  // Removes a target attraction out of the active scheduled board list
  const handleRemove = (attractionName) => {
    setItinerary(itinerary.filter(item => item.name !== attractionName));
  };

  // Modifies sub-properties like day allocations or start timing constraints dynamically
  const handleChangeSchedule = (index, field, value) => {
    const updated = [...itinerary];
    updated[index][field] = value;
    setItinerary(updated);
  };

  // 🌟 Turn functional scope async to process transaction data safely with FastAPI backend
  const handleSaveItinerary = async () => {
    try {
      const tripData = {
        city_ids: [1], 
        start_date: tripDetails.startDate,
        end_date: tripDetails.endDate
      };

      // 1. Instantiates a master trip wrapper inside database constraints
      const tripResponse = await tripsAPI.planMultiCountryTrip(tripData);
      const newTripId = tripResponse.data.id; 

      // 2. Maps single attraction list instances back to the parent layout payload
      if (itinerary.length > 0) {
        const bulkData = {
          items: itinerary.map(item => ({
            trip_id: newTripId,
            attraction_id: item.id,
            visit_date: tripDetails.startDate, 
            start_time: item.start_time || '10:00',
            end_time: '12:00'
          }))
        };
        // Executes standard transaction updates built into api.js layers
        await tripsAPI.createBulkItinerary(bulkData);
      }

      print(`DEBUG: Trip and Itinerary saved successfully with ID: ${newTripId}`);
      alert(`The trip to ${tripDetails.destination} was successfully saved!`);

      // 3. Triggers navigation updates up to historical tracking pages
      if (onTripComplete) {
          onTripComplete(newTripId); 
      }

    } catch (error) {
      console.error("DEBUG: Failed to save itinerary to DB:", error);
      alert("Error occurred while saving the itinerary to the server. Please check if the backend is running.");
    }
  };

  // Note: Remaining JSX layout components render downstream context values sequentially.
  // Kept intact without adjustments to avoid mutation changes to your structure.

  // --- Step 1: Initial Time Settings Form Box ---
  if (!tripDetails) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 max-w-md mx-auto text-left" dir="ltr">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Trip Setup</h2>
        <p className="text-gray-600 mb-6 text-center text-sm">
          When are you traveling to <span className="font-bold text-blue-600">{destinationName}</span>?
        </p>
        
        <form onSubmit={handleStartPlanning} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">Start Date:</label>
            <input 
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">End Date:</label>
            <input 
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold transition shadow-md text-sm"
          >
            Continue to Schedule Attractions ➔
          </button>
        </form>
      </div>
    );
  }

  // --- Step 2: Main Placement Grid Layout Views ---
  return (
    <div className="space-y-6">
      {currentStep === 'attractions' && (
        <div style={{ display: 'flex', flexDirection: 'row', gap: '24px', width: '100%', alignItems: 'flex-start', position: 'relative' }} dir="ltr">
          
          {/* Main Content Column Block - Accommodates 70% Layout Canvas Width Constraints */}
          <div style={{ flex: '0 0 70%', minWidth: '0' }} className="space-y-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-left">
              <h2 className="text-2xl font-black text-gray-800">
                Attractions in {selectedCityName}
              </h2>
            </div>
            
            <AttractionsList 
              attractions={liveAttractions} 
              onAddToTrip={handleAddToTrip} 
            />
          </div>

          {/* Sidebar Recommendations Column Block - Accommodates 30% Width Container Bounds */}
          <div style={{ flex: '0 0 30%', position: 'sticky', top: '24px' }}>
            <RecommendationsPanel 
              recommendations={recommendations} 
              onAddToTrip={handleAddToTrip} 
            />
          </div>

          {/* Fixed Float Navigation Button Anchor Element */}
          {myTripAttractions.length > 0 && (
            <button 
              onClick={() => setCurrentStep('planning')}
              style={{
                position: 'fixed',
                bottom: '32px',
                right: '32px',
                backgroundColor: '#16a34a', // Green theme
                color: '#fff',
                padding: '16px 32px',
                borderRadius: '9999px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '4px solid #fff',
                cursor: 'pointer',
                fontWeight: '900',
                fontSize: '18px',
                zIndex: 9999, // Supercedes canvas overlays
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Build Trip Schedule ({myTripAttractions.length}) ➔
            </button>
          )}
          
        </div>
      )}

      {/* Timeline Planner and Selected Stop Slot Mapping Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left" dir="ltr">
        <div className="lg:col-span-1 bg-gray-50 p-4 rounded-xl border border-gray-200 max-h-[500px] overflow-y-auto">
          <h3 className="font-bold text-gray-800 mb-4 text-base">My Daily Route ({itinerary.length})</h3>
          
          {itinerary.length === 0 ? (
            <div className="min-h-[150px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl bg-white p-4 text-center">
              <p className="text-gray-400 text-xs">
                Click "Assign to Slot" from the explorer views above to structure your daily plans...
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {itinerary.map((item, index) => (
                <li key={item.id || index} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-gray-800 text-sm">{item.name}</span>
                    <button 
                      onClick={() => handleRemove(item.name)}
                      className="text-gray-400 hover:text-red-500 font-bold px-1 transition text-sm"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="flex gap-4 text-xs bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <div className="flex flex-col w-1/2">
                      <label className="text-gray-500 mb-1 font-medium">Trip Day:</label>
                      <select
                        value={item.day_number}
                        onChange={(e) => handleChangeSchedule(index, 'day_number', parseInt(e.target.value))}
                        className="border border-gray-300 rounded-md p-1 bg-white outline-none focus:border-blue-500"
                      >
                        {Array.from({ length: tripDetails.daysCount }, (_, i) => i + 1).map(day => (
                          <option key={day} value={day}>Day {day}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col w-1/2">
                      <label className="text-gray-500 mb-1 font-medium">Start Time:</label>
                      <input 
                        type="time" 
                        value={item.start_time}
                        onChange={(e) => handleChangeSchedule(index, 'start_time', e.target.value)}
                        className="border border-gray-300 rounded-md p-1 outline-none focus:border-blue-500 bg-white"
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Dynamic Mapping Layout View Canvas */}
        <div className="lg:col-span-2">
          <h3 className="font-bold text-gray-800 mb-3 text-base">Route Map Visualization</h3>
          <MapView attractions={itinerary.length > 0 ? itinerary : savedAttractions} />
        </div>
      </div>

      {/* Final Commit Save Execution Layer */}
      <div className="mt-8 text-right border-t pt-4">
        <button 
          onClick={handleSaveItinerary}
          disabled={itinerary.length === 0}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-2.5 rounded-lg font-bold shadow-md transition disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
        >
          Save Final Route
        </button>
      </div>
    </div>
  );
};

export default TripBuilder;