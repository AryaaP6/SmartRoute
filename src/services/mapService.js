const fetch = require('node-fetch');

/**
 * Fetch route from Mapbox API
 * @param {Object} start - Starting coordinates {lat, lng}
 * @param {Object} end - Ending coordinates {lat, lng}
 * @param {Array} waypoints - Array of waypoint coordinates [{lat, lng}, ...]
 * @returns {Object} - Route data from Mapbox
 */
exports.fetchRoute = async (start, end, waypoints = []) => {
  // Format coordinates for Mapbox Directions API
  let coordinatesString = `${start.lng},${start.lat};`;
  
  // Add waypoints if any
  if (waypoints && waypoints.length > 0) {
    waypoints.forEach(point => {
      coordinatesString += `${point.lng},${point.lat};`;
    });
  }
  
  coordinatesString += `${end.lng},${end.lat}`;
  
  const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${coordinatesString}?alternatives=true&geometries=geojson&steps=true&access_token=${process.env.MAPBOX_ACCESS_TOKEN}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  return data;
};
