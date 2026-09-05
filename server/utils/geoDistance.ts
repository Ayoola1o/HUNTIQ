/**
 * Geographic Distance Utilities (Haversine Formula)
 * Used to strictly verify whether discovered places are within the requested radiusKm.
 */

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

/**
 * Calculates the great-circle distance between two points on the Earth's surface in kilometers.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
/**
 * Checks if a target point is within the specified radius (in kilometers) from a center point.
 */
export function isWithinRadius(
  centerOrLat1: GeoPoint | number,
  targetOrLon1: GeoPoint | number,
  radiusOrLat2: number,
  lon2?: number,
  radiusKmParam?: number
): boolean {
  let lat1: number;
  let lon1: number;
  let lat2: number;
  let lon2Val: number;
  let radius: number;

  if (typeof centerOrLat1 === 'object' && typeof targetOrLon1 === 'object') {
    lat1 = centerOrLat1.latitude;
    lon1 = centerOrLat1.longitude;
    lat2 = targetOrLon1.latitude;
    lon2Val = targetOrLon1.longitude;
    radius = radiusOrLat2;
  } else {
    lat1 = centerOrLat1 as number;
    lon1 = targetOrLon1 as number;
    lat2 = radiusOrLat2;
    lon2Val = lon2 ?? 0;
    radius = radiusKmParam ?? 0;
  }

  const distance = calculateHaversineDistanceKm(lat1, lon1, lat2, lon2Val);
  return distance <= radius;
}
