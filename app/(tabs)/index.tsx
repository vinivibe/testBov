import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchChecklistsFromAPI, syncChecklists } from '../../services/ApiService';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  const [greeting, setGreeting] = useState('');
  const [checklists, setChecklists] = useState([]);
  const [totalMilk, setTotalMilk] = useState(0);
  const [totalCows, setTotalCows] = useState(0);
  const [supervisedCount, setSupervisedCount] = useState(0);

  useEffect(() => {
    // Definir saudação com base na hora do dia
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Bom dia');
    } else if (hour < 18) {
      setGreeting('Boa tarde');
    } else {
      setGreeting('Boa noite');
    }

    // Carregar checklists da API
    loadChecklists();
  }, []);

  const loadChecklists = async () => {
    try {
      const data = await fetchChecklistsFromAPI();
      setChecklists(data);
      calculateSummaries(data);
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
      milk += item.amount_of_milk_produced;
      cows += item.number_of_cows_head;
      if (item.had_supervision) supervised += 1;
    });

    setTotalMilk(Math.round(milk));  
    setTotalCows(Math.round(cows));  
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
        <Text style={styles.sectionTitle}>Checklists Recentes</Text>
        <FlatList
          data={checklists.slice(0, 5)}  // Limita aos 5 checklists mais recentes
          keyExtractor={(item) => item._id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/ChecklistDetailScreen/${item._id}`)}
            >
              <Image source={require('@/assets/images/farm-placeholder.png')} style={styles.cardImage} />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.farmer.name}</Text>
                <Text style={styles.cardSubtitle}>{item.farmer.city}</Text>
                <Text style={styles.cardDate}>Criado em: {new Date(item.created_at).toLocaleDateString()}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
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
    flexBasis: '45%',  // Ajusta a largura dos cartões para uma melhor distribuição
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#777',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 12,
    color: '#AAA',
  },
});




