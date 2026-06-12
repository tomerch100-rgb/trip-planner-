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

// קריאות גיאוגרפיה
export const geographyAPI = {
  getCountries: () => API.get('/geography/countries'),
  getCities: (countryId) => API.get(`/geography/countries/${countryId}/cities`),
};

// קריאות אטרקציות - מאוחד ומסודר
export const attractionsAPI = {
  // שליפת קטגוריות לתפריט סינון
  getCategories: () => API.get('/attractions/categories'),

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
        category_name: categoryName 
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
  createBulkItinerary: (itineraryData) => API.post('/itinerary/bulk', itineraryData),
  planMultiCountryTrip: (tripData) => API.post('/trip/plan-multi-country', tripData),
};

export default API;