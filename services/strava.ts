import axios from 'axios';

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
let lastKnownDistance = '394km';

const shouldFetchNewData = (lastUpdated: string): boolean => {
  const now = new Date();
  const lastUpdateTime = new Date(lastUpdated);
  const hoursMST = (now.getUTCHours() - 7 + 24) % 24; // Convert to MST, handle negative hours
  
  // Check if we're in update windows (9-10am or 6-7pm MST)
  const isUpdateWindow = (hoursMST >= 9 && hoursMST < 10) || (hoursMST >= 18 && hoursMST < 19);
  
  // Check if last update was >12 hours ago
  const hoursSinceUpdate = (now.getTime() - lastUpdateTime.getTime()) / (1000 * 60 * 60);
  
  return isUpdateWindow && hoursSinceUpdate >= 12;
}

export const getYTDRunningDistance = async (): Promise<string> => {
  try {
    // First, get current stats
    const statsResponse = await axios.get(`${baseUrl}/api/strava-stats`);
    const { distance, lastUpdated } = statsResponse.data;
    
    // Update our last known good value
    lastKnownDistance = distance;
    
    // Check if we should fetch new data
    if (shouldFetchNewData(lastUpdated)) {
      // Trigger an update
      const updateResponse = await axios.post(`${baseUrl}/api/update-strava`);
      if (updateResponse.data.distance) {
        lastKnownDistance = updateResponse.data.distance;
        return updateResponse.data.distance;
      }
    }
    
    return distance;
  } catch (error) {
    console.error('Error fetching Strava stats:', error);
    return lastKnownDistance;
  }
}; 