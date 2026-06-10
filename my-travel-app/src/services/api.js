import axios from 'axios';

// יצירת אינסטנס של Axios עם כתובת השרת שלך
const API = axios.create({
  baseURL: 'http://localhost:8000', // שנה לפורט המדויק של ה-FastAPI שלך
});

// Interceptor להוספת טוקן ה-JWT אוטומטית לכל בקשה יוצאת
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// קריאות גיאוגרפיה (Cascading Dropdown)
export const geographyAPI = {
  getCountries: () => API.get('/geography/countries'),
  getCities: (countryId) => API.get(`/geography/countries/${countryId}/cities`),
};

// קריאות אטרקציות וחיפוש בזמן אמת
export const attractionsAPI = {
  exploreLive: (cityId, category) => 
    API.get('/attractions/explore-live', { params: { city_id: cityId, category } }),
};

// ניהול טיולים ולו"ז
export const tripsAPI = {
  getTrips: () => API.get('/trips'),
  createBulkItinerary: (itineraryData) => API.post('/itinerary/bulk', itineraryData),
};

export default API;