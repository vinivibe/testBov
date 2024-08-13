import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchChecklistsFromAPI, syncChecklists } from '../../services/ApiService';
import { useRouter } from 'expo-router';
import { getChecklists } from '../../services/RealmService';

export default function HomeScreen() {
  const router = useRouter();
  const [greeting, setGreeting] = useState('');
  const [checklists, setChecklists] = useState([]);
  const [unsyncedChecklists, setUnsyncedChecklists] = useState([]);
  const [totalMilk, setTotalMilk] = useState(0);
  const [totalCows, setTotalCows] = useState(0);
  const [supervisedCount, setSupervisedCount] = useState(0);

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite');
    loadChecklists();
  }, []);

  const loadChecklists = async () => {
    try {
      const data = await fetchChecklistsFromAPI();
      setChecklists(data);
      calculateSummaries(data);

      // Carregar checklists não sincronizados do Realm
      const localChecklists = getChecklists().filtered('unsynced == true');
      setUnsyncedChecklists(localChecklists);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os checklists.');
      console.error('Erro ao carregar checklists:', error);
    }
  };

  const calculateSummaries = (data) => {
    let milk = 0;
    let cows = 0;
    let supervised = 0;

    data.forEach(item => {
      milk += item.amount_of_milk_produced || 0;
      cows += item.number_of_cows_head || 0;
      if (item.had_supervision) supervised += 1;
    });

    setTotalMilk(milk.toFixed(2));  // Corrigido para exibir corretamente como número
    setTotalCows(cows);
    setSupervisedCount(supervised);
  };

  const syncLocalChecklists = async () => {
    try {
      await syncChecklists();
      loadChecklists(); // Recarregar após sincronizar
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível sincronizar os checklists.');
      console.error('Erro ao sincronizar checklists:', error);
    }
  };

  const renderUnsyncedList = () => {
    if (unsyncedChecklists.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <Image source={require('@/assets/images/empty.png')} style={styles.emptyStateImage} />
          <Text style={styles.emptyStateText}>Todos os checklists estão sincronizados.</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={unsyncedChecklists}
        keyExtractor={(item) => item._id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.unsyncedCard}
            onPress={() => router.push(`/ChecklistDetailScreen/${item._id}`)}
          >
            <Ionicons name="cloud-offline-outline" size={24} color="#FF5722" />
            <View style={styles.unsyncedCardContent}>
              <Text style={styles.unsyncedCardTitle}>{item.farmer.name}</Text>
              <Text style={styles.unsyncedCardSubtitle}>{item.farmer.city}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>{greeting},</Text>
          <Text style={styles.headerTitle}>BovControl</Text>
        </View>
        <TouchableOpacity style={styles.syncButton} onPress={syncLocalChecklists}>
          <Ionicons name="sync" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.overview}>
        <View style={styles.overviewCard}>
          <Ionicons name="document-text-outline" size={32} color="#4CAF50" />
          <Text style={styles.overviewNumber}>{checklists.length}</Text>
          <Text style={styles.overviewLabel}>Checklists Criados</Text>
        </View>
        <View style={styles.overviewCard}>
          <Ionicons name="water-outline" size={32} color="#4CAF50" />
          <Text style={styles.overviewNumber}>{totalMilk}</Text>
          <Text style={styles.overviewLabel}>Total de Leite Produzido (L)</Text>
        </View>
        <View style={styles.overviewCard}>
          <Ionicons name="people-outline" size={32} color="#4CAF50" />
          <Text style={styles.overviewNumber}>{totalCows}</Text>
          <Text style={styles.overviewLabel}>Total de Gado</Text>
        </View>
        <View style={styles.overviewCard}>
          <Ionicons name="checkmark-circle-outline" size={32} color="#4CAF50" />
          <Text style={styles.overviewNumber}>{supervisedCount}</Text>
          <Text style={styles.overviewLabel}>Supervisionados</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Checklists Não Sincronizados</Text>
        {renderUnsyncedList()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingTop: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerContent: {
    flexDirection: 'column',
  },
  greeting: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  syncButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 50,
  },
  overview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  overviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexBasis: '45%', 
  },
  overviewNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 8,
  },
  overviewLabel: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  unsyncedCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  unsyncedCardContent: {
    marginLeft: 12,
  },
  unsyncedCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  unsyncedCardSubtitle: {
    fontSize: 14,
    color: '#777',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  emptyStateImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#777',
  },
});

export default HomeScreen;





