import { NextResponse } from 'next/server';
import axios from 'axios';

const STRAVA_API_URL = 'https://www.strava.com/api/v3';

interface StravaActivity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  sport_type: string;
  start_date: string;
  start_date_local: string;
  average_speed: number;
  max_speed: number;
  average_cadence?: number;
  average_heartrate?: number;
  max_heartrate?: number;
  has_heartrate: boolean;
}

async function getAccessToken(): Promise<string> {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const refreshToken = process.env.STRAVA_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing required Strava environment variables: STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, or STRAVA_REFRESH_TOKEN');
  }

  const response = await axios.post('https://www.strava.com/oauth/token', {
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token'
  });

  if (!response.data?.access_token) {
    throw new Error('Failed to get access token from Strava');
  }

  return response.data.access_token;
}

// Try to get Redis client, return null if unavailable
async function tryGetRedisClient() {
  try {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      console.log('REDIS_URL not set, skipping cache');
      return null;
    }
    const { getRedisClient } = await import('../../../../utils/redis');
    return await getRedisClient();
  } catch (error) {
    console.error('Failed to get Redis client:', error);
    return null;
  }
}

function getCacheKey(after: number, before: number): string {
  return `strava-activities-${after}-${before}`;
}

async function getCachedActivities(after: number, before: number): Promise<StravaActivity[] | null> {
  try {
    const client = await tryGetRedisClient();
    if (!client) return null;
    
    const cacheKey = getCacheKey(after, before);
    const cached = await client.get(cacheKey);
    if (cached) {
      console.log('Got cached activities');
      return JSON.parse(cached);
    }
    return null;
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
}

async function cacheActivities(after: number, before: number, activities: StravaActivity[]): Promise<void> {
  try {
    const client = await tryGetRedisClient();
    if (!client) return;
    
    const cacheKey = getCacheKey(after, before);
    await client.set(cacheKey, JSON.stringify(activities), { EX: 5 * 60 }); // 5 min TTL
    console.log('Cached activities');
  } catch (error) {
    console.error('Error writing to cache:', error);
  }
}

async function fetchAllActivities(accessToken: string, after: number, before: number): Promise<StravaActivity[]> {
  const allActivities: StravaActivity[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const response = await axios.get<StravaActivity[]>(`${STRAVA_API_URL}/athlete/activities`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { after, before, page, per_page: perPage }
    });

    const activities = response.data;
    if (!activities || activities.length === 0) {
      break;
    }

    allActivities.push(...activities);

    if (activities.length < perPage) {
      break;
    }

    page++;
  }

  return allActivities;
}

function filterRunWalkActivities(activities: StravaActivity[]): StravaActivity[] {
  const allowedSportTypes = ['Run', 'Walk', 'TrailRun', 'VirtualRun'];
  return activities.filter(activity => allowedSportTypes.includes(activity.sport_type));
}

export async function GET(request: Request) {
  console.log('=== Starting Strava activities request ===');
  
  try {
    const { searchParams } = new URL(request.url);
    const afterParam = searchParams.get('after');
    const beforeParam = searchParams.get('before');

    // Default to current week if no params provided
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const after = afterParam ? parseInt(afterParam, 10) : Math.floor(monday.getTime() / 1000);
    const before = beforeParam ? parseInt(beforeParam, 10) : Math.floor(sunday.getTime() / 1000);

    // Try to get cached activities first
    const cachedActivities = await getCachedActivities(after, before);
    if (cachedActivities) {
      return NextResponse.json({
        activities: cachedActivities,
        cached: true,
        count: cachedActivities.length
      });
    }

    // Fetch from Strava API
    console.log('Fetching fresh activities from Strava...');
    const accessToken = await getAccessToken();
    const allActivities = await fetchAllActivities(accessToken, after, before);
    
    // Filter to only Run and Walk activities
    const filteredActivities = filterRunWalkActivities(allActivities);

    // Map to only include needed fields
    const activities = filteredActivities.map(activity => ({
      id: activity.id,
      name: activity.name,
      distance: activity.distance,
      moving_time: activity.moving_time,
      elapsed_time: activity.elapsed_time,
      total_elevation_gain: activity.total_elevation_gain,
      sport_type: activity.sport_type,
      start_date: activity.start_date,
      start_date_local: activity.start_date_local,
      average_speed: activity.average_speed,
      average_cadence: activity.average_cadence,
      average_heartrate: activity.average_heartrate,
      max_heartrate: activity.max_heartrate,
      has_heartrate: activity.has_heartrate
    }));

    // Try to cache the results (don't fail if caching fails)
    await cacheActivities(after, before, activities as StravaActivity[]);

    return NextResponse.json({
      activities,
      cached: false,
      count: activities.length
    });
  } catch (error) {
    console.error('Error fetching Strava activities:', error);
    
    // Return empty array instead of 500 error
    // This allows the UI to show "No activities found" instead of breaking
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      activities: [],
      cached: false,
      count: 0,
      error: errorMessage
    });
  }
}
