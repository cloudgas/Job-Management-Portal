
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsContextType {
  partsApiUrl: string;
  labourApiUrl: string;
  isLoading: boolean;
  updatePartsApiUrl: (url: string) => Promise<void>;
  updateLabourApiUrl: (url: string) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

const DEFAULT_PARTS_API_URL = 'https://example.com/api/parts';
const DEFAULT_LABOUR_API_URL = 'https://example.com/api/labour';

const STORAGE_KEYS = {
  PARTS_API_URL: 'settings_parts_api_url',
  LABOUR_API_URL: 'settings_labour_api_url',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [partsApiUrl, setPartsApiUrl] = useState<string>(DEFAULT_PARTS_API_URL);
  const [labourApiUrl, setLabourApiUrl] = useState<string>(DEFAULT_LABOUR_API_URL);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load settings from AsyncStorage on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const storedPartsUrl = await AsyncStorage.getItem(STORAGE_KEYS.PARTS_API_URL);
        const storedLabourUrl = await AsyncStorage.getItem(STORAGE_KEYS.LABOUR_API_URL);

        if (storedPartsUrl) setPartsApiUrl(storedPartsUrl);
        if (storedLabourUrl) setLabourApiUrl(storedLabourUrl);
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Update parts API URL
  const updatePartsApiUrl = async (url: string) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PARTS_API_URL, url);
      setPartsApiUrl(url);
    } catch (error) {
      console.error('Error saving parts API URL:', error);
      throw error;
    }
  };

  // Update labour API URL
  const updateLabourApiUrl = async (url: string) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LABOUR_API_URL, url);
      setLabourApiUrl(url);
    } catch (error) {
      console.error('Error saving labour API URL:', error);
      throw error;
    }
  };

  // Reset to default values
  const resetToDefaults = async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.PARTS_API_URL,
        STORAGE_KEYS.LABOUR_API_URL,
      ]);
      setPartsApiUrl(DEFAULT_PARTS_API_URL);
      setLabourApiUrl(DEFAULT_LABOUR_API_URL);
    } catch (error) {
      console.error('Error resetting settings:', error);
      throw error;
    }
  };

  const value = {
    partsApiUrl,
    labourApiUrl,
    isLoading,
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
