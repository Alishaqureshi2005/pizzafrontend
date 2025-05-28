// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const API_BASE_URL = API_URL; // For backward compatibility

// Other configuration constants
export const DEFAULT_LOCATION = {
  latitude: 24.7337,
  longitude: 69.7967
};

export const MAP_CONFIG = {
  defaultZoom: 13,
  maxZoom: 18,
  minZoom: 5
}; 