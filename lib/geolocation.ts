/**
 * Geolocation utilities for Cal State San Marcos campus
 * Campus is located in San Marcos, CA
 */

// Cal State San Marcos campus boundaries (approximate)
// These coordinates define a polygon around the main campus
const CSUSM_CAMPUS_BOUNDARY = [
  { lat: 33.1292, lng: -117.1650 }, // Northwest corner
  { lat: 33.1292, lng: -117.1570 }, // Northeast corner
  { lat: 33.1242, lng: -117.1570 }, // Southeast corner
  { lat: 33.1242, lng: -117.1650 }, // Southwest corner
];

// Campus center point for distance calculations
const CSUSM_CENTER = {
  lat: 33.1267,
  lng: -117.1610,
};

// Maximum allowed distance from campus center (in kilometers)
// CSUSM campus is roughly 1.5km x 1km, so 1.5km radius should cover it
const MAX_DISTANCE_KM = 1.5;

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Check if a point is inside a polygon using ray casting algorithm
 */
function isPointInPolygon(
  point: { lat: number; lng: number },
  polygon: { lat: number; lng: number }[]
): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;

    const intersect =
      yi > point.lat !== yj > point.lat &&
      point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Validate if coordinates are within Cal State San Marcos campus
 * Uses both polygon check and distance check for accuracy
 */
export function isOnCampus(latitude: number, longitude: number): boolean {
  const point = { lat: latitude, lng: longitude };

  // Check if point is within campus boundary polygon
  const inPolygon = isPointInPolygon(point, CSUSM_CAMPUS_BOUNDARY);

  // Also check distance from campus center as a backup
  const distance = calculateDistance(
    latitude,
    longitude,
    CSUSM_CENTER.lat,
    CSUSM_CENTER.lng
  );

  // Return true if either check passes (to be more forgiving)
  return inPolygon || distance <= MAX_DISTANCE_KM;
}

/**
 * Get distance from campus center in kilometers
 */
export function getDistanceFromCampus(
  latitude: number,
  longitude: number
): number {
  return calculateDistance(
    latitude,
    longitude,
    CSUSM_CENTER.lat,
    CSUSM_CENTER.lng
  );
}

/**
 * Get user's current location from browser
 */
export function getCurrentLocation(): Promise<{
  latitude: number;
  longitude: number;
}> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}
