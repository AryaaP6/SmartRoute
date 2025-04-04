class RouteHandler {
    constructor() {
      this.routes = {
        fastest: null,
        comfort: null
      };
    }
  
    /**
     * Fetch route from server
     */
    async fetchRoute(start, end, waypoints = []) {
      const response = await fetch('/api/route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ start, end, waypoints })
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch route');
      }
      
      return await response.json();
    }
  
    /**
     * Calculate distance between two points
     */
    calculateDistance(point1, point2) {
      return Math.sqrt(
        Math.pow(point1.lat - point2.lat, 2) + 
        Math.pow(point1.lng - point2.lng, 2)
      );
    }
  
    /**
     * Determine waypoints for comfort route based on venue clusters
     */
    determineWaypoints(clusters, start, end) {
      // Find center of each cluster
      const clusterCenters = clusters.map(cluster => {
        if (cluster.length === 0) return null;
        
        const sumLat = cluster.reduce((sum, venue) => sum + venue.geocodes.main.latitude, 0);
        const sumLng = cluster.reduce((sum, venue) => sum + venue.geocodes.main.longitude, 0);
        
        return {
          lat: sumLat / cluster.length,
          lng: sumLng / cluster.length
        };
      }).filter(center => center !== null);
      
      // Only use clusters that have a reasonable number of venues
      const significantCenters = clusterCenters.filter(center => {
        // Filter centers that are too close to start or end
        const distToStart = this.calculateDistance(center, start);
        const distToEnd = this.calculateDistance(center, end);
        return distToStart > 0.01 && distToEnd > 0.01; // Roughly 1km
      });
      
      // Order waypoints to create a reasonable path
      return this.orderWaypoints(significantCenters, start, end);
    }
  
    /**
     * Order waypoints to create a reasonable path
     */
    orderWaypoints(waypoints, start, end) {
      if (waypoints.length <= 1) return waypoints;
      
      // Simple greedy algorithm
      const ordered = [];
      let current = start;
      
      let remaining = [...waypoints];
      
      while (remaining.length > 0) {
        // Find closest waypoint to current position
        let minDist = Infinity;
        let minIndex = -1;
        
        remaining.forEach((waypoint, i) => {
          const dist = this.calculateDistance(current, waypoint);
          if (dist < minDist) {
            minDist = dist;
            minIndex = i;
          }
        });
        
        if (minIndex === -1) break;
        
        // Add closest waypoint to ordered list
        ordered.push(remaining[minIndex]);
        current = remaining[minIndex];
        remaining.splice(minIndex, 1);
      }
      
      return ordered;
    }
  
    /**
     * Calculate a comfort score for a route
     */
    calculateComfortScore(route) {
      // In a real app, this would be based on:
      // - Proximity to open businesses
      // - Crime statistics
      // - Lighting conditions
      // - Pedestrian activity
      
      // For this demo, we'll use a placeholder score
      return 8;
    }
  
    /**
     * Update route information display
     */
    updateRouteInfo(fastestRoute, comfortRoute) {
      const fastestInfo = document.getElementById('fastest-route-info');
      const comfortInfo = document.getElementById('comfort-route-info');
      
      if (fastestRoute && fastestRoute.routes && fastestRoute.routes.length > 0) {
        const route = fastestRoute.routes[0];
        const distance = (route.distance / 1000).toFixed(1);
        const duration = Math.round(route.duration / 60);
        
        fastestInfo.textContent = `Distance: ${distance} km | Time: ${duration} min`;
      } else {
        fastestInfo.textContent = 'Could not calculate fastest route';
      }
      
      if (comfortRoute && comfortRoute.routes && comfortRoute.routes.length > 0) {
        const route = comfortRoute.routes[0];
        const distance = (route.distance / 1000).toFixed(1);
        const duration = Math.round(route.duration / 60);
        const comfortScore = this.calculateComfortScore(route);
        
        comfortInfo.textContent = `Distance: ${distance} km | Time: ${duration} min | Comfort: ${comfortScore}/10`;
      } else {
        comfortInfo.textContent = 'Could not calculate comfort route';
      }
    }
  }
  
  // Export the RouteHandler class
  window.RouteHandler = RouteHandler;