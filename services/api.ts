import { Item } from '../types';
import { useSettings } from '../context/SettingsContext';

const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds
const FETCH_TIMEOUT = 10000; // 10 seconds timeout

interface CacheItem {
  data: Item[];
  timestamp: number;
}

const cache: Record<string, CacheItem> = {
  parts: { data: [], timestamp: 0 },
  labour: { data: [], timestamp: 0 },
};

// Helper function to add timeout to fetch
const fetchWithTimeout = async (url: string, options = {}, timeout = FETCH_TIMEOUT): Promise<Response> => {
  const controller = new AbortController();
  const { signal } = controller;
  
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);
  
  try {
    const response = await fetch(url, { ...options, signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

const fetchWithRetry = async (url: string, retries = 3): Promise<Response> => {
  let lastError;
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetchWithTimeout(url);
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      return response;
    } catch (error: any) {
      console.warn(`Fetch attempt ${i + 1} failed:`, error.message || 'Unknown error');
      lastError = error;
      
      // Don't retry if it was aborted (timeout) or if it's the last attempt
      if (error.name === 'AbortError' || i === retries - 1) {
        break;
      }
      
      // Wait a bit before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
  
  throw lastError || new Error('Failed to fetch after multiple attempts');
};

export const useFetchParts = () => {
  const { partsApiUrl } = useSettings();
  
  const fetchParts = async (): Promise<{ data: Item[], fromCache: boolean, error?: string }> => {
    const now = Date.now();
    
    // Return cached data if it's still valid
    if (cache.parts.data.length > 0 && now - cache.parts.timestamp < CACHE_EXPIRY) {
      return { data: cache.parts.data, fromCache: true };
    }
    
    try {
      const response = await fetchWithRetry(partsApiUrl);
      const data = await response.json();
      
      // Update cache
      cache.parts = {
        data,
        timestamp: now,
      };
      
      return { data, fromCache: false };
    } catch (error: any) {
      console.error('Error fetching parts:', error);
      
      // Return cached data even if expired in case of error
      if (cache.parts.data.length > 0) {
        return { 
          data: cache.parts.data, 
          fromCache: true, 
          error: `Failed to fetch latest data: ${error.message || 'Network error'}. Showing cached data.` 
        };
      }
      
      // If no cached data, return mock data
      return { 
        data: getMockParts(), 
        fromCache: false, 
        error: `Failed to fetch data: ${error.message || 'Network error'}. Showing sample data.` 
      };
    }
  };
  
  return { fetchParts };
};

export const useFetchLabour = () => {
  const { labourApiUrl } = useSettings();
  
  const fetchLabour = async (): Promise<{ data: Item[], fromCache: boolean, error?: string }> => {
    const now = Date.now();
    
    // Return cached data if it's still valid
    if (cache.labour.data.length > 0 && now - cache.labour.timestamp < CACHE_EXPIRY) {
      return { data: cache.labour.data, fromCache: true };
    }
    
    try {
      const response = await fetchWithRetry(labourApiUrl);
      const data = await response.json();
      
      // Update cache
      cache.labour = {
        data,
        timestamp: now,
      };
      
      return { data, fromCache: false };
    } catch (error: any) {
      console.error('Error fetching labour:', error);
      
      // Return cached data even if expired in case of error
      if (cache.labour.data.length > 0) {
        return { 
          data: cache.labour.data, 
          fromCache: true, 
          error: `Failed to fetch latest data: ${error.message || 'Network error'}. Showing cached data.` 
        };
      }
      
      // If no cached data, return mock data
      return { 
        data: getMockLabour(), 
        fromCache: false, 
        error: `Failed to fetch data: ${error.message || 'Network error'}. Showing sample data.` 
      };
    }
  };
  
  return { fetchLabour };
};

// Helper function to validate URL
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

// Mock data for testing or when API is unavailable
const getMockParts = (): Item[] => [
  { id: 'PART001', name: 'Tap Washer', unitPrice: '1.50', category: 'Plumbing' },
  { id: 'PART002', name: 'Compression Elbow (15mm)', unitPrice: '3.75', category: 'Plumbing' },
  { id: 'PART003', name: 'Flexible Hose Connector (12mm)', unitPrice: '7.25', category: 'Plumbing' },
  { id: 'PART004', name: 'Toilet Flush Valve', unitPrice: '15.00', category: 'Plumbing' },
  { id: 'PART005', name: 'Radiator Valve Set', unitPrice: '22.50', category: 'Heating' },
  { id: 'PART006', name: 'Copper Pipe (1 meter, 15mm)', unitPrice: '12.00', category: 'Plumbing' },
  { id: 'PART007', name: 'Pipe Insulation (2 meter)', unitPrice: '5.50', category: 'Heating' },
  { id: 'PART008', name: 'Sink Trap', unitPrice: '8.75', category: 'Plumbing' },
  { id: 'PART009', name: 'Shower Head', unitPrice: '18.99', category: 'Bathroom' },
  { id: 'PART010', name: 'Silicone Sealant', unitPrice: '4.25', category: 'General' },
];

const getMockLabour = (): Item[] => [
  { id: '1', name: 'Tap Replacement', unitPrice: '45.00', category: 'Plumbing' },
  { id: '2', name: 'Pipe Repair', unitPrice: '65.00', category: 'Plumbing' },
  { id: '3', name: 'Toilet Installation', unitPrice: '120.00', category: 'Plumbing' },
  { id: '4', name: 'Radiator Installation', unitPrice: '95.00', category: 'Heating' },
  { id: '5', name: 'Boiler Service', unitPrice: '85.00', category: 'Heating' },
  { id: '6', name: 'Shower Installation', unitPrice: '150.00', category: 'Bathroom' },
  { id: '7', name: 'Drain Unblocking', unitPrice: '75.00', category: 'Plumbing' },
  { id: '8', name: 'Leak Detection', unitPrice: '60.00', category: 'Plumbing' },
  { id: '9', name: 'Emergency Call-Out', unitPrice: '120.00', category: 'General' },
];