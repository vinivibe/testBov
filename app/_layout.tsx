import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      {/* Define a rota principal de tabs */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* Define rotas de outras telas que não fazem parte do tabs */}
      <Stack.Screen name="Detail" options={{ title: 'Detalhes do Checklist' }} />
      <Stack.Screen name="ChecklistFormScreen" options={{ title: 'Formulário do Checklist' }} />
    </Stack>
  );
}


