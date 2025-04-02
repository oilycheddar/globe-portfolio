import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const STRAVA_API_URL = 'https://www.strava.com/api/v3';
const ATHLETE_ID = '42678770';

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests from Vercel cron
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Verify the request is from Vercel cron
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Get fresh access token
    const accessToken = await getAccessToken();
    
    // Fetch latest stats
    const response = await axios.get(
      `${STRAVA_API_URL}/athletes/${ATHLETE_ID}/stats`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const distanceInKm = Math.round(response.data.ytd_run_totals.distance / 1000);
    const stats = {
      distance: `${distanceInKm}km`,
      lastUpdated: new Date().toISOString()
    };

    // Create Edge Config client correctly
    if (!process.env.EDGE_CONFIG) {
      throw new Error('EDGE_CONFIG environment variable is not set');
    }

    // Use the Edge Config API directly
    await fetch(process.env.EDGE_CONFIG, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            operation: 'update',
            key: 'strava_stats',
            value: stats
          }
        ]
      })
    });

    res.status(200).json({ message: 'Stats updated successfully', stats });
  } catch (error: unknown) {
    console.error('Error updating Strava stats:', error);
    if (error instanceof Error && error.message.includes('EDGE_CONFIG')) {
      return res.status(500).json({ message: 'Edge Config not properly configured' });
    }
    res.status(500).json({ message: 'Failed to update stats' });
  }
} 