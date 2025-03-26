import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  try {
    const tokens = await exchangeCodeForTokens(code as string);
    // Store tokens securely (we'll implement this next)
    await storeTokens(tokens);
    
    res.redirect('/'); // Redirect back to home page
  } catch (error) {
    console.error('Strava auth error:', error);
    res.redirect('/error?message=auth_failed');
  }
} 