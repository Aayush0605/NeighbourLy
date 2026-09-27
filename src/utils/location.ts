import { LocationPoint } from '../types';

/**
 * Default fallback location (e.g., Central Bangalore/Koramangala or Metro hub)
 */
export const DEFAULT_LOCATION: LocationPoint = {
  lat: 12.9352,
  lng: 77.6245,
  neighborhood: 'Koramangala 4th Block',
  city: 'Bengaluru',
  address: 'Koramangala, Bengaluru, Karnataka',
  state: 'Karnataka',
  pincode: '560034',
};

export const POPULAR_LOCATIONS: LocationPoint[] = [
  {
    lat: 12.9352,
    lng: 77.6245,
    neighborhood: 'Koramangala',
    city: 'Bengaluru',
    address: 'Koramangala, Bengaluru, Karnataka',
    state: 'Karnataka',
  },
  {
    lat: 12.9784,
    lng: 77.6408,
    neighborhood: 'Indiranagar',
    city: 'Bengaluru',
    address: '100ft Road, Indiranagar, Bengaluru',
    state: 'Karnataka',
  },
  {
    lat: 12.9915,
    lng: 77.5878,
    neighborhood: 'Malleshwaram',
    city: 'Bengaluru',
    address: 'Sampige Road, Malleshwaram, Bengaluru',
    state: 'Karnataka',
  },
  {
    lat: 28.6315,
    lng: 77.2167,
    neighborhood: 'Connaught Place',
    city: 'New Delhi',
    address: 'Connaught Place, Central Delhi',
    state: 'Delhi',
  },
  {
    lat: 28.5244,
    lng: 77.2066,
    neighborhood: 'Saket & Malviya Nagar',
    city: 'New Delhi',
    address: 'Saket District Centre, South Delhi',
    state: 'Delhi',
  },
  {
    lat: 19.0760,
    lng: 72.8777,
    neighborhood: 'Bandra West',
    city: 'Mumbai',
    address: 'Bandra West, Mumbai Suburban',
    state: 'Maharashtra',
  },
  {
    lat: 19.1136,
    lng: 72.8697,
    neighborhood: 'Andheri East',
    city: 'Mumbai',
    address: 'Chakala, Andheri East, Mumbai',
    state: 'Maharashtra',
  },
  {
    lat: 18.5204,
    lng: 73.8567,
    neighborhood: 'Kothrud & Deccan',
    city: 'Pune',
    address: 'Kothrud, Pune',
    state: 'Maharashtra',
  },
  {
    lat: 30.9010,
    lng: 75.8573,
    neighborhood: 'Sarabha Nagar',
    city: 'Ludhiana',
    address: 'Sarabha Nagar, Ludhiana',
    state: 'Punjab',
  },
];

/**
 * Calculates distance between two coordinates in Kilometers (Haversine formula)
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Detect user's current GPS location via browser API
 */
export async function detectBrowserLocation(): Promise<LocationPoint> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      resolve(DEFAULT_LOCATION);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        try {
          // Attempt reverse geocode using free OpenStreetMap Nominatim with fast timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3500);

          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
            { signal: controller.signal }
          );
          clearTimeout(timeoutId);

          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const neighborhood =
              addr.suburb ||
              addr.neighbourhood ||
              addr.residential ||
              addr.quarter ||
              addr.village ||
              addr.road ||
              'Current Neighborhood';
            const city =
              addr.city ||
              addr.town ||
              addr.municipality ||
              addr.county ||
              'Local Area';

            resolve({
              lat,
              lng,
              neighborhood,
              city,
              address: data.display_name?.split(',').slice(0, 3).join(', ') || `${neighborhood}, ${city}`,
              state: addr.state,
              pincode: addr.postcode,
            });
            return;
          }
        } catch {
          // Fallback to coordinates
        }

        resolve({
          lat,
          lng,
          neighborhood: 'My Current Location',
          city: 'Local Area',
          address: `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`,
        });
      },
      (err) => {
        // Permission denied or unavailable
        resolve(DEFAULT_LOCATION);
      },
      { timeout: 6000, enableHighAccuracy: true }
    );
  });
}
