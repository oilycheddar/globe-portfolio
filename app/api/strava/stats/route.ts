import { NextResponse } from 'next/server';
import axios from 'axios';
import { getStravaStats, updateStravaStats, isDataStale, acquireUpdateLock, releaseUpdateLock, StravaStats } from '../../../../utils/strava-redis';

const STRAVA_API_URL = 'https://www.strava.com/api/v3';
const ATHLETE_ID = process.env.STRAVA_ATHLETE_ID;

async function getAccessToken(): Promise<string> {
  try {
    const response = await axios.post(
      'https://www.strava.com/oauth/token',
      {
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        refresh_token: process.env.STRAVA_REFRESH_TOKEN,
        grant_type: 'refresh_token'
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
}

async function fetchFreshStravaStats(): Promise<{ distance: string; lastKnownGoodDistance?: string }> {
  const accessToken = await getAccessToken();
  const response = await axios.get(
    `${STRAVA_API_URL}/athletes/${ATHLETE_ID}/stats`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const distanceInKm = Math.round(response.data.ytd_run_totals.distance / 1000);
  const newDistance = `${distanceInKm}km`;

  return {
    distance: newDistance,
    ...(distanceInKm > 0 ? { lastKnownGoodDistance: newDistance } : {})
  };
}

export async function GET() {
  try {
    // 1. Get current stats from Redis
    const currentStats = await getStravaStats();
    
    // 2. Check if data is stale
    if (!currentStats.lastUpdated || isDataStale(currentStats.lastUpdated)) {
      // Try to acquire lock to prevent multiple simultaneous updates
      const lockAcquired = await acquireUpdateLock();
      
      if (lockAcquired) {
        try {
          // Fetch fresh data from Strava
          const freshStats = await fetchFreshStravaStats();
          
          // Preserve lastKnownGoodDistance if new distance is 0
          const updatedStats: StravaStats = {
            ...freshStats,
            lastUpdated: new Date().toISOString(),
            lastKnownGoodDistance: freshStats.distance !== '0km' 
              ? freshStats.distance 
              : currentStats.lastKnownGoodDistance
          };
          
          // Update Redis with new stats
          await updateStravaStats(updatedStats);
          
          return NextResponse.json(updatedStats);
        } catch (error) {
          console.error('Error updating Strava stats:', error);
          // Return current stats if update fails
          return NextResponse.json(currentStats);
        } finally {
          // Always release the lock
          await releaseUpdateLock();
        }
      }
    }
    
    // Return current stats if data is fresh or lock couldn't be acquired
    return NextResponse.json(currentStats);
  } catch (error) {
    console.error('Error in Strava stats endpoint:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
} 