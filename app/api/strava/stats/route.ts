import { NextResponse } from 'next/server';
import axios from 'axios';
import { getStravaStats, updateStravaStats, isDataStale, acquireUpdateLock, releaseUpdateLock, StravaStats } from '../../../../utils/strava-redis';

const STRAVA_API_URL = 'https://www.strava.com/api/v3';
const ATHLETE_ID = process.env.STRAVA_ATHLETE_ID;

async function getAccessToken(): Promise<string> {
  try {
    console.log('Attempting to get access token with:', {
      client_id: process.env.STRAVA_CLIENT_ID,
      refresh_token: process.env.STRAVA_REFRESH_TOKEN?.substring(0, 5) + '...'
    });
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
    if (axios.isAxiosError(error)) {
      console.error('Token refresh error:', error.response?.data || error.message);
    } else {
      console.error('Token refresh error:', error);
    }
    throw error;
  }
}

async function fetchFreshStravaStats(): Promise<{ distance: string; lastKnownGoodDistance?: string }> {
  try {
    const accessToken = await getAccessToken();
    console.log('Got access token, fetching stats for athlete:', ATHLETE_ID);
    const response = await axios.get(
      `${STRAVA_API_URL}/athletes/${ATHLETE_ID}/stats`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    console.log('Raw Strava API response:', response.data);
    const distanceInKm = Math.round(response.data.ytd_run_totals.distance / 1000);
    const newDistance = `${distanceInKm}km`;
    console.log('Parsed distance:', newDistance);

    return {
      distance: newDistance,
      ...(distanceInKm > 0 ? { lastKnownGoodDistance: newDistance } : {})
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching Strava stats:', error.response?.data || error.message);
    } else {
      console.error('Error fetching Strava stats:', error);
    }
    throw error;
  }
}

export async function GET() {
  console.log('=== Starting Strava stats request ===');
  try {
    // Try to get current stats from Redis first
    let currentStats: StravaStats | null = null;
    try {
      currentStats = await getStravaStats();
      console.log('Got current stats from Redis:', currentStats);
    } catch (error) {
      console.error('Failed to get stats from Redis:', error);
      // Continue with fresh fetch if Redis fails
    }

    // Force a fresh fetch for testing
    console.log('Forcing fresh fetch from Strava...');
    const lockAcquired = await acquireUpdateLock();
    
    if (lockAcquired) {
      try {
        console.log('Lock acquired, fetching fresh data');
        const freshStats = await fetchFreshStravaStats();
        console.log('Fresh stats fetched:', freshStats);
        
        const updatedStats: StravaStats = {
          ...freshStats,
          lastUpdated: new Date().toISOString(),
          lastKnownGoodDistance: freshStats.distance !== '0km' 
            ? freshStats.distance 
            : currentStats?.lastKnownGoodDistance
        };
        
        // Try to update Redis, but don't fail if it doesn't work
        try {
          console.log('Updating Redis with:', updatedStats);
          await updateStravaStats(updatedStats);
        } catch (error) {
          console.error('Failed to update Redis:', error);
        }
        
        return NextResponse.json(updatedStats);
      } catch (error) {
        console.error('Error updating Strava stats:', error);
        // Return current stats if available, otherwise fallback
        return NextResponse.json(currentStats || {
          distance: '407km',
          lastUpdated: new Date().toISOString(),
          lastKnownGoodDistance: '407km'
        });
      } finally {
        try {
          await releaseUpdateLock();
        } catch (error) {
          console.error('Failed to release lock:', error);
        }
      }
    } else {
      console.log('Could not acquire lock, returning current stats or fallback');
      return NextResponse.json(currentStats || {
        distance: '407km',
        lastUpdated: new Date().toISOString(),
        lastKnownGoodDistance: '407km'
      });
    }
  } catch (error) {
    console.error('Error in Strava stats endpoint:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
} 