
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { TabRoute } from '../types';

interface TabViewProps {
  routes: TabRoute[];
  renderScene: (route: TabRoute) => React.ReactNode;
  onIndexChange?: (index: number) => void;
  initialIndex?: number;
}

const TabView: React.FC<TabViewProps> = ({ 
  routes, 
  renderScene, 
  onIndexChange,
  initialIndex = 0
}) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  
  const handleTabPress = (index: number) => {
    setActiveIndex(index);
    if (onIndexChange) {
      onIndexChange(index);
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {routes.map((route, index) => (
          <TouchableOpacity
            key={route.key}
            style={[
              styles.tabItem,
              activeIndex === index && styles.activeTabItem
            ]}
            onPress={() => handleTabPress(index)}
          >
            <Text 
              style={[
                styles.tabText,
                activeIndex === index && styles.activeTabText
              ]}
            >
              {route.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.sceneContainer}>
        {renderScene(routes[activeIndex])}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabItem: {
    borderBottomColor: '#333',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#333',
    fontWeight: '600',
  },
  sceneContainer: {
    flex: 1,
  },
});

export default TabView;
