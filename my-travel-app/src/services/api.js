import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000',
});

// Automatically add the token to every request
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

// Geography endpoints
export const geographyAPI = {
  getCountries: () => API.get('/geography/countries'),
  getCities: (countryId) => API.get(`/geography/countries/${countryId}/cities`),
};

// Attractions endpoints - organized and consolidated
export const attractionsAPI = {
  // Fetch categories for the filter menu
  getCategories: () => API.get('/attractions/categories'),

  // Fetch personalized recommendations based on user history 🌟
  getRecommendations: () => API.get('/attractions/recommend'),

  // Search filtered attractions from the local DB
  getAttractions: (cityId, categoryId, maxPrice) => {
    return API.get('/attractions/', { 
      params: { 
        city_id: cityId, 
        category_id: categoryId,
        max_price: maxPrice
      } 
    });
  },

  // Live explorer search against Google (when not cached in DB)
  exploreLive: (cityId, categoryName) => 
    API.get('/attractions/explore-live', { 
      params: { 
        city_id: cityId, 
        categories: categoryName || null
      } 
    }),

  // Fetch attractions by country
  getByCountry: (countryId) => {
    return API.get(`/attractions/by-country/${countryId}`);
  }
};

// Trip management endpoints
export const tripsAPI = {
  getTrips: () => API.get('/trips/'), 
  getSingleTrip: (tripId) => API.get(`/trips/${tripId}`), 
  getTripItinerary: (tripId) => API.get(`/itinerary/${tripId}`),
  createBulkItinerary: (itineraryData) => API.post('/itinerary/bulk', itineraryData),
  planMultiCountryTrip: (tripData) => API.post('/trips/plan-multi-country', tripData),
  
  // Management functions for the personal dashboard area
  deleteTrip: (tripId) => API.delete(`/trips/${tripId}`),
  deleteItineraryItem: (itemId) => API.delete(`/itinerary/item/${itemId}`),
  updateItineraryItem: (itemId, itemData) => API.put(`/itinerary/item/${itemId}`, itemData),
};

export default API;