import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000',
});

// הוספת הטוקן לכל בקשה באופן אוטומטי
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

// קריאות גיאוגרפיה
export const geographyAPI = {
  getCountries: () => API.get('/geography/countries'),
  getCities: (countryId) => API.get(`/geography/countries/${countryId}/cities`),
};

// קריאות אטרקציות - מאוחד ומסודר
export const attractionsAPI = {
  // שליפת קטגוריות לתפריט סינון
  getCategories: () => API.get('/attractions/categories'),

  // שליפת המלצות אישיות על בסיס היסטוריית המשתמש 🌟
  getRecommendations: () => API.get('/attractions/recommend'),

  // חיפוש אטרקציות מסוננות מה-DB המקומי
  getAttractions: (cityId, categoryId, maxPrice) => {
    return API.get('/attractions/', { 
      params: { 
        city_id: cityId, 
        category_id: categoryId,
        max_price: maxPrice
      } 
    });
  },

  // חיפוש Live מול גוגל (כשאין ב-DB)
  exploreLive: (cityId, categoryName) => 
    API.get('/attractions/explore-live', { 
      params: { 
        city_id: cityId, 
        categories: categoryName || null
      } 
    }),

  // שליפת אטרקציות לפי מדינה
  getByCountry: (countryId) => {
    return API.get(`/attractions/by-country/${countryId}`);
  }
};

// ניהול טיולים
export const tripsAPI = {
  getTrips: () => API.get('/trip'),
  getSingleTrip: (tripId) => API.get(`/trip/${tripId}`),
  getTripItinerary: (tripId) => API.get(`/itinerary/${tripId}`),
  createBulkItinerary: (itineraryData) => API.post('/itinerary/bulk', itineraryData),
  planMultiCountryTrip: (tripData) => API.post('/trips/plan-multi-country', tripData),
};

export default API;