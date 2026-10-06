import { LocationPoint } from '../types';

/**
 * Default fallback location if no GPS or network is available
 */
export const DEFAULT_LOCATION: LocationPoint = {
  lat: 28.6139,
  lng: 77.2090,
  neighborhood: 'Campus & Neighborhood Area',
  city: 'Local City',
  address: 'Campus & Neighborhood Area, Local City',
  state: '',
  pincode: '',
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
 * Detect user's real current location via browser GPS API with automatic IP-based fallback
 * Ensures users in any city/region see their genuine location instead of a fixed default.
 */
export async function detectBrowserLocation(): Promise<LocationPoint> {
  // 0. Check if real location was already detected and stored
  try {
    const cached = localStorage.getItem('neighborly_real_location');
    if (cached) {
      const parsed = JSON.parse(cached) as LocationPoint;
      if (parsed && parsed.city) {
        return parsed;
      }
    }
  } catch (e) {}

  // Helper 1: Query first-party server detection endpoint (/api/detect-location)
  const fetchServerLocation = async (): Promise<LocationPoint | null> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const res = await fetch('/api/detect-location', { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && data.city && data.city !== 'Your Campus City') {
          const pt: LocationPoint = {
            lat: Number(data.lat) || DEFAULT_LOCATION.lat,
            lng: Number(data.lng) || DEFAULT_LOCATION.lng,
            city: data.city,
            neighborhood: data.neighborhood || data.city,
            address: data.address || `${data.city}, ${data.state || ''}`,
            state: data.state || '',
            pincode: data.pincode || '',
          };
          try {
            localStorage.setItem('neighborly_real_location', JSON.stringify(pt));
          } catch (e) {}
          return pt;
        }
      }
    } catch (e) {}
    return null;
  };

  // Helper 2: Try IP-based Geolocation fallbacks
  const fetchIpLocation = async (): Promise<LocationPoint | null> => {
    const serverLoc = await fetchServerLocation();
    if (serverLoc) return serverLoc;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const res = await fetch('https://freeipapi.com/api/json', { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && data.cityName) {
          const point: LocationPoint = {
            lat: Number(data.latitude) || DEFAULT_LOCATION.lat,
            lng: Number(data.longitude) || DEFAULT_LOCATION.lng,
            city: data.cityName,
            neighborhood: data.regionName || data.cityName,
            address: `${data.cityName}, ${data.regionName || data.countryName}`,
            state: data.regionName,
            pincode: data.zipCode || '',
          };
          try {
            localStorage.setItem('neighborly_real_location', JSON.stringify(point));
          } catch (e) {}
          return point;
        }
      }
    } catch (err) {
      try {
        const controller2 = new AbortController();
        const timeoutId2 = setTimeout(() => controller2.abort(), 3000);
        const res2 = await fetch('https://ipapi.co/json/', { signal: controller2.signal });
        clearTimeout(timeoutId2);
        if (res2.ok) {
          const data2 = await res2.json();
          if (data2 && data2.city) {
            const point: LocationPoint = {
              lat: Number(data2.latitude) || DEFAULT_LOCATION.lat,
              lng: Number(data2.longitude) || DEFAULT_LOCATION.lng,
              city: data2.city,
              neighborhood: data2.region || data2.city,
              address: `${data2.city}, ${data2.region || data2.country_name}`,
              state: data2.region,
              pincode: data2.postal || '',
            };
            try {
              localStorage.setItem('neighborly_real_location', JSON.stringify(point));
            } catch (e) {}
            return point;
          }
        }
      } catch (e) {}
    }
    return null;
  };

  // 1. Try Browser GPS first
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      fetchIpLocation().then((ipLoc) => resolve(ipLoc || DEFAULT_LOCATION));
      return;
    }

    let hasResolved = false;

    // Timeout safety fallback to IP location after 3.5 seconds
    const fallbackTimer = setTimeout(async () => {
      if (!hasResolved) {
        hasResolved = true;
        const ipLoc = await fetchIpLocation();
        resolve(ipLoc || DEFAULT_LOCATION);
      }
    }, 3500);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        if (hasResolved) return;
        hasResolved = true;
        clearTimeout(fallbackTimer);

        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        try {
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
              addr.state_district ||
              'Local City';

            const detectedPoint: LocationPoint = {
              lat,
              lng,
              neighborhood,
              city,
              address: data.display_name?.split(',').slice(0, 3).join(', ') || `${neighborhood}, ${city}`,
              state: addr.state,
              pincode: addr.postcode,
            };

            try {
              localStorage.setItem('neighborly_real_location', JSON.stringify(detectedPoint));
            } catch (e) {}

            resolve(detectedPoint);
            return;
          }
        } catch {
          // OpenStreetMap failed, try IP fallback
        }

        const ipLoc = await fetchIpLocation();
        if (ipLoc) {
          resolve(ipLoc);
          return;
        }

        resolve({
          lat,
          lng,
          neighborhood: 'My Current Location',
          city: 'Local Area',
          address: `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`,
        });
      },
      async (_err) => {
        if (hasResolved) return;
        hasResolved = true;
        clearTimeout(fallbackTimer);
        const ipLoc = await fetchIpLocation();
        resolve(ipLoc || DEFAULT_LOCATION);
      },
      { timeout: 4000, enableHighAccuracy: true }
    );
  });
}
