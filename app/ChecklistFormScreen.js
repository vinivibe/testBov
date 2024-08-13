import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Switch, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import NetInfo from '@react-native-community/netinfo';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { createChecklist as createChecklistInRealm, updateChecklist, getChecklistById } from '../services/RealmService';
import { createChecklist as createChecklistInAPI, updateChecklist as updateChecklistInAPI } from '../services/ApiService';

const ChecklistFormScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { checklistId } = route.params || {};
  const [formData, setFormData] = useState({
    farmerName: '',
    farmCity: '',
    fromName: '',
    toName: '',
    type: '',
    milkProduction: '',
    cattleHeadCount: '',
    supervised: false,
    location: { latitude: 0, longitude: 0 },
  });

  useEffect(() => {
    if (checklistId) {
      fetchChecklistData(checklistId);
    }
    getLocation();
  }, [checklistId]);

  const fetchChecklistData = (id) => {
    const checklist = getChecklistById(id);
    if (checklist) {
      setFormData({
        farmerName: checklist.farmer?.name || '',
        farmCity: checklist.farmer?.city || '',
        fromName: checklist.from?.name || '',
        toName: checklist.to?.name || '',
        type: checklist.type || '',
        milkProduction: checklist.amount_of_milk_produced?.toString() || '',
        cattleHeadCount: checklist.number_of_cows_head?.toString() || '',
        supervised: checklist.had_supervision || false,
        location: checklist.location || { latitude: 0, longitude: 0 },
      });
    }
  };

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão de localização negada');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setFormData((prevData) => ({
        ...prevData,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
      }));
    } catch (error) {
      console.error('Erro ao obter localização:', error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.farmerName || !formData.fromName || !formData.toName || !formData.type) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const generateNumericId = () => {
      const timestamp = Date.now().toString(); 
      const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      return timestamp + randomNum;
    };

    const checklistData = {
      _id: checklistId ? checklistId : generateNumericId(),
      type: formData.type,
      amount_of_milk_produced: parseInt(formData.milkProduction, 10),
      number_of_cows_head: parseInt(formData.cattleHeadCount, 10),
      had_supervision: formData.supervised,
      farmer: { name: formData.farmerName, city: formData.farmCity },
      from: { name: formData.fromName },
      to: { name: formData.toName },
      location: formData.location,
      created_at: checklistId ? undefined : new Date(),
      updated_at: new Date(),
    };

    try {
      const netInfo = await NetInfo.fetch();

      if (checklistId) {
        if (netInfo.isConnected) {
          await updateChecklistInAPI(checklistId, checklistData);
          Alert.alert('Sucesso', 'Checklist atualizado e sincronizado com sucesso!');
        } else {
          updateChecklist(checklistId, { ...checklistData, unsynced: true });
          Alert.alert('Sucesso', 'Checklist atualizado localmente. Será sincronizado quando estiver online.');
        }
      } else {
        if (netInfo.isConnected) {
          await createChecklistInAPI(checklistData);
          Alert.alert('Sucesso', 'Checklist criado e sincronizado com sucesso!');
        } else {
          createChecklistInRealm({ ...checklistData, unsynced: true });
          Alert.alert('Sucesso', 'Checklist criado localmente. Será sincronizado quando estiver online.');
        }
      }

      navigation.goBack();
    } catch (error) {
      console.error('Erro ao salvar checklist:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao salvar o checklist.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{checklistId ? 'Editar Checklist' : 'Novo Checklist'}</Text>
      </View>

      <View style={styles.formGroup}>
        <Ionicons name="person-outline" size={24} color="#333" />
        <TextInput
          style={styles.input}
          placeholder="Nome do Fazendeiro"
          value={formData.farmerName}
          onChangeText={(text) => setFormData({ ...formData, farmerName: text })}
        />
      </View>

      <View style={styles.formGroup}>
        <Ionicons name="location-outline" size={24} color="#333" />
        <TextInput
          style={styles.input}
          placeholder="Cidade da Fazenda"
          value={formData.farmCity}
          onChangeText={(text) => setFormData({ ...formData, farmCity: text })}
        />
      </View>

      <View style={styles.formGroup}>
        <Ionicons name="person-circle-outline" size={24} color="#333" />
        <TextInput
          style={styles.input}
          placeholder="Nome do Remetente"
          value={formData.fromName}
          onChangeText={(text) => setFormData({ ...formData, fromName: text })}
        />
      </View>

      <View style={styles.formGroup}>
        <Ionicons name="person-circle-outline" size={24} color="#333" />
        <TextInput
          style={styles.input}
          placeholder="Nome do Destinatário"
          value={formData.toName}
          onChangeText={(text) => setFormData({ ...formData, toName: text })}
        />
      </View>

      <View style={styles.formGroup}>
        <Ionicons name="list-outline" size={24} color="#333" />
        <TextInput
          style={styles.input}
          placeholder="Tipo de Checklist"
          value={formData.type}
          onChangeText={(text) => setFormData({ ...formData, type: text })}
        />
      </View>

      <View style={styles.formGroup}>
        <Ionicons name="water-outline" size={24} color="#333" />
        <TextInput
          style={styles.input}
          placeholder="Produção de Leite (L)"
          keyboardType="numeric"
          value={formData.milkProduction}
          onChangeText={(text) => setFormData({ ...formData, milkProduction: text })}
        />
      </View>

      <View style={styles.formGroup}>
        <Ionicons name="people-outline" size={24} color="#333" />
        <TextInput
          style={styles.input}
          placeholder="Número de Gado"
          keyboardType="numeric"
          value={formData.cattleHeadCount}
          onChangeText={(text) => setFormData({ ...formData, cattleHeadCount: text })}
        />
      </View>

      <View style={styles.formGroupSwitch}>
        <Ionicons name="checkmark-circle-outline" size={24} color="#333" />
        <Text style={styles.switchLabel}>Supervisionado no mês</Text>
        <Switch
          value={formData.supervised}
          onValueChange={(value) => setFormData({ ...formData, supervised: value })}
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
        <Ionicons name="save-outline" size={24} color="#fff" />
        <Text style={styles.saveButtonText}>{checklistId ? 'Editar' : 'Salvar'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 16,
  },
  formGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  formGroupSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonText: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});

export default ChecklistFormScreen;





