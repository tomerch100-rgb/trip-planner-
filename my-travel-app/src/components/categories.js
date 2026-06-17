// src/constants/categories.js

export const TRAVEL_CATEGORIES = [
  {
    dbId: 1,                 // <-- ה-ID המספרי שמתאים לטבלה ב-DB שלך
    id: "culture",
    name: "Museums and Culture", 
    icon: "🏛️",
    googleTypes: ["museum", "art_gallery", "tourist_attraction", "church"]
  },
  {
    dbId: 2,                 // <-- ה-ID המספרי שמתאים לטבלה ב-DB שלך
    id: "nature",
    name: "Nature and Parks",
    icon: "🌳",
    googleTypes: ["park", "zoo", "aquarium", "campground"]
  },
  {
    dbId: 3,                 // <-- ה-ID המספרי שמתאים לטבלה ב-DB שלך
    id: "culinary",
    name: "Culinary and Restaurants",
    icon: "🍔",
    googleTypes: ["restaurant", "cafe", "bar"]
  },
  {
    dbId: 4,                 // <-- ה-ID המספרי שמתאים לטבלה ב-DB שלך
    id: "sports",
    name: "Sports and Extreme",
    icon: "🏄",
    googleTypes: ["amusement_park", "bowling_alley", "stadium"]
  }
];