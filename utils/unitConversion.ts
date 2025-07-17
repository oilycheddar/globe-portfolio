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