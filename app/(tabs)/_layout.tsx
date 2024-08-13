import 'react-native-get-random-values';
import { Tabs } from 'expo-router';


export default function TabsLayout() {
  return (
    <>
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="ChecklistListScreen" options={{ title: 'Checklists' }} />
    </Tabs>
    
    </>
  );
}

