import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@vercel/edge-config';

const INITIAL_STATS = { distance: '394km', lastUpdated: new Date(0).toISOString() };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const edge = createClient(process.env.EDGE_CONFIG);
    const stats = await edge.get('strava_stats') || INITIAL_STATS;
    return res.status(200).json(stats);
  } catch (error) {
    console.error('Error reading Strava stats:', error);
    return res.status(200).json(INITIAL_STATS);
  }
} 