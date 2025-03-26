import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { storeTokens } from '../../../../lib/auth/tokens';

interface StravaTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

async function exchangeCodeForTokens(code: string): Promise<StravaTokens> {
  const response = await axios.post<StravaTokens>(
    'https://www.strava.com/oauth/token',
    {
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code'
    }
  );
  return response.data;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  try {
    const tokens = await exchangeCodeForTokens(code as string);
    await storeTokens(tokens);
    
    res.redirect('/');
  } catch (error) {
    console.error('Strava auth error:', error);
    res.redirect('/error?message=auth_failed');
  }
} 