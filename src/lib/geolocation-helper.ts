// src/lib/geolocation-helper.ts
export interface LocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  retryAttempts?: number;
  fallbackToIP?: boolean;
}

export interface LocationResult {
  lat: number;
  long: number;
  accuracy?: number;
  source: "gps" | "ip";
}

/**
 * Get accurate location with retry logic and fallback options
 */
export async function getAccurateLocation(
  options: LocationOptions = {}
): Promise<LocationResult> {
  const {
    enableHighAccuracy = true,
    timeout = 15000,
    maximumAge = 0,
    retryAttempts = 3,
    fallbackToIP = true,
  } = options;

  // First try GPS with multiple attempts
  for (let attempt = 1; attempt <= retryAttempts; attempt++) {
    try {
      console.log(`🛰️ GPS attempt ${attempt}/${retryAttempts}...`);

      const location = await getCurrentPositionAsync({
        enableHighAccuracy,
        timeout: timeout * attempt, // Increase timeout for each attempt
        maximumAge: attempt === 1 ? maximumAge : 0, // Fresh reading for retries
      });

      // Validate accuracy - reject readings that are clearly wrong
      if (location.accuracy && location.accuracy > 5000) {
        console.warn(
          `⚠️ GPS accuracy too poor (${location.accuracy}m), retrying...`
        );
        continue;
      }

      console.log(`✅ GPS success: ±${location.accuracy}m`);
      return {
        lat: location.latitude,
        long: location.longitude,
        accuracy: location.accuracy,
        source: "gps",
      };
    } catch (error: any) {
      console.warn(`❌ GPS attempt ${attempt} failed:`, error.message);

      // If it's permission denied, don't retry
      if (error.code === 1) {
        // PERMISSION_DENIED
        throw error;
      }

      // Continue to next attempt or fallback
      if (attempt === retryAttempts) {
        if (fallbackToIP) {
          console.log("🌐 Falling back to IP-based location...");
          return await getIPLocation();
        } else {
          throw error;
        }
      }
    }
  }

  throw new Error("Location detection failed after all attempts");
}

/**
 * Watch accurate location with real-time updates
 */
export function watchAccurateLocation(
  onSuccess: (location: LocationResult) => void,
  onError: (error: GeolocationPositionError) => void,
  options: LocationOptions = {}
): number | null {
  if (!navigator.geolocation) {
    onError(new Error("Geolocation not supported") as any);
    return null;
  }

  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 3000,
  } = options;

  return navigator.geolocation.watchPosition(
    (position) => {
      onSuccess({
        lat: position.coords.latitude,
        long: position.coords.longitude,
        accuracy: position.coords.accuracy,
        source: "gps",
      });
    },
    onError,
    {
      enableHighAccuracy,
      timeout,
      maximumAge,
    }
  );
}

/**
 * Stop watching location
 */
export function stopWatchingLocation(watchId: number): void {
  navigator.geolocation.clearWatch(watchId);
}

/**
 * Convert getCurrentPosition to Promise
 */
function getCurrentPositionAsync(
  options: PositionOptions
): Promise<GeolocationCoordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position.coords),
      (error) => reject(error),
      options
    );
  });
}

/**
 * Fallback to IP-based location
 */
async function getIPLocation(): Promise<LocationResult> {
  try {
    // Using a free IP geolocation service
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();

    if (data.latitude && data.longitude) {
      return {
        lat: parseFloat(data.latitude),
        long: parseFloat(data.longitude),
        accuracy: 10000, // IP location is very approximate
        source: "ip",
      };
    }
  } catch (error) {
    console.error("IP location failed:", error);
  }

  // Final fallback to Surabaya center
  return {
    lat: -7.2575,
    long: 112.7521,
    accuracy: 50000,
    source: "ip",
  };
}
