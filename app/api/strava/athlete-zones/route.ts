import { NextResponse } from 'next/server';
import axios from 'axios';

const STRAVA_API_URL = 'https://www.strava.com/api/v3';

interface ZoneBucket {
  min: number;
  max: number;
  time?: number;
}

interface ZoneConfig {
  heart_rate?: {
    custom_zones: boolean;
    zones: ZoneBucket[];
  };
  power?: {
    zones: ZoneBucket[];
  };
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
    const { getRedisClient } = await import('../../../../utils/redis');
    return await getRedisClient();
  } catch (error) {
    console.error('Failed to get Redis client:', error);
    return null;
  }
}

const CACHE_KEY = 'strava-athlete-zones';

async function getCachedZones(): Promise<ZoneConfig | null> {
  try {
    const client = await tryGetRedisClient();
    if (!client) return null;
    
    const cached = await client.get(CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
    return null;
  } catch (error) {
    console.error('Error reading athlete zones from cache:', error);
    return null;
  }
}

async function cacheZones(zones: ZoneConfig): Promise<void> {
  try {
    const client = await tryGetRedisClient();
    if (!client) return;
    
    await client.set(CACHE_KEY, JSON.stringify(zones), { EX: 60 * 60 }); // 1 hour TTL
  } catch (error) {
    console.error('Error writing athlete zones to cache:', error);
  }
}

// Default zones if API fails
const DEFAULT_ZONES: ZoneConfig = {
  heart_rate: {
    custom_zones: false,
    zones: [
      { min: 0, max: 123 },   // Z1: Recovery
      { min: 123, max: 153 }, // Z2: Endurance
      { min: 153, max: 169 }, // Z3: Tempo
      { min: 169, max: 184 }, // Z4: Threshold
      { min: 184, max: -1 }   // Z5: VO2 Max (no upper limit)
    ]
  }
};

export async function GET() {
  console.log('=== Starting athlete zones request ===');
  
  try {
    // Check cache first
    const cachedZones = await getCachedZones();
    if (cachedZones) {
      return NextResponse.json({
        zones: cachedZones,
        cached: true
      });
    }

    // Fetch from Strava API
    console.log('Fetching athlete zones from Strava...');
    const accessToken = await getAccessToken();
    const response = await axios.get<ZoneConfig>(
      `${STRAVA_API_URL}/athlete/zones`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    const zones = response.data;

    // Try to cache the results
    await cacheZones(zones);

    return NextResponse.json({
      zones,
      cached: false
    });
  } catch (error) {
    console.error('Error fetching athlete zones:', error);
    
    // Return default zones instead of error
    return NextResponse.json({
      zones: DEFAULT_ZONES,
      cached: false,
      isDefault: true,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
