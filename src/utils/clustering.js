/**
* Perform k-means clustering on venues
 * @param {Array} venues - Array of venue objects
 * @param {Number} k - Number of clusters
 * @returns {Array} - Array of venue clusters
 */
exports.kMeansClustering = (venues, k) => {
  if (venues.length === 0) return [];
  
  // Extract coordinates from venues
  const points = venues.map(venue => [
    venue.geocodes.main.longitude,
    venue.geocodes.main.latitude
  ]);
  
  // Using simple-statistics for k-means clustering
  try {
    // In a real implementation, we'd use the simple-statistics library
    // This is a placeholder for the actual implementation
    const clusters = simulateKMeans(points, k);
    
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
    // Fallback to random assignment
    return fallbackClustering(venues, k);
  }
};

/**
 * Simplified k-means implementation
 * In a real app, use a library like simple-statistics
 */
function simulateKMeans(points, k) {
  // For demo purposes, just create k random centroids
  const centroids = [];
  
  // Find min/max bounds of points
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;
  
  points.forEach(point => {
    minX = Math.min(minX, point[0]);
    minY = Math.min(minY, point[1]);
    maxX = Math.max(maxX, point[0]);
    maxY = Math.max(maxY, point[1]);
  });
  
  // Create k random centroids within the bounds
  for (let i = 0; i < k; i++) {
    const x = minX + Math.random() * (maxX - minX);
    const y = minY + Math.random() * (maxY - minY);
    centroids.push([x, y]);
  }
  
  return centroids;
}

/**
 * Fallback clustering method if k-means fails
 */
function fallbackClustering(venues, k) {
  const venuesByCluster = Array(k).fill().map(() => []);
  
  venues.forEach((venue, i) => {
    const clusterId = i % k;
    venuesByCluster[clusterId].push(venue);
  });
  
  return venuesByCluster;
}

/**
 * Calculate distance between two points
 */
exports.calculateDistance = (point1, point2) => {
  return Math.sqrt(
    Math.pow(point1.lat - point2.lat, 2) + 
    Math.pow(point1.lng - point2.lng, 2)
  );
};

/**
 * Determine waypoints for the comfort route based on clusters
 */
exports.determineWaypoints = (clusters, start, end) => {
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
};

/**
 * Order waypoints to create a reasonable path
 */
exports.orderWaypoints = (waypoints, start, end) => {
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
};