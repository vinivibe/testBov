import Realm from "realm";
import ChecklistSchema, { FarmerSchema, FromToSchema, LocationSchema } from "../models/ChecklistModel";
import NetInfo from '@react-native-community/netinfo';
import { syncChecklists } from './ApiService';

const realm = new Realm({ schema: [ChecklistSchema, FarmerSchema, FromToSchema, LocationSchema] });

export const getChecklists = () => {
  return realm.objects("Checklist").sorted("created_at", true);
};

export const getChecklistById = (id) => {
  try {
    const checklist = realm.objectForPrimaryKey("Checklist", id);
    return checklist ? JSON.parse(JSON.stringify(checklist)) : null;
  } catch (error) {
    console.error("Erro ao buscar checklist por ID:", error);
    return null;
  }
};

const generateNumericId = () => {
  const timestamp = Date.now().toString(); 
  const randomNum = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0'); // 9 dígitos aleatórios
  return timestamp + randomNum;
};

export const createChecklist = (checklistData) => {
  realm.write(() => {
    realm.create("Checklist", {
      ...checklistData,
      _id: checklistData._id || generateNumericId(),
      location: checklistData.location || { latitude: 0, longitude: 0 },
      created_at: new Date(),
      updated_at: new Date(),
      unsynced: true,
    });
  });
};

export const updateChecklist = (id, updatedData) => {
  realm.write(() => {
    const checklist = realm.objectForPrimaryKey("Checklist", id);
    if (checklist) {
      checklist.type = updatedData.type;
      checklist.amount_of_milk_produced = updatedData.amount_of_milk_produced;
      checklist.number_of_cows_head = updatedData.number_of_cows_head;
      checklist.had_supervision = updatedData.had_supervision;
      checklist.farmer.name = updatedData.farmer.name;
      checklist.farmer.city = updatedData.farmer.city;
      checklist.from.name = updatedData.from.name;
      checklist.to.name = updatedData.to.name;
      checklist.location.latitude = updatedData.location.latitude || 0;
      checklist.location.longitude = updatedData.location.longitude || 0;
      checklist.updated_at = new Date();
      checklist.unsynced = true;
    }
  });
};

export const markSynced = (id) => {
  realm.write(() => {
    const checklist = realm.objectForPrimaryKey("Checklist", id);
    if (checklist) {
      checklist.unsynced = false;
    }
  });
};

export const deleteChecklist = (id) => {
  realm.write(() => {
    const checklist = realm.objectForPrimaryKey("Checklist", id);
    if (checklist) {
      realm.delete(checklist);
    }
  });
};

// Adicionando o setupSyncListener para ouvir as alterações
export const setupSyncListener = () => {
  NetInfo.addEventListener((state) => {
    if (state.isConnected) {
      syncChecklists().catch((error) => console.error("Erro ao sincronizar checklists:", error));
    }
  });

  realm.addListener("change", () => {
    syncChecklists().catch((error) => console.error("Erro ao sincronizar checklists:", error));
  });
};

export default realm;












