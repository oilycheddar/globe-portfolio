import type { NextApiRequest, NextApiResponse } from 'next';
import { storeTokens } from '../../../../lib/auth/tokens';

interface StravaTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

async function exchangeCodeForTokens(code: string): Promise<StravaTokens> {
  const response = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    throw new Error(`Strava code exchange failed: ${response.status}`);
  }

  return (await response.json()) as StravaTokens;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Validate HTTP method
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.query;

  // Validate code parameter - ensure it's a string and not an array
  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  // Ensure code is a string (query params can be arrays)
  const codeString = Array.isArray(code) ? code[0] : code;
  
  if (typeof codeString !== 'string' || codeString.trim().length === 0) {
    return res.status(400).json({ error: 'Invalid authorization code format' });
  }

  try {
    const tokens = await exchangeCodeForTokens(codeString);
    await storeTokens(tokens);
    
    res.redirect('/');
  } catch (error) {
    console.error('Strava auth error:', error);
    res.redirect('/error?message=auth_failed');
  }
} 