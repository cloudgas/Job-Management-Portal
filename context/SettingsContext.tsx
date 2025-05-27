import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SettingsContextType {
  partsApiUrl: string;
  labourApiUrl: string;
  isLoading: boolean;
  error: string | null;
  updatePartsApiUrl: (url: string) => Promise<void>;
  updateLabourApiUrl: (url: string) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

const DEFAULT_PARTS_API_URL = 'https://example.com/api/parts';
const DEFAULT_LABOUR_API_URL = 'https://example.com/api/labour';

// In-memory storage as a fallback
let inMemoryStorage = {
  partsApiUrl: DEFAULT_PARTS_API_URL,
  labourApiUrl: DEFAULT_LABOUR_API_URL
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [partsApiUrl, setPartsApiUrl] = useState<string>(inMemoryStorage.partsApiUrl);
  const [labourApiUrl, setLabourApiUrl] = useState<string>(inMemoryStorage.labourApiUrl);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Simulate loading settings
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Update parts API URL
  const updatePartsApiUrl = async (url: string) => {
    try {
      setError(null);
      inMemoryStorage.partsApiUrl = url;
      setPartsApiUrl(url);
      return Promise.resolve();
    } catch (error) {
      console.error('Error saving parts API URL:', error);
      setError('Failed to save parts API URL.');
      return Promise.reject(error);
    }
  };

  // Update labour API URL
  const updateLabourApiUrl = async (url: string) => {
    try {
      setError(null);
      inMemoryStorage.labourApiUrl = url;
      setLabourApiUrl(url);
      return Promise.resolve();
    } catch (error) {
      console.error('Error saving labour API URL:', error);
      setError('Failed to save labour API URL.');
      return Promise.reject(error);
    }
  };

  // Reset to default values
  const resetToDefaults = async () => {
    try {
      setError(null);
      inMemoryStorage = {
        partsApiUrl: DEFAULT_PARTS_API_URL,
        labourApiUrl: DEFAULT_LABOUR_API_URL
      };
      setPartsApiUrl(DEFAULT_PARTS_API_URL);
      setLabourApiUrl(DEFAULT_LABOUR_API_URL);
      return Promise.resolve();
    } catch (error) {
      console.error('Error resetting settings:', error);
      setError('Failed to reset settings.');
      return Promise.reject(error);
    }
  };

  const value = {
    partsApiUrl,
    labourApiUrl,
    isLoading,
    error,
    updatePartsApiUrl,
    updateLabourApiUrl,
    resetToDefaults,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};