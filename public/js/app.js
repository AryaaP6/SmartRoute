class PopMapApp {
    constructor() {
      this.mapHandler = new MapHandler();
      this.venueHandler = new VenueHandler();
      this.routeHandler = new RouteHandler();
      
      this.startCoordinates = null;
      this.endCoordinates = null;
    }
  
    /**
     * Initialize the application
     */
    init() {
      // Initialize map
      this.mapHandler.initMap();
      
      // Setup event listeners
      this.setupEventListeners();
    }
  
    /**
     * Setup event listeners
     */
    setupEventListeners() {
      // Find route button click event
      document.getElementById('find-route').addEventListener('click', async () => {
        const startLocation = document.getElementById('start-location').value;
        const endLocation = document.getElementById('end-location').value;
        
        if (!startLocation || !endLocation) {
          alert('Please enter both start and end locations');
          return;
        }
        
        try {
          // In a real app, geocode these addresses to get coordinates
          // For demo, we'll use these hardcoded coordinates
          this.startCoordinates = { lat: 40.7128, lng: -74.0060 }; // NYC
          this.endCoordinates = { lat: 40.7306, lng: -73.9352 }; // Brooklyn
          
          // Clear previous markers
          this.mapHandler.clearMarkers();
          
          // Add markers for start and end
          this.mapHandler.addMarker(this.startCoordinates, 'start');
          this.mapHandler.addMarker(this.endCoordinates, 'end');
          
          // Fit the map to show both points
          this.mapHandler.fitMapToMarkers();
          
          // Find venues and calculate routes
          await this.findVenuesAndCalculateRoutes();
        } catch (error) {
          console.error('Error:', error);
          alert('Error finding locations. Please try again.');
        }
      });
    }
  
    /**
     * Find venues and calculate routes
     */
    async findVenuesAndCalculateRoutes() {
      try {
        // Step 1: Fetch venues from Foursquare API
        const venues = await this.venueHandler.fetchVenues(this.startCoordinates, this.endCoordinates);
        
        // Step 2: Display venues on the map
        venues.forEach(venue => this.mapHandler.addVenueMarker(venue));
        
        // Step 3: Run k-means clustering on venues
        const clusters = this.venueHandler.processVenueClusters(venues, 3); // Create 3 clusters
        
        // Step 4: Determine waypoints for comfort route based on clusters
        const waypoints = this.routeHandler.determineWaypoints(clusters, this.startCoordinates, this.endCoordinates);
        
        // Step 5: Get the fastest route (direct)
        const fastestRoute = await this.routeHandler.fetchRoute(this.startCoordinates, this.endCoordinates, []);
        this.routeHandler.routes.fastest = fastestRoute;
        
        // Step 6: Get the comfort route (via waypoints)
        const comfortRoute = await this.routeHandler.fetchRoute(this.startCoordinates, this.endCoordinates, waypoints);
        this.routeHandler.routes.comfort = comfortRoute;
        
        // Step 7: Display both routes on the map
        this.mapHandler.displayRoutes(fastestRoute, comfortRoute);
        
        // Step 8: Update route information
        this.routeHandler.updateRouteInfo(fastestRoute, comfortRoute);
        
      } catch (error) {
        console.error('Error in findVenuesAndCalculateRoutes:', error);
        alert('Error calculating routes. Please try again.');
      }
    }
  }
  
  // Initialize the application when the page loads
  document.addEventListener('DOMContentLoaded', () => {
    const app = new PopMapApp();
    app.init();
  });