import { createClient } from '@vercel/edge-config';

interface StravaStats {
  distance: string;
  lastUpdated: string;
  lastKnownGoodDistance?: string;  // Add this to track last known good value
}

const TEMPORARY_OVERRIDE = '402km';  // Temporary override until API catches up
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

export const getYTDRunningDistance = async (): Promise<string> => {
  // For local development, return the temporary override
  if (IS_DEVELOPMENT) {
    console.log('Running in development mode - using static value:', TEMPORARY_OVERRIDE);
    return TEMPORARY_OVERRIDE;
  }

  try {
    const edge = createClient(process.env.EDGE_CONFIG);
    const stats = await edge.get<StravaStats>('strava_stats');
    
    if (!stats) return TEMPORARY_OVERRIDE;

    // If we have current stats, return them
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
}; 