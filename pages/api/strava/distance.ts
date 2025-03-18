import { NextApiRequest, NextApiResponse } from 'next';
import strava from 'strava-v3';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check for required environment variables
    if (!process.env.STRAVA_CLIENT_ID || !process.env.STRAVA_CLIENT_SECRET || !process.env.STRAVA_REFRESH_TOKEN) {
      throw new Error('Missing required Strava environment variables');
    }

    // First, get a new access token using the refresh token
    console.log('Getting new access token...');
    const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        refresh_token: process.env.STRAVA_REFRESH_TOKEN,
        grant_type: 'refresh_token',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`Token refresh failed: ${tokenResponse.statusText}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('Got new access token');

    // Configure Strava with new access token
    strava.config({
      access_token: tokenData.access_token,
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      redirect_uri: 'http://localhost:3000/api/strava/callback'
    });

    // Get current year's start date
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1).getTime() / 1000;

    // Get athlete activities
    console.log('Fetching activities...');
    const activities = await strava.athlete.listActivities({
      after: yearStart,
      per_page: 100,
      page: 1
    });

    console.log(`Found ${activities.length} activities`);

    // Calculate total running distance in kilometers
    const totalDistance = activities
      .filter((activity: any) => activity.type === 'Run')
      .reduce((sum: number, activity: any) => sum + activity.distance / 1000, 0);

    console.log(`Total distance: ${Math.round(totalDistance)}km`);
    return res.status(200).json({ distance: Math.round(totalDistance) });
  } catch (error) {
    console.error('Detailed error:', error);
    return res.status(500).json({ 
      message: 'Error fetching Strava data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 