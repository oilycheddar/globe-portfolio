import { getRedisClient } from './redis';

export interface StravaStats {
  distance: string;
  lastUpdated: string;
  lastKnownGoodDistance?: string;
}

const FIFTEEN_MINUTES = 15 * 60 * 1000; // 15 minutes in milliseconds
const TEMPORARY_OVERRIDE = '407km';

// Check if data is stale (older than 15 minutes)
export function isDataStale(lastUpdated: string): boolean {
  const lastUpdateTime = new Date(lastUpdated).getTime();
  const fifteenMinutesAgo = Date.now() - FIFTEEN_MINUTES;
  return lastUpdateTime < fifteenMinutesAgo;
}

export async function getStravaStats(): Promise<StravaStats> {
  try {
    const client = await getRedisClient();
    const stats = await client.get('strava-stats');
    
    if (!stats) {
      // If no stats exist, return default with current timestamp
      return {
        distance: TEMPORARY_OVERRIDE,
        lastUpdated: new Date().toISOString(),
        lastKnownGoodDistance: TEMPORARY_OVERRIDE
      };
    }
    
    return JSON.parse(stats);
  } catch (error) {
    console.error('Error reading Strava stats from Redis:', error);
    // Return default stats if Redis read fails
    return {
      distance: TEMPORARY_OVERRIDE,
      lastUpdated: new Date().toISOString(),
      lastKnownGoodDistance: TEMPORARY_OVERRIDE
    };
  }
}

export async function updateStravaStats(stats: StravaStats): Promise<boolean> {
  try {
    const client = await getRedisClient();
    // Always update lastUpdated when saving
    const updatedStats = {
      ...stats,
      lastUpdated: new Date().toISOString()
    };
    await client.set('strava-stats', JSON.stringify(updatedStats));
    return true;
  } catch (error) {
    console.error('Error updating Strava stats in Redis:', error);
    return false;
  }
}

// Add a lock mechanism to prevent multiple simultaneous updates
export async function acquireUpdateLock(): Promise<boolean> {
  try {
    const client = await getRedisClient();
    // Try to set a lock with 30 second expiry
    const locked = await client.set('strava-update-lock', '1', {
      NX: true, // Only set if not exists
      EX: 30 // 30 second expiry
    });
    return !!locked;
  } catch (error) {
    console.error('Error acquiring update lock:', error);
    return false;
  }
}

export async function releaseUpdateLock(): Promise<void> {
  try {
    const client = await getRedisClient();
    await client.del('strava-update-lock');
  } catch (error) {
    console.error('Error releasing update lock:', error);
  }
} 