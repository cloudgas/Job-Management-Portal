import React, { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Dimensions, View, Text, ActivityIndicator } from 'react-native';
import { BasicProvider } from '@basictech/expo';
import { schema } from './basic.config';
import { SettingsProvider } from './context/SettingsContext';

// Import our screens
import HomeScreen from './screens/HomeScreen';
import MobileHomeScreen from './screens/MobileHomeScreen';

export default function App() {
  const [isLargeScreen, setIsLargeScreen] = useState(
    Dimensions.get('window').width >= 768
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set up dimension change listener
    const updateLayout = () => {
      setIsLargeScreen(Dimensions.get('window').width >= 768);
    };

    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    Dimensions.addEventListener('change', updateLayout);

    return () => {
      clearTimeout(timer);
      // Clean up
    };
  }, []);

  // Error handling
  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: 'red' }}>
          Error
        </Text>
        <Text style={{ textAlign: 'center', marginBottom: 20 }}>{error}</Text>
      </View>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#333" />
        <Text style={{ marginTop: 20 }}>Loading Job History Tracker...</Text>
      </View>
    );
  }

  // Main app
  return (
    <SafeAreaProvider>
      <BasicProvider project_id={schema.project_id} schema={schema}>
        <SettingsProvider>
          <StatusBar style="dark" />
          {isLargeScreen ? <HomeScreen /> : <MobileHomeScreen />}
        </SettingsProvider>
      </BasicProvider>
    </SafeAreaProvider>
  );
}
