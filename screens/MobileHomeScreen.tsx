import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useBasic } from '@basictech/expo';
import SettingsModal from '../components/SettingsModal';

const MobileHomeScreen: React.FC = () => {
  const { isSignedIn, login } = useBasic();
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Job History Tracker</Text>
        <Text style={styles.subtitle}>Track and manage job history for your clients</Text>
        
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => setIsSettingsModalVisible(true)}
        >
          <Ionicons name="settings-outline" size={22} color="#333" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        {isSignedIn ? (
          <Text style={styles.message}>Mobile version loaded successfully!</Text>
        ) : (
          <View style={styles.loginContainer}>
            <Text style={styles.message}>Please sign in to continue</Text>
            <TouchableOpacity style={styles.loginButton} onPress={login}>
              <Text style={styles.loginButtonText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      <SettingsModal 
        isVisible={isSettingsModalVisible}
        onClose={() => setIsSettingsModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    position: 'relative',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
  settingsButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    padding: 5,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  loginContainer: {
    alignItems: 'center',
  },
  loginButton: {
    backgroundColor: '#333',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 5,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default MobileHomeScreen;
