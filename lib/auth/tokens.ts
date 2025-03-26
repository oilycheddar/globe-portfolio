import { kv } from '@vercel/kv'; // We'll use Vercel KV for token storage
import axios from 'axios';

interface StravaTokens {
  access_token: string;
  refresh_token: string; 
  expires_at: number;
}

export async function storeTokens(tokens: StravaTokens) {
  await kv.set('strava_tokens', tokens);
}

export async function getValidToken(): Promise<string> {
  const tokens = await kv.get<StravaTokens>('strava_tokens');
  
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
  const response = await axios.post<StravaTokens>(
    'https://www.strava.com/oauth/token',
    {
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: refresh_token,
      grant_type: 'refresh_token'
    }
  );
  return response.data;
}
