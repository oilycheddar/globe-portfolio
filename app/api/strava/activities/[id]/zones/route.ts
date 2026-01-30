import { NextResponse } from 'next/server';
import axios from 'axios';

const STRAVA_API_URL = 'https://www.strava.com/api/v3';

interface ZoneBucket {
  min: number;
  max: number;
  time: number;
}

interface ActivityZone {
  score?: number;
  distribution_buckets: ZoneBucket[];
  type: string;
  sensor_based: boolean;
  points?: number;
  custom_zones: boolean;
  max?: number;
}

async function getAccessToken(): Promise<string> {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const refreshToken = process.env.STRAVA_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing required Strava environment variables');
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
    const { getRedisClient } = await import('../../../../../../utils/redis');
    return await getRedisClient();
  } catch (error) {
    console.error('Failed to get Redis client:', error);
    return null;
  }
}

function getCacheKey(activityId: string): string {
  return `strava-activity-zones-${activityId}`;
}

async function getCachedZones(activityId: string): Promise<ActivityZone[] | null> {
  try {
    const client = await tryGetRedisClient();
    if (!client) return null;
    
    const cacheKey = getCacheKey(activityId);
    const cached = await client.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    return null;
  } catch (error) {
    console.error('Error reading zones from cache:', error);
    return null;
  }
}

async function cacheZones(activityId: string, zones: ActivityZone[]): Promise<void> {
  try {
    const client = await tryGetRedisClient();
    if (!client) return;
    
    const cacheKey = getCacheKey(activityId);
    await client.set(cacheKey, JSON.stringify(zones), { EX: 15 * 60 }); // 15 min TTL
  } catch (error) {
    console.error('Error writing zones to cache:', error);
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('=== Starting activity zones request ===');
  
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({
        zones: [],
        activityId: null,
        error: 'Activity ID is required'
      });
    }

    // Check cache first
    const cachedZones = await getCachedZones(id);
    if (cachedZones) {
      return NextResponse.json({
        zones: cachedZones,
        cached: true,
        activityId: id
      });
    }

    // Fetch from Strava API
    console.log(`Fetching zones for activity ${id}...`);
    const accessToken = await getAccessToken();
    const response = await axios.get<ActivityZone[]>(
      `${STRAVA_API_URL}/activities/${id}/zones`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    const allZones = response.data;

    // Filter to only include heartrate zones (exclude pace zones)
    const hrZones = allZones.filter(zone => zone.type === 'heartrate');

    // Try to cache the results
    await cacheZones(id, hrZones);

    return NextResponse.json({
      zones: hrZones,
      cached: false,
      activityId: id
    });
  } catch (error) {
    console.error('Error fetching activity zones:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Return empty zones instead of 500 error
    return NextResponse.json({
      zones: [],
      cached: false,
      activityId: null,
      error: errorMessage
    });
  }
}
