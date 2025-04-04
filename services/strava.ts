import { getStravaStats } from '../utils/strava-redis';

interface StravaStats {
  distance: string;
  lastUpdated: string;
  lastKnownGoodDistance?: string;  // Add this to track last known good value
}

const TEMPORARY_OVERRIDE = '407km';  // Temporary override until API catches up
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

export async function getYTDRunningDistance(): Promise<string> {
  try {
    // Use fetch to get stats from API route
    const response = await fetch('/api/strava/stats');
    const stats = await response.json();
    
    // Return the current distance if available
    if (stats.distance) {
      return stats.distance;
    }
    
    // Fall back to last known good distance if available
    if (stats.lastKnownGoodDistance) {
      return stats.lastKnownGoodDistance;
    }
    
    // Final fallback to temporary override
    return TEMPORARY_OVERRIDE;
  } catch (error) {
    console.error('Error fetching Strava stats:', error);
    return TEMPORARY_OVERRIDE;
  }
} 