import { getStravaStats } from '../utils/strava-redis';
import { parseAndConvertDistance } from '../utils/unitConversion';

interface StravaStats {
  distance: string;
  lastUpdated: string;
  lastKnownGoodDistance?: string;
}

const TEMPORARY_OVERRIDE = '407km';  // Temporary override until API catches up
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

export async function getYTDRunningDistance(): Promise<string> {
  try {
    // Use fetch to get stats from API route
    const response = await fetch('/api/strava/stats');
    
    // Check if the response is ok and actually JSON
    if (!response.ok) {
      console.error('API response not ok:', response.status, response.statusText);
      return parseAndConvertDistance(TEMPORARY_OVERRIDE);
    }

    // Check content type to ensure it's JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Response is not JSON, got:', contentType);
      const text = await response.text();
      console.error('Response body:', text.substring(0, 200) + '...');
      return parseAndConvertDistance(TEMPORARY_OVERRIDE);
    }

    const stats = await response.json();
    
    // Convert to local units
    if (stats.distance) {
      return parseAndConvertDistance(stats.distance);
    }
    
    // Fall back to last known good distance if available
    if (stats.lastKnownGoodDistance) {
      return parseAndConvertDistance(stats.lastKnownGoodDistance);
    }
    
    // Final fallback to temporary override
    return parseAndConvertDistance(TEMPORARY_OVERRIDE);
  } catch (error) {
    console.error('Error fetching Strava stats:', error);
    return parseAndConvertDistance(TEMPORARY_OVERRIDE);
  }
} 