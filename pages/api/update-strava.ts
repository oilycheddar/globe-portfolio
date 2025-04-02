import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const STRAVA_API_URL = 'https://www.strava.com/api/v3';
const ATHLETE_ID = '42678770';
const STATS_FILE = path.join(process.cwd(), 'data', 'strava-stats.json');

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

    // Ensure data directory exists
    const dir = path.dirname(STATS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write to file
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));

    res.status(200).json({ message: 'Stats updated successfully', stats });
  } catch (error) {
    console.error('Error updating Strava stats:', error);
    res.status(500).json({ message: 'Failed to update stats', error });
  }
} 