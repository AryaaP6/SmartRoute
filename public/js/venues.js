class VenueHandler {
  constructor() {}

  /**
   * Fetch venues from server
   */
  async fetchVenues(start, end) {
    const response = await fetch('/api/venues', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ start, end })
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch venues');
    }
    
    return await response.json();
  }

  /**
   * Process k-means clustering on venues
   */
  processVenueClusters(venues, k) {
    if (!venues || venues.length === 0) {
      return Array(k).fill().map(() => []);
    }
    
    // Extract coordinates from venues
    const points = venues.map(venue => [
      venue.geocodes.main.longitude,
      venue.geocodes.main.latitude
    ]);
    
    try {
      // Using our custom k-means implementation
      const clusters = customKmeans(points, k);
      
      // Group venues by their cluster
      const venuesByCluster = Array(k).fill().map(() => []);
      
      points.forEach((point, i) => {
        // Find the closest centroid
        let minDistance = Infinity;
        let clusterId = 0;
        
        clusters.forEach((centroid, j) => {
          const distance = Math.sqrt(
            Math.pow(point[0] - centroid[0], 2) + 
            Math.pow(point[1] - centroid[1], 2)
          );
          
          if (distance < minDistance) {
            minDistance = distance;
            clusterId = j;
          }
        });
        
        venuesByCluster[clusterId].push(venues[i]);
      });
      
      return venuesByCluster;
    } catch (error) {
      console.error('Error in k-means clustering:', error);
      return this.fallbackClustering(venues, k);
    }
  }

  /**
   * Fallback clustering if k-means fails
   */
  fallbackClustering(venues, k) {
    const venuesByCluster = Array(k).fill().map(() => []);
    
    venues.forEach((venue, i) => {
      const clusterId = i % k;
      venuesByCluster[clusterId].push(venue);
    });
    
    return venuesByCluster;
  }
}

// Custom K-means implementation
function customKmeans(points, k, maxIterations = 100) {
  if (!points || points.length === 0 || k <= 0) {
    return [];
  }
  
  // Initialize centroids randomly by selecting random points
  let centroids = [];
  const used = new Set();
  
  // Make sure we select k different points as initial centroids
  while (centroids.length < k && centroids.length < points.length) {
    const idx = Math.floor(Math.random() * points.length);
    if (!used.has(idx)) {
      used.add(idx);
      centroids.push([...points[idx]]);
    }
  }
  
  // If we couldn't find k different points, use what we have
  if (centroids.length < k) {
    // Just duplicate some points if we don't have enough unique ones
    while (centroids.length < k) {
      centroids.push([...centroids[centroids.length % used.size]]);
    }
  }
  
  // Run k-means algorithm
  let assignments = [];
  let iteration = 0;
  let changed = true;
  
  while (changed && iteration < maxIterations) {
    // Assign points to closest centroid
    changed = false;
    const newAssignments = [];
    
    points.forEach((point, i) => {
      let minDistance = Infinity;
      let clusterId = 0;
      
      centroids.forEach((centroid, j) => {
        const distance = Math.sqrt(
          Math.pow(point[0] - centroid[0], 2) + 
          Math.pow(point[1] - centroid[1], 2)
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          clusterId = j;
        }
      });
      
      newAssignments[i] = clusterId;
      
      // Check if assignment changed
      if (i >= assignments.length || assignments[i] !== clusterId) {
        changed = true;
      }
    });
    
    assignments = newAssignments;
    
    // Recompute centroids
    const counts = Array(k).fill(0);
    const newCentroids = Array(k).fill().map(() => [0, 0]);
    
    points.forEach((point, i) => {
      const clusterId = assignments[i];
      counts[clusterId]++;
      newCentroids[clusterId][0] += point[0];
      newCentroids[clusterId][1] += point[1];
    });
    
    // Calculate average for each centroid
    for (let i = 0; i < k; i++) {
      if (counts[i] > 0) {
        newCentroids[i][0] /= counts[i];
        newCentroids[i][1] /= counts[i];
      } else {
        // If a centroid has no points, reinitialize it randomly
        const randomPointIndex = Math.floor(Math.random() * points.length);
        newCentroids[i] = [...points[randomPointIndex]];
        changed = true; // Force another iteration
      }
    }
    
    centroids = newCentroids;
    iteration++;
  }
  
  return centroids;
}

// Export the VenueHandler class
window.VenueHandler = VenueHandler;