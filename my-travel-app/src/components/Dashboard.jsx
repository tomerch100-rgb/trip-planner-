import React from 'react';
import { Compass, CalendarDays } from 'lucide-react';

export default function Dashboard({ onNewTrip, onPersonalArea }) {
  return (
    <div className="max-w-5xl mx-auto mt-12 p-6" dir="ltr">
      
      {/* Header section */}
      <div className="text-center mb-16 mt-8">
        <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600">Triper</span></h1>
        <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">Where would you like to go next? Start planning your next adventure or review your memories.</p>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 px-4">
        
        {/* Card 1: Plan New Trip */}
        <button 
          onClick={onNewTrip}
          className="bg-white/80 backdrop-blur-xl border border-white hover:border-fuchsia-200 rounded-[2.5rem] p-12 shadow-xl shadow-fuchsia-100 hover:shadow-2xl hover:shadow-fuchsia-500/20 transition-all duration-500 flex flex-col items-center text-center group cursor-pointer relative overflow-hidden focus:outline-none focus:ring-4 focus:ring-fuchsia-500/20"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-br from-fuchsia-100/60 to-transparent rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>

          <div className="relative z-10">
            <div className="bg-gradient-to-br from-fuchsia-500 to-rose-600 text-white p-7 rounded-[2rem] mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-lg shadow-fuchsia-500/30 inline-block">
              <Compass size={56} strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-4 group-hover:text-fuchsia-600 transition-colors">Plan a New Trip</h2>
            <p className="text-slate-500 text-base leading-relaxed max-w-sm mx-auto font-medium">
              Discover new destinations, explore live attractions, and build your dream itinerary step by step.
            </p>
          </div>
        </button>

        {/* Card 2: Personal Area */}
        <button 
          onClick={onPersonalArea}
          className="bg-white/80 backdrop-blur-xl border border-white hover:border-purple-200 rounded-[2.5rem] p-12 shadow-xl shadow-purple-100 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 flex flex-col items-center text-center group cursor-pointer relative overflow-hidden focus:outline-none focus:ring-4 focus:ring-purple-500/20"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-tl from-purple-100/60 to-transparent rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>

          <div className="relative z-10">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white p-7 rounded-[2rem] mb-8 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 shadow-lg shadow-purple-500/30 inline-block">
              <CalendarDays size={56} strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-4 group-hover:text-purple-600 transition-colors">My Personal Area</h2>
            <p className="text-slate-500 text-base leading-relaxed max-w-sm mx-auto font-medium">
              View your past trips, edit existing itineraries, and manage your daily schedules all in one place.
            </p>
          </div>
        </button>

      </div>
    </div>
  );
}