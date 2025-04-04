import { createClient } from 'redis';

const redis = createClient({
  url: process.env.REDIS_URL
});

await redis.connect();

export interface StravaStats {
  distance: string;
  lastUpdated: string;
  lastKnownGoodDistance?: string;
}

const STRAVA_STATS_KEY = 'strava:stats';

/**
 * Reads Strava stats from Redis
 * @returns The Strava stats or null if not found
 */
export async function getStravaStats(): Promise<StravaStats | null> {
  try {
    const stats = await redis.get(STRAVA_STATS_KEY);
    return stats ? JSON.parse(stats) : null;
  } catch (error) {
    console.error('Error reading Strava stats from Redis:', error);
    return null;
  }
}

/**
 * Updates Strava stats in Redis
 * @param stats The stats to update
 * @returns True if successful, false otherwise
 */
export async function updateStravaStats(stats: StravaStats): Promise<boolean> {
  try {
    await redis.set(STRAVA_STATS_KEY, JSON.stringify(stats));
    return true;
  } catch (error) {
    console.error('Error updating Strava stats in Redis:', error);
    return false;
  }
} 