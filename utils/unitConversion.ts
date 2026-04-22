// Utility function to convert distance based on user's locale
export function convertDistanceToLocalUnit(distanceKm: number): { value: number; unit: string } {
  // Check if user is in the US (miles) or elsewhere (kilometers)
  // US uses miles, Canada and most other countries use kilometers
  const isUS = navigator.language === 'en-US' || 
               navigator.language.startsWith('en-US') ||
               navigator.languages.some(lang => lang.startsWith('en-US'));
  
  // Canada uses kilometers (metric system)
  const isCanada = navigator.language === 'en-CA' || 
                   navigator.language === 'fr-CA' ||
                   navigator.language.startsWith('en-CA') ||
                   navigator.language.startsWith('fr-CA') ||
                   navigator.languages.some(lang => lang.startsWith('en-CA') || lang.startsWith('fr-CA'));
  
  if (isUS) {
    // Convert to miles (1 km = 0.621371 miles)
    const miles = Math.round(distanceKm * 0.621371);
    return { value: miles, unit: 'mi' };
  } else {
    // Keep as kilometers (for Canada and all other countries)
    return { value: distanceKm, unit: 'km' };
  }
}

// Function to format distance string with proper unit
export function formatDistance(distanceKm: number): string {
  const { value, unit } = convertDistanceToLocalUnit(distanceKm);
  return `${value}${unit}`;
}

// Function to parse distance string and convert to local unit
export function parseAndConvertDistance(distanceString: string): string {
  // Extract the numeric value from strings like "407km" or "253mi"
  const match = distanceString.match(/^(\d+)(km|mi)$/);
  if (!match) {
    return distanceString; // Return as-is if format is unexpected
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  if (unit === 'km') {
    return formatDistance(value);
  } else if (unit === 'mi') {
    // Convert miles back to km, then to local unit
    const kmValue = Math.round(value / 0.621371);
    return formatDistance(kmValue);
  }

  return distanceString;
}

// US uses feet for elevation. Canada and everywhere else use metres.
function usesImperialElevation(): boolean {
  if (typeof navigator === 'undefined') return false;
  return navigator.language === 'en-US' ||
         navigator.language.startsWith('en-US') ||
         navigator.languages.some(lang => lang.startsWith('en-US'));
}

export function convertElevationToLocalUnit(elevationMeters: number): { value: number; unit: string } {
  if (usesImperialElevation()) {
    const feet = Math.round(elevationMeters * 3.28084);
    return { value: feet, unit: 'ft' };
  }
  return { value: Math.round(elevationMeters), unit: 'm' };
}

export function formatElevation(elevationMeters: number): string {
  const { value, unit } = convertElevationToLocalUnit(elevationMeters);
  return `${value}${unit}`;
}

// Parse a canonical elevation string (always stored as "1234m") and convert to the user's locale unit.
export function parseAndConvertElevation(elevationString: string): string {
  const match = elevationString.match(/^(\d+)(m|ft)$/);
  if (!match) {
    return elevationString;
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  if (unit === 'm') {
    return formatElevation(value);
  } else if (unit === 'ft') {
    const meters = Math.round(value / 3.28084);
    return formatElevation(meters);
  }

  return elevationString;
}
