import { useState, useEffect } from 'react';

export function useStravaDistance() {
  const [distance, setDistance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDistance = async () => {
      try {
        const response = await fetch('/api/strava/distance');
        if (!response.ok) {
          throw new Error('Failed to fetch running distance');
        }
        const data = await response.json();
        setDistance(data.distance);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDistance();
  }, []);

  return { distance, loading, error };
} 