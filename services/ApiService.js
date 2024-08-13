import axios from 'axios';
import { getChecklists, markSynced, deleteChecklist } from './RealmService';

const API_URL = 'http://challenge-front-end.bovcontrol.com/v1/checkList';

export const fetchChecklistsFromAPI = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar checklists da API:', error);
    throw error;
  }
};

export const createChecklist = async (checklistData) => {
  try {
    const response = await axios.post(API_URL, {
      checklists: [checklistData],
    });
    return response.data.idCreate;
  } catch (error) {
    console.error('Erro ao criar checklist:', error);
    throw error;
  }
};

export const getChecklistById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar o checklist com ID ${id}:`, error);
    throw error;
  }
};

export const updateChecklist = async (id, updatedData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, updatedData);
    return response.data;
  } catch (error) {
    console.error(`Erro ao atualizar o checklist com ID ${id}:`, error);
    throw error;
  }
};

export const deleteChecklistApi = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(`Erro ao deletar o checklist com ID ${id}:`, error);
    throw error;
  }
};

export const syncChecklists = async () => {
  try {
    const unsyncedChecklists = getChecklists().filtered('unsynced == true');

    if (unsyncedChecklists.length === 0) {
      console.log('Nenhum checklist para sincronizar.');
      return;
    }

    const checklistsData = unsyncedChecklists.map((checklist) => ({
      _id: checklist._id,
      type: checklist.type,
      amount_of_milk_produced: checklist.amount_of_milk_produced,
      number_of_cows_head: checklist.number_of_cows_head,
      had_supervision: checklist.had_supervision,
      farmer: {
        name: checklist.farmer.name,
        city: checklist.farmer.city,
      },
      from: {
        name: checklist.from.name,
      },
      to: {
        name: checklist.to.name,
      },
      location: {
        latitude: checklist.location.latitude,
        longitude: checklist.location.longitude,
      },
      created_at: checklist.created_at ? new Date(checklist.created_at).toISOString() : new Date().toISOString(),
      updated_at: checklist.updated_at ? new Date(checklist.updated_at).toISOString() : new Date().toISOString(),
    }));

    const response = await axios.post(API_URL, { checklists: checklistsData });

    if (response.status === 200) {
      unsyncedChecklists.forEach((checklist, index) => {
        const apiResponseId = response.data.idCreate[index];
        console.log(`Checklist ID na API: ${apiResponseId}`);
        if (apiResponseId) {
          markSynced(checklist._id);
          deleteChecklist(checklist._id); 
        } else {
          console.error(`Erro ao sincronizar checklist ${checklist._id}: ID retornado pela API é inválido.`);
        }
      });
      console.log('Checklists sincronizados com sucesso.');
    } else {
      console.error('Erro ao sincronizar checklists:', response);
    }
  } catch (error) {
    console.error('Erro ao sincronizar checklists:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const syncSingleChecklist = async (checklist) => {
  try {
    const createdAt = checklist.created_at ? new Date(checklist.created_at).toISOString() : new Date().toISOString();
    const updatedAt = checklist.updated_at ? new Date(checklist.updated_at).toISOString() : new Date().toISOString();

    const checklistData = {
      _id: checklist._id,
      type: checklist.type,
      amount_of_milk_produced: checklist.amount_of_milk_produced,
      number_of_cows_head: checklist.number_of_cows_head,
      had_supervision: checklist.had_supervision,
      farmer: {
        name: checklist.farmer.name,
        city: checklist.farmer.city,
      },
      from: {
        name: checklist.from.name,
      },
      to: {
        name: checklist.to.name,
      },
      location: {
        latitude: checklist.location.latitude,
        longitude: checklist.location.longitude,
      },
      created_at: createdAt,
      updated_at: updatedAt,
    };

    const payload = {
      checklists: [checklistData],
    };

    console.log("Dados enviados para sincronização:", JSON.stringify(payload, null, 2));

    const response = await axios.post(API_URL, payload);

    if (response.status === 200) {
      const apiResponseId = response.data.idCreate[0];
      if (apiResponseId) {
        markSynced(checklist._id);
        deleteChecklist(checklist._id); 
        console.log(`Checklist ${checklist._id} sincronizado com sucesso.`);
      } else {
        console.error(`Erro ao sincronizar checklist ${checklist._id}: ID retornado pela API é inválido.`);
      }
    } else {
      console.error('Erro ao sincronizar checklist:', response);
    }
  } catch (error) {
    console.error('Erro ao sincronizar checklist:', error.response ? error.response.data : error.message);
    throw error;
  }
};










