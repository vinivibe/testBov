import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { fetchChecklistsFromAPI } from '../../services/ApiService'; 
import { getChecklists, realm } from '../../services/RealmService';

const ChecklistListScreen = () => {
  const router = useRouter();
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);

  // Função para carregar os checklists
  const loadChecklists = useCallback(async () => {
    try {
      setLoading(true); 
      await fetchChecklists(); 
    } catch (error) {
      console.error('Erro ao carregar checklists:', error);
    } finally {
      setLoading(false); 
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadChecklists(); // Carrega os checklists quando a tela ganha foco

      const checklistsData = getChecklists();
      setChecklists([...checklistsData]);

      const realmListener = () => {
        setChecklists([...getChecklists()]);
      };

      checklistsData.addListener(realmListener);

      return () => {
        checklistsData.removeListener(realmListener);
      };
    }, [loadChecklists])
  );

  const fetchChecklists = async () => {
    try {
      const apiChecklists = await fetchChecklistsFromAPI();
      const apiChecklistsWithSync = apiChecklists.map(cl => ({ ...cl, synced: true }));
      
      const localChecklists = getChecklists();
      
      const combinedChecklists = localChecklists.map(localChecklist => {
        const isSynced = apiChecklistsWithSync.some(apiChecklist => apiChecklist._id === localChecklist._id);
        return {
          ...localChecklist,
          synced: isSynced,
        };
      });

      const finalChecklists = [
        ...combinedChecklists,
        ...apiChecklistsWithSync.filter(apiChecklist => !combinedChecklists.some(cl => cl._id === apiChecklist._id)),
      ];

      setChecklists(finalChecklists);
    } catch (error) {
      console.error('Erro ao buscar checklists:', error);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => router.push(`/ChecklistDetailScreen/${item._id}`)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.farmer.name} - {item.farmer.city}</Text>
        <Ionicons 
          name={item.synced ? "cloud-done-outline" : "cloud-offline-outline"} 
          size={24} 
          color={item.synced ? "#4CAF50" : "#FF5722"} 
        />
      </View>
      <Text style={styles.cardSubtitle}>Fazenda: {item.farmer.name}</Text>
      <Text style={styles.cardSubtitle}>Criado em: {new Date(item.created_at).toLocaleDateString()}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={checklists}
        keyExtractor={item => item._id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => router.push('/ChecklistFormScreen')}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default ChecklistListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#4CAF50',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});




