import { getRedisClient } from '../../utils/redis';
import axios from 'axios';

interface StravaTokens {
  access_token: string;
  refresh_token: string; 
  expires_at: number;
}

const STRAVA_TOKENS_KEY = 'strava_tokens';

export async function storeTokens(tokens: StravaTokens) {
  const client = await getRedisClient();
  await client.set(STRAVA_TOKENS_KEY, JSON.stringify(tokens));
}

export async function getValidToken(): Promise<string> {
  const client = await getRedisClient();
  const tokensStr = await client.get(STRAVA_TOKENS_KEY);
  const tokens = tokensStr ? JSON.parse(tokensStr as string) as StravaTokens : null;
  
  if (!tokens) {
    throw new Error('No tokens found');
  }

  // Check if token needs refresh (5 minute buffer)
  if (Date.now() >= (tokens.expires_at - 300) * 1000) {
    const newTokens = await refreshTokens(tokens.refresh_token);
    await storeTokens(newTokens);
    return newTokens.access_token;
  }

  return tokens.access_token;
}

async function refreshTokens(refresh_token: string): Promise<StravaTokens> {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Missing required Strava environment variables: STRAVA_CLIENT_ID or STRAVA_CLIENT_SECRET');
  }

  const response = await axios.post<StravaTokens>(
    'https://www.strava.com/oauth/token',
    {
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refresh_token,
      grant_type: 'refresh_token'
    }
  );
  
  if (!response.data?.access_token || !response.data?.refresh_token) {
    throw new Error('Invalid response from Strava token endpoint: missing required tokens');
  }
  
  return response.data;
}
