import { useEffect } from 'react'
import { Stack } from 'expo-router';
import NetInfo from '@react-native-community/netinfo';
import { syncChecklists } from '../services/ApiService';


export default function RootLayout() {
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        syncChecklists();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="Detail" options={{headerShown: false }} />
      <Stack.Screen name="ChecklistFormScreen" options={{ headerShown: false }} />
    </Stack>
  );
}


