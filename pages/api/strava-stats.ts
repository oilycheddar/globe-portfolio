import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const STATS_FILE = path.join(process.cwd(), 'data', 'strava-stats.json');
const INITIAL_STATS = { distance: '394km', lastUpdated: new Date(0).toISOString() };

// Ensure the stats file exists with initial data
if (!fs.existsSync(STATS_FILE)) {
  const dir = path.dirname(STATS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(STATS_FILE, JSON.stringify(INITIAL_STATS, null, 2));
}

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
    // Always read from file - it will exist because we ensure it above
    const stats = JSON.parse(fs.readFileSync(STATS_FILE, 'utf8'));
    return res.status(200).json(stats);
  } catch (error) {
    console.error('Error reading Strava stats:', error);
    // If there's an error reading the file, return initial stats
    return res.status(200).json(INITIAL_STATS);
  }
} 