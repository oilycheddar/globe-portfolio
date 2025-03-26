import axios from 'axios';

const STRAVA_API_URL = 'https://www.strava.com/api/v3';
const ATHLETE_ID = '42678770'; // From your Strava profile URL

interface StravaStats {
  ytd_run_totals: {
    count: number;
    distance: number;
    moving_time: number;
    elevation_gain: number;
  };
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

const getAccessToken = async (): Promise<string> => {
  try {
    // Debug log
    console.log('Client ID:', process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID);
    console.log('Refresh Token exists:', !!process.env.NEXT_PUBLIC_STRAVA_REFRESH_TOKEN);
    
    const response = await axios.post<TokenResponse>(
      'https://www.strava.com/oauth/token',
      {
        client_id: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        refresh_token: process.env.NEXT_PUBLIC_STRAVA_REFRESH_TOKEN,
        grant_type: 'refresh_token'
      }
    );
    return response.data.access_token;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Strava API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
    }
    throw error;
  }
};

export const getYTDRunningDistance = async (): Promise<string> => {
  try {
    const response = await axios.get('/api/strava-stats');
    return response.data.distance;
  } catch (error) {
    console.error('Error fetching Strava stats:', error);
    return '0km';
  }
}; 