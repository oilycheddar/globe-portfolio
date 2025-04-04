import { NextResponse } from 'next/server';
import axios from 'axios';
import { readFromEdgeConfig, updateEdgeConfigItem } from '../../../../utils/edge-config';
  
interface StravaStats {
  distance: string;
  lastUpdated: string;
  lastKnownGoodDistance?: string;
}

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

export const runtime = 'edge';

export async function POST(request: Request) {
  // Verify the request is from Vercel cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get fresh access token
    const accessToken = await getAccessToken();
    // Fetch latest stats
    const stravaResponse = await axios.get(
      `${STRAVA_API_URL}/athletes/${ATHLETE_ID}/stats`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const distanceInKm = Math.round(stravaResponse.data.ytd_run_totals.distance / 1000);
    const newDistance = `${distanceInKm}km`;

    // Get current stats to preserve last known good value if needed
    const currentStats = await readFromEdgeConfig<StravaStats>('strava_stats');

    const stats: StravaStats = {
      distance: newDistance,
      lastUpdated: new Date().toISOString(),
      lastKnownGoodDistance: distanceInKm > 0 ? newDistance : currentStats?.lastKnownGoodDistance
    };

    // Update Edge Config using our utility function
    const success = await updateEdgeConfigItem('strava_stats', stats);

    if (!success) {
      throw new Error('Failed to update Edge Config');
    }

    return NextResponse.json({ message: 'Stats updated successfully', stats });
  } catch (error: unknown) {
    console.error('Error updating Strava stats:', error);
    if (error instanceof Error && error.message.includes('EDGE_CONFIG')) {
      return NextResponse.json({ message: 'Edge Config not properly configured' }, { status: 500 });
    }
    return NextResponse.json({ message: 'Failed to update stats' }, { status: 500 });
  }
} 