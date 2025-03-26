import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const STRAVA_API_URL = 'https://www.strava.com/api/v3';
const ATHLETE_ID = '42678770';

interface StravaStats {
  ytd_run_totals: {
    count: number;
    distance: number;
    moving_time: number;
    elevation_gain: number;
  };
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

async function getAccessToken(): Promise<string> {
  const response = await axios.post<TokenResponse>(
    'https://www.strava.com/oauth/token',
    {
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: process.env.STRAVA_REFRESH_TOKEN,
      grant_type: 'refresh_token'
    }
  );
  return response.data.access_token;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const accessToken = await getAccessToken();
    const response = await axios.get<StravaStats>(
      `${STRAVA_API_URL}/athletes/${ATHLETE_ID}/stats`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const distanceInKm = Math.round(response.data.ytd_run_totals.distance / 1000);
    return res.status(200).json({ distance: `${distanceInKm}km` });
  } catch (error) {
    console.error('Error fetching Strava stats:', error);
    return res.status(500).json({ 
      message: 'Error fetching Strava stats',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 