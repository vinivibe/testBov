import 'react-native-get-random-values';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { setupSyncListener } from '../../services/RealmService';

export default function TabsLayout() {
  useEffect(() => {
    setupSyncListener();
  }, []);

  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="ChecklistListScreen"
        options={{
          title: 'Checklists',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}



