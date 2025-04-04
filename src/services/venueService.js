const fetch = require('node-fetch');

/**
 * Fetch venues from Foursquare API
 * @param {Object} start - Starting coordinates {lat, lng}
 * @param {Object} end - Ending coordinates {lat, lng}
 * @returns {Array} - Array of venue objects
 */
exports.fetchVenues = async (start, end) => {
  // Calculate a bounding box around the route
  const minLat = Math.min(start.lat, end.lat);
  const maxLat = Math.max(start.lat, end.lat);
  const minLng = Math.min(start.lng, end.lng);
  const maxLng = Math.max(start.lng, end.lng);
  
  // Add some padding to the bounding box
  const padding = 0.01; // roughly 1km
  const sw = `${minLat - padding},${minLng - padding}`;
  const ne = `${maxLat + padding},${maxLng + padding}`;
  
  // Query Foursquare for venues within our bounding box
  const url = `https://api.foursquare.com/v3/places/search?ll=${(minLat + maxLat) / 2},${(minLng + maxLng) / 2}&radius=5000&open_now=true`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': process.env.FOURSQUARE_API_KEY
    }
  });
  
  const data = await response.json();
  return data.results || [];
};