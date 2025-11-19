// src/utils/geospatial.ts
// Node.js 22+ has native fetch support

// Approximate center coordinates for Vienna's 23 districts (lat, lng)
// Source: Based on general map data for Vienna districts.
const VIENNA_DISTRICT_COORDINATES: { [key: number]: { lat: number; lng: number } } = {
  1: { lat: 48.2085, lng: 16.3731 }, // Innere Stadt
  2: { lat: 48.2167, lng: 16.4000 }, // Leopoldstadt
  3: { lat: 48.1944, lng: 16.3944 }, // Landstraße
  4: { lat: 48.1917, lng: 16.3667 }, // Wieden
  5: { lat: 48.1833, lng: 16.3500 }, // Margareten
  6: { lat: 48.1983, lng: 16.3550 }, // Mariahilf
  7: { lat: 48.2033, lng: 16.3467 }, // Neubau
  8: { lat: 48.2100, lng: 16.3500 }, // Josefstadt
  9: { lat: 48.2200, lng: 16.3500 }, // Alsergrund
  10: { lat: 48.1667, lng: 16.3667 }, // Favoriten
  11: { lat: 48.1667, lng: 16.4333 }, // Simmering
  12: { lat: 48.1750, lng: 16.3167 }, // Meidling
  13: { lat: 48.1833, lng: 16.2833 }, // Hietzing
  14: { lat: 48.2000, lng: 16.2833 }, // Penzing
  15: { lat: 48.1983, lng: 16.3250 }, // Rudolfsheim-Fünfhaus
  16: { lat: 48.2167, lng: 16.3167 }, // Ottakring
  17: { lat: 48.2333, lng: 16.3167 }, // Hernals
  18: { lat: 48.2333, lng: 16.3333 }, // Währing
  19: { lat: 48.2500, lng: 16.3500 }, // Döbling
  20: { lat: 48.2333, lng: 16.3833 }, // Brigittenau
  21: { lat: 48.2667, lng: 16.4000 }, // Floridsdorf
  22: { lat: 48.2167, lng: 16.4667 }, // Donaustadt
  23: { lat: 48.1333, lng: 16.3000 }, // Liesing
};

/**
 * Converts numeric degrees to radians
 */
function toRad(value: number): number {
  return (value * Math.PI) / 180;
}

/**
 * Calculates the distance between two geographical coordinates using the Haversine formula.
 * @param lat1 Latitude of point 1
 * @param lng1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lng2 Longitude of point 2
 * @returns Distance in kilometers (km)
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

/**
 * Gets the center coordinates for a given Vienna district number.
 * @param district The district number (1-23)
 * @returns Coordinates {lat, lng} or null if invalid district
 */
export function getDistrictCoordinates(district: number): { lat: number; lng: number } | null {
  if (district >= 1 && district <= 23) {
    return VIENNA_DISTRICT_COORDINATES[district];
  }
  return null;
}

/**
 * Geocoding helper function using Google Maps Geocoding API.
 * Falls back to null if no API key is configured, forcing the fallback to district coordinates.
 * @param address The full address string
 * @returns Promise resolving to {lat, lng} or null
 */
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const { getEnv } = await import("../server/env");
    const env = getEnv();
    const apiKey = env.google_maps_api_key;

    if (!apiKey) {
      console.log(`Google Maps API key not configured. Skipping geocoding for address: ${address}`);
      return null;
    }

    // Construct the full address with Vienna, Austria for better accuracy
    const fullAddress = `${address}, Vienna, Austria`;
    const encodedAddress = encodeURIComponent(fullAddress);
    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

    console.log(`Attempting to geocode address: ${fullAddress}`);

    const response = await fetch(geocodingUrl);
    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      console.log(`Geocoding successful: ${fullAddress} -> (${location.lat}, ${location.lng})`);
      return {
        lat: location.lat,
        lng: location.lng,
      };
    } else {
      console.warn(`Geocoding failed for address: ${fullAddress}. Status: ${data.status}`);
      if (data.error_message) {
        console.warn(`Error message: ${data.error_message}`);
      }
      return null;
    }
  } catch (error: any) {
    console.error(`Error during geocoding for address: ${address}`, error.message);
    return null;
  }
}
