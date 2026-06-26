import api from './api';

export const taskService = {
  getTasks: async (boardId, params = {}) => {
    const response = await api.get(`/boards/${boardId}/tasks`, { params });
    return response.data;
  },

  getTask: async (boardId, taskId) => {
    const response = await api.get(`/boards/${boardId}/tasks/${taskId}`);
    return response.data;
  },

  createTask: async (boardId, data) => {
    const response = await api.post(`/boards/${boardId}/tasks`, data);
    return response.data;
  },

  updateTask: async (boardId, taskId, data) => {
    const response = await api.put(`/boards/${boardId}/tasks/${taskId}`, data);
    return response.data;
  },

  deleteTask: async (boardId, taskId) => {
    const response = await api.delete(`/boards/${boardId}/tasks/${taskId}`);
    return response.data;
  },

  updateStatus: async (boardId, taskId, status) => {
    const response = await api.patch(`/boards/${boardId}/tasks/${taskId}/status`, { status });
    return response.data;
  },

  suggestEstimate: async (boardId, { title, description }) => {
    const response = await api.post(`/boards/${boardId}/tasks/suggest`, { title, description });
    return response.data;
  },

  reorderTasks: async (boardId, tasks) => {
    const response = await api.patch(`/boards/${boardId}/tasks/reorder`, { tasks });
    return response.data;
  },
};
