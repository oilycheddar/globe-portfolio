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