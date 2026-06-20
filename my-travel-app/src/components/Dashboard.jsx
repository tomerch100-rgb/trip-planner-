import React from 'react';
import { Compass, CalendarDays } from 'lucide-react';

export default function Dashboard({ onNewTrip, onPersonalArea }) {
  return (
    <div className="max-w-4xl mx-auto mt-12 p-6" dir="ltr">
      
      {/* Header section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-gray-800 mb-4">Welcome to Triper</h1>
        <p className="text-lg text-gray-600 font-medium">Where would you like to go next?</p>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Card 1: Plan New Trip */}
        <button 
          onClick={onNewTrip}
          className="bg-white border-2 border-transparent hover:border-blue-500 rounded-3xl p-10 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center group cursor-pointer"
        >
          <div className="bg-gradient-to-tr from-blue-100 to-cyan-100 text-blue-600 p-5 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
            <Compass size={56} strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Plan a New Trip</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Discover new destinations, explore live attractions, and build your dream itinerary step by step.
          </p>
        </button>

        {/* Card 2: Personal Area */}
        <button 
          onClick={onPersonalArea}
          className="bg-white border-2 border-transparent hover:border-green-500 rounded-3xl p-10 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center group cursor-pointer"
        >
          <div className="bg-gradient-to-tr from-green-100 to-emerald-100 text-green-600 p-5 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
            <CalendarDays size={56} strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">My Personal Area</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            View your past trips, edit existing itineraries, and manage your daily schedules all in one place.
          </p>
        </button>

      </div>
    </div>
  );
}