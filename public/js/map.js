class MapHandler {
    constructor() {
      this.map = null;
      this.markers = [];
      this.mapboxToken = 'pk.eyJ1IjoicmF5NjU0IiwiYSI6ImNtOTFnaXA1cTAwdGQyanM2emhndWpremMifQ.q1-lzZ_gtbPtfPz1fAHkbA'; // Replace with your token
    }
  
    /**
     * Initialize the map
     */
    initMap() {
      mapboxgl.accessToken = this.mapboxToken;
  
      this.map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [72.8777, 19.0760], // Default to NYC
        zoom: 12
      });
  
      this.map.addControl(new mapboxgl.NavigationControl());
    }
  
    /**
     * Add a marker to the map
     */
    addMarker(coordinates, type) {
      const el = document.createElement('div');
      el.className = `marker ${type}-marker`;
      
      // Set marker image based on type
      if (type === 'start') {
        el.style.backgroundImage = 'url(img/start-marker.png)';
      } else if (type === 'end') {
        el.style.backgroundImage = 'url(img/end-marker.png)';
      } else if (type === 'venue') {
        el.style.backgroundImage = 'url(img/venue-marker.png)';
      }
      
      el.style.width = type === 'venue' ? '20px' : '30px';
      el.style.height = type === 'venue' ? '20px' : '30px';
      el.style.backgroundSize = '100%';
      
      const marker = new mapboxgl.Marker(el)
        .setLngLat([coordinates.lng, coordinates.lat])
        .addTo(this.map);
      
      this.markers.push(marker);
      return marker;
    }
  
    /**
     * Add a venue marker with popup
     */
    addVenueMarker(venue) {
      const coordinates = {
        lng: venue.geocodes.main.longitude,
        lat: venue.geocodes.main.latitude
      };
      
      const marker = this.addMarker(coordinates, 'venue');
      
      // Add popup with venue info
      marker.setPopup(new mapboxgl.Popup({ offset: 25 })
        .setHTML(`<h3>${venue.name}</h3><p>${venue.categories[0]?.name || 'Business'}</p>`));
      
      return marker;
    }
  
    /**
     * Clear all markers from the map
     */
    clearMarkers() {
      this.markers.forEach(marker => marker.remove());
      this.markers = [];
      
      // Also remove any existing route layers
      if (this.map.getLayer('fastest-route')) this.map.removeLayer('fastest-route');
      if (this.map.getSource('fastest-route')) this.map.removeSource('fastest-route');
      if (this.map.getLayer('comfort-route')) this.map.removeLayer('comfort-route');
      if (this.map.getSource('comfort-route')) this.map.removeSource('comfort-route');
    }
  
    /**
     * Fit the map to show all markers
     */
    fitMapToMarkers() {
      if (this.markers.length === 0) return;
      
      const bounds = new mapboxgl.LngLatBounds();
      this.markers.forEach(marker => bounds.extend(marker.getLngLat()));
      this.map.fitBounds(bounds, { padding: 100 });
    }
  
    /**
     * Display routes on the map
     */
    displayRoutes(fastestRoute, comfortRoute) {
      // Display fastest route
      if (fastestRoute && fastestRoute.routes && fastestRoute.routes.length > 0) {
        const route = fastestRoute.routes[0];
        
        if (this.map.getSource('fastest-route')) {
          this.map.removeSource('fastest-route');
        }
        
        if (this.map.getLayer('fastest-route')) {
          this.map.removeLayer('fastest-route');
        }
        
        this.map.addSource('fastest-route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: route.geometry
          }
        });
        
        this.map.addLayer({
          id: 'fastest-route',
          type: 'line',
          source: 'fastest-route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#888',
            'line-width': 6,
            'line-opacity': 0.5
          }
        });
      }
      
      // Display comfort route
      if (comfortRoute && comfortRoute.routes && comfortRoute.routes.length > 0) {
        const route = comfortRoute.routes[0];
        
        if (this.map.getSource('comfort-route')) {
          this.map.removeSource('comfort-route');
        }
        
        if (this.map.getLayer('comfort-route')) {
          this.map.removeLayer('comfort-route');
        }
        
        this.map.addSource('comfort-route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: route.geometry
          }
        });
        
        this.map.addLayer({
          id: 'comfort-route',
          type: 'line',
          source: 'comfort-route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#3b82f6',
            'line-width': 6
          }
        });
      }
    }
  }
  
  // Export the MapHandler class
  window.MapHandler = MapHandler;