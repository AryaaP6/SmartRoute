const venueService = require('../services/venueService');
const mapService = require('../services/mapService');

// Get venues from Foursquare
exports.getVenues = async (req, res) => {
  try {
    const { start, end } = req.body;
    const venues = await venueService.fetchVenues(start, end);
    res.json(venues);
  } catch (error) {
    console.error('Error fetching venues:', error);
    res.status(500).json({ error: 'Failed to fetch venues' });
  }
};

// Get route from Mapbox
exports.getRoute = async (req, res) => {
  try {
    const { start, end, waypoints } = req.body;
    const route = await mapService.fetchRoute(start, end, waypoints);
    res.json(route);
  } catch (error) {
    console.error('Error fetching route:', error);
    res.status(500).json({ error: 'Failed to fetch route' });
  }
};
