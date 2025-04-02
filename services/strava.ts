import axios from 'axios';
import { getValidToken } from '../lib/auth/tokens';

const STRAVA_API_URL = 'https://www.strava.com/api/v3';
const ATHLETE_ID = '42678770'; // From your Strava profile URL

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

interface CacheData {
  distance: string;
  timestamp: number;
}

// Cache duration of 1 hour
const CACHE_DURATION = 60 * 60 * 1000;
let cache: CacheData = {
  distance: '394km', // Your last known distance
  timestamp: 0
};

const getAccessToken = async (): Promise<string> => {
  try {
    // Debug log
    console.log('Client ID:', process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID);
    console.log('Refresh Token exists:', !!process.env.NEXT_PUBLIC_STRAVA_REFRESH_TOKEN);
    
    const response = await axios.post<TokenResponse>(
      'https://www.strava.com/oauth/token',
      {
        client_id: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        refresh_token: process.env.NEXT_PUBLIC_STRAVA_REFRESH_TOKEN,
        grant_type: 'refresh_token'
      }
    );
    return response.data.access_token;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Strava API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
    }
    throw error;
  }
};

// Get the base URL for API calls
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Browser should use relative path
    return '';
  }
  if (process.env.VERCEL_URL) {
    // Reference for vercel.com
    return `https://${process.env.VERCEL_URL}`;
  }
  // Assume localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
};

const baseUrl = process.env.NODE_ENV === 'production' ? 'https://georgevisan.com' : '';

export const getYTDRunningDistance = async (): Promise<string> => {
  // Check if cache is still valid
  const now = Date.now();
  if (now - cache.timestamp < CACHE_DURATION) {
    return cache.distance;
  }

  try {
    const response = await axios.get(`${baseUrl}/api/strava-stats`);
    // Update cache with new data and timestamp
    cache = {
      distance: response.data.distance,
      timestamp: now
    };
    return cache.distance;
  } catch (error) {
    console.error('Error fetching Strava stats:', error);
    // Return cached value even if expired
    return cache.distance;
  }
}; 