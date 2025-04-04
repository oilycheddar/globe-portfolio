import { NextResponse } from 'next/server';
import { getStravaStats } from '../../../../utils/strava-redis';

export async function GET() {
  try {
    const stats = await getStravaStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching Strava stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
} 