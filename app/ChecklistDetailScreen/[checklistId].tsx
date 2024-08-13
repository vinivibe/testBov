import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getChecklistById as getChecklistFromRealm, deleteChecklist, markSynced, updateChecklist } from '../../services/RealmService';
import { syncSingleChecklist, getChecklistById as getChecklistFromAPI, updateChecklist as updateChecklistAPI } from '../../services/ApiService';

const ChecklistDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { checklistId } = route.params || {};
  const [checklist, setChecklist] = useState(null);

  useEffect(() => {
    fetchChecklistData(checklistId);
  }, [checklistId]);

  const fetchChecklistData = async (id) => {
    try {
      let data = getChecklistFromRealm(id);
      
      if (!data) {
        data = await getChecklistFromAPI(id);
      }

      if (data) {
        setChecklist(data);
      } else {
        Alert.alert('Erro', 'Não foi possível carregar os detalhes do checklist.');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Erro ao buscar os detalhes do checklist:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao carregar os detalhes do checklist.');
      navigation.goBack();
    }
  };

  const handleEdit = () => {
    navigation.navigate('ChecklistFormScreen', { checklistId });
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmação',
      'Tem certeza de que deseja excluir este checklist?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', onPress: () => deleteChecklistAction() },
      ],
      { cancelable: true }
    );
  };

  const deleteChecklistAction = () => {
    deleteChecklist(checklistId);
    Alert.alert('Sucesso', 'Checklist excluído com sucesso!');
    navigation.goBack();
  };

  const handleSync = async () => {
    try {
      await syncSingleChecklist(checklist); 
      Alert.alert('Sucesso', 'Checklist sincronizado com sucesso!');
      fetchChecklistData(checklistId); 
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível sincronizar o checklist.');
      console.error('Erro ao sincronizar checklist:', error);
    }
  };

  if (!checklist) {
    return <Text>Carregando...</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Checklist</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={handleEdit} style={styles.iconButton}>
            <Ionicons name="create-outline" size={28} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
            <Ionicons name="trash-outline" size={28} color="#ff3333" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <DetailItem label="Fazendeiro" value={checklist.farmer.name} />
        <DetailItem label="Fazenda" value={checklist.from.name} />
        <DetailItem label="Cidade" value={checklist.farmer.city} />
        <DetailItem label="Supervisor" value={checklist.to.name} />
        <DetailItem label="Tipo" value={checklist.type} />
        <DetailItem label="Produção de Leite (L)" value={checklist.amount_of_milk_produced} />
        <DetailItem label="Número de Gado" value={checklist.number_of_cows_head} />
        <DetailItem label="Supervisionado" value={checklist.had_supervision ? 'Sim' : 'Não'} />
        <DetailItem label="Criado em" value={new Date(checklist.created_at).toLocaleDateString()} />
        <DetailItem label="Atualizado em" value={new Date(checklist.updated_at).toLocaleDateString()} />
      </View>

      {!checklist.synced && (
        <TouchableOpacity style={styles.syncButton} onPress={handleSync}>
          <Ionicons name="cloud-upload-outline" size={24} color="#fff" />
          <Text style={styles.syncButtonText}>Sincronizar Checklist</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const DetailItem = ({ label, value }) => (
  <View style={styles.detailItem}>
    <Text style={styles.detailLabel}>{label}:</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 16,
  },
  detailsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  detailValue: {
    fontSize: 16,
    color: '#555',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  syncButtonText: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});

export default ChecklistDetailScreen;






