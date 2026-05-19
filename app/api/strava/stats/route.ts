import { NextResponse } from 'next/server';
import { getStravaStats, updateStravaStats, isDataStale, acquireUpdateLock, releaseUpdateLock, StravaStats } from '../../../../utils/strava-redis';

const STRAVA_API_URL = 'https://www.strava.com/api/v3';
const ATHLETE_ID = process.env.STRAVA_ATHLETE_ID;

async function getAccessToken(): Promise<string> {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const refreshToken = process.env.STRAVA_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing required Strava environment variables: STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, or STRAVA_REFRESH_TOKEN');
  }

  try {
    console.log('Attempting to get access token with:', {
      client_id: clientId,
      refresh_token: refreshToken.substring(0, 5) + '...'
    });
    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      console.error('Token refresh error:', response.status, errorBody);
      throw new Error(`Strava token refresh failed: ${response.status}`);
    }

    const data = await response.json();
    if (!data?.access_token) {
      throw new Error('Invalid response from Strava token endpoint: missing access_token');
    }

    return data.access_token as string;
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
}

async function fetchFreshStravaStats(): Promise<{ distance: string; elevation: string; lastKnownGoodDistance?: string; lastKnownGoodElevation?: string }> {
  if (!ATHLETE_ID) {
    throw new Error('STRAVA_ATHLETE_ID environment variable is not set');
  }

  try {
    const accessToken = await getAccessToken();
    console.log('Got access token, fetching stats for athlete:', ATHLETE_ID);
    const response = await fetch(
      `${STRAVA_API_URL}/athletes/${ATHLETE_ID}/stats`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      console.error('Error fetching Strava stats:', response.status, errorBody);
      throw new Error(`Strava stats fetch failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('Raw Strava API response:', data);

    // Validate response structure
    if (!data?.ytd_run_totals) {
      throw new Error('Invalid Strava API response: missing ytd_run_totals');
    }

    const distance = data.ytd_run_totals.distance;
    if (typeof distance !== 'number' || isNaN(distance)) {
      throw new Error(`Invalid distance value from Strava API: ${distance}`);
    }

    const elevationGain = data.ytd_run_totals.elevation_gain;
    const elevationInMeters = typeof elevationGain === 'number' && !isNaN(elevationGain)
      ? Math.round(elevationGain)
      : 0;

    const distanceInKm = Math.round(distance / 1000);
    const newDistance = `${distanceInKm}km`; // Always store in km
    const newElevation = `${elevationInMeters}m`; // Always store in metres
    console.log('Parsed distance:', newDistance, 'elevation:', newElevation);

    return {
      distance: newDistance,
      elevation: newElevation,
      ...(distanceInKm > 0 ? { lastKnownGoodDistance: newDistance } : {}),
      ...(elevationInMeters > 0 ? { lastKnownGoodElevation: newElevation } : {})
    };
  } catch (error) {
    console.error('Error fetching Strava stats:', error);
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
            : currentStats?.lastKnownGoodDistance,
          lastKnownGoodElevation: freshStats.elevation !== '0m'
            ? freshStats.elevation
            : currentStats?.lastKnownGoodElevation
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
          elevation: '8500m',
          lastUpdated: new Date().toISOString(),
          lastKnownGoodDistance: '407km',
          lastKnownGoodElevation: '8500m'
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