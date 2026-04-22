import { parseAndConvertDistance, parseAndConvertElevation } from '../utils/unitConversion';

const TEMPORARY_DISTANCE_OVERRIDE = '407km';
const TEMPORARY_ELEVATION_OVERRIDE = '8500m';

interface RunningStats {
  distance: string;
  elevation: string;
}

async function fetchStravaStats(): Promise<{ distance?: string; elevation?: string; lastKnownGoodDistance?: string; lastKnownGoodElevation?: string } | null> {
  try {
    const response = await fetch('/api/strava/stats');

    if (!response.ok) {
      console.error('API response not ok:', response.status, response.statusText);
      return null;
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Response is not JSON, got:', contentType);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching Strava stats:', error);
    return null;
  }
}

export async function getYTDRunningStats(): Promise<RunningStats> {
  const stats = await fetchStravaStats();

  const rawDistance = stats?.distance || stats?.lastKnownGoodDistance || TEMPORARY_DISTANCE_OVERRIDE;
  const rawElevation = stats?.elevation || stats?.lastKnownGoodElevation || TEMPORARY_ELEVATION_OVERRIDE;

  return {
    distance: parseAndConvertDistance(rawDistance),
    elevation: parseAndConvertElevation(rawElevation),
  };
}

// Kept for backwards compatibility with any other callers.
export async function getYTDRunningDistance(): Promise<string> {
  const { distance } = await getYTDRunningStats();
  return distance;
}
