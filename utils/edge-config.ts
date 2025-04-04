import { createClient } from '@vercel/edge-config';

interface EdgeConfigItem {
  key: string;
  value: any;
}

/**
 * Reads a value from Edge Config using the SDK
 * @param key The key to read from Edge Config
 * @returns The value associated with the key, or null if not found
 */
export async function readFromEdgeConfig<T>(key: string): Promise<T | null> {
  if (!process.env.EDGE_CONFIG) {
    console.error('EDGE_CONFIG environment variable is not set');
    return null;
  }

  try {
    const edge = createClient(process.env.EDGE_CONFIG);
    const value = await edge.get<T>(key);
    return value ?? null;
  } catch (error) {
    console.error(`Error reading from Edge Config: ${error}`);
    return null;
  }
}

/**
 * Updates a value in Edge Config using the REST API
 * @param items Array of items to update in Edge Config
 * @returns True if successful, false otherwise
 */
export async function writeToEdgeConfig(items: EdgeConfigItem[]): Promise<boolean> {
  if (!process.env.EDGE_CONFIG) {
    console.error('EDGE_CONFIG environment variable is not set');
    return false;
  }

  try {
    const response = await fetch(process.env.EDGE_CONFIG, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: items.map(item => ({
          operation: 'update',
          key: item.key,
          value: item.value
        }))
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to update Edge Config: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error(`Error writing to Edge Config: ${error}`);
    return false;
  }
}

/**
 * Updates a single item in Edge Config
 * @param key The key to update
 * @param value The new value
 * @returns True if successful, false otherwise
 */
export async function updateEdgeConfigItem(key: string, value: any): Promise<boolean> {
  return writeToEdgeConfig([{ key, value }]);
} 