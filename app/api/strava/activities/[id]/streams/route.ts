import { NextResponse } from 'next/server';

const STRAVA_API_URL = 'https://www.strava.com/api/v3';
const AEROBIC_THRESHOLD = 151; // BPM

interface StreamData {
  type: string;
  data: number[];
  series_type: string;
  original_size: number;
  resolution: string;
}

interface HRMetrics {
  timeBelowThreshold: number;
  timeAboveThreshold: number;
  totalTime: number;
  avgHR: number;
  maxHR: number;
  minHR: number;
  zoneDistribution: {
    zone1: number; // Recovery (< 60% max HR, roughly < 120)
    zone2: number; // Endurance (60-70%, roughly 120-140)
    zone3: number; // Tempo (70-80%, roughly 140-160)
    zone4: number; // Threshold (80-90%, roughly 160-175)
    zone5: number; // VO2 Max (> 90%, roughly > 175)
  };
}

async function getAccessToken(): Promise<string> {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const refreshToken = process.env.STRAVA_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing required Strava environment variables');
  }

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
    throw new Error(`Strava token refresh failed: ${response.status}`);
  }

  const data = await response.json();
  if (!data?.access_token) {
    throw new Error('Failed to get access token from Strava');
  }

  return data.access_token as string;
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
  return `strava-activity-streams-${activityId}`;
}

async function getCachedMetrics(activityId: string): Promise<HRMetrics | null> {
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
    console.error('Error reading streams from cache:', error);
    return null;
  }
}

async function cacheMetrics(activityId: string, metrics: HRMetrics): Promise<void> {
  try {
    const client = await tryGetRedisClient();
    if (!client) return;
    
    const cacheKey = getCacheKey(activityId);
    await client.set(cacheKey, JSON.stringify(metrics), { EX: 60 * 60 }); // 1 hour TTL
  } catch (error) {
    console.error('Error writing streams to cache:', error);
  }
}

function calculateHRMetrics(hrData: number[], timeData: number[]): HRMetrics {
  if (!hrData || !timeData || hrData.length === 0 || timeData.length === 0) {
    return {
      timeBelowThreshold: 0,
      timeAboveThreshold: 0,
      totalTime: 0,
      avgHR: 0,
      maxHR: 0,
      minHR: 0,
      zoneDistribution: { zone1: 0, zone2: 0, zone3: 0, zone4: 0, zone5: 0 }
    };
  }

  let timeBelowThreshold = 0;
  let timeAboveThreshold = 0;
  const zoneDistribution = { zone1: 0, zone2: 0, zone3: 0, zone4: 0, zone5: 0 };
  
  let hrSum = 0;
  let maxHR = 0;
  let minHR = Infinity;

  for (let i = 0; i < hrData.length; i++) {
    const hr = hrData[i];
    hrSum += hr;
    if (hr > maxHR) maxHR = hr;
    if (hr < minHR) minHR = hr;
    
    // Calculate time delta (use 1 second if first point or timeData not aligned)
    const timeDelta = i > 0 ? timeData[i] - timeData[i - 1] : 1;
    
    // Time below/above threshold
    if (hr < AEROBIC_THRESHOLD) {
      timeBelowThreshold += timeDelta;
    } else {
      timeAboveThreshold += timeDelta;
    }
    
    // Zone distribution (user's custom HR zones)
    // Z1 (Recovery): 0-132
    // Z2 (Aerobic): 132-151
    // Z3 (Tempo): 151-160
    // Z4 (Threshold): 160-178
    // Z5 (VO2 Max): 179+
    if (hr < 132) {
      zoneDistribution.zone1 += timeDelta;
    } else if (hr < 151) {
      zoneDistribution.zone2 += timeDelta;
    } else if (hr < 160) {
      zoneDistribution.zone3 += timeDelta;
    } else if (hr < 179) {
      zoneDistribution.zone4 += timeDelta;
    } else {
      zoneDistribution.zone5 += timeDelta;
    }
  }

  const totalTime = timeData.length > 0 ? timeData[timeData.length - 1] : 0;
  const avgHR = hrData.length > 0 ? Math.round(hrSum / hrData.length) : 0;

  return {
    timeBelowThreshold,
    timeAboveThreshold,
    totalTime,
    avgHR,
    maxHR,
    minHR: minHR === Infinity ? 0 : minHR,
    zoneDistribution
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('=== Starting activity streams request ===');
  
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({
        metrics: null,
        activityId: null,
        error: 'Activity ID is required'
      });
    }

    // Check cache first
    const cachedMetrics = await getCachedMetrics(id);
    if (cachedMetrics) {
      console.log(`Returning cached HR metrics for activity ${id}`);
      return NextResponse.json({
        metrics: cachedMetrics,
        cached: true,
        activityId: id
      });
    }

    // Fetch HR stream from Strava API
    console.log(`Fetching HR stream for activity ${id}...`);
    const accessToken = await getAccessToken();
    
    const query = new URLSearchParams({
      keys: 'heartrate,time',
      key_by_type: 'true',
    });
    const response = await fetch(
      `${STRAVA_API_URL}/activities/${id}/streams?${query}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) {
      throw new Error(`Strava streams fetch failed: ${response.status}`);
    }

    const streams = (await response.json()) as
      | StreamData[]
      | Record<string, { data: number[] }>;
    console.log(`Raw streams response for activity ${id}:`, JSON.stringify(streams).substring(0, 500));

    // Extract HR and time data
    let hrData: number[] = [];
    let timeData: number[] = [];

    // Handle both response formats:
    // 1. key_by_type=true returns: { heartrate: { data: [...] }, time: { data: [...] } }
    // 2. key_by_type=false returns: [{ type: 'heartrate', data: [...] }, { type: 'time', data: [...] }]
    if (streams && typeof streams === 'object' && !Array.isArray(streams)) {
      // Object format (key_by_type=true)
      const streamObj = streams as Record<string, { data: number[] }>;
      if (streamObj.heartrate?.data) hrData = streamObj.heartrate.data;
      if (streamObj.time?.data) timeData = streamObj.time.data;
    } else if (Array.isArray(streams)) {
      // Array format (key_by_type=false)
      const hrStream = streams.find(s => s.type === 'heartrate');
      const timeStream = streams.find(s => s.type === 'time');
      
      if (hrStream?.data) hrData = hrStream.data;
      if (timeStream?.data) timeData = timeStream.data;
    }

    console.log(`HR data points: ${hrData.length}, Time data points: ${timeData.length}`);

    if (hrData.length === 0) {
      console.log(`No HR stream data available for activity ${id}`);
      return NextResponse.json({
        metrics: null,
        cached: false,
        activityId: id,
        error: 'No heart rate stream data available for this activity'
      });
    }

    // Calculate metrics
    const metrics = calculateHRMetrics(hrData, timeData);
    console.log(`Calculated metrics for activity ${id}:`, metrics);

    // Cache the results
    await cacheMetrics(id, metrics);

    return NextResponse.json({
      metrics,
      cached: false,
      activityId: id
    });
  } catch (error) {
    console.error('Error fetching activity streams:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({
      metrics: null,
      cached: false,
      activityId: null,
      error: errorMessage
    });
  }
}
