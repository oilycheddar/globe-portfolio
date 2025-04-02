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

let lastKnownDistance = '395km'; // Initial fallback, will be updated after successful fetches

export const getYTDRunningDistance = async (): Promise<string> => {
  try {
    const response = await axios.get(`${baseUrl}/api/strava-stats`);
    // Update our last known distance when we get a successful response
    lastKnownDistance = response.data.distance;
    return response.data.distance;
  } catch (error) {
    console.error('Error fetching Strava stats:', error);
    return lastKnownDistance; // Return last known good value
  }
}; 