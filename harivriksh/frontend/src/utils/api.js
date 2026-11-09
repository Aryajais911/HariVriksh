import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' }
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('hv_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('hv_token');
      localStorage.removeItem('hv_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const updateProfile = (data) => API.put('/auth/profile', data);

// Plants
export const getPlants = (params) => API.get('/plants', { params });
export const getPlant = (id) => API.get(`/plants/${id}`);
export const matchPlants = (data) => API.post('/plants/match', data);
export const savePlant = (id) => API.post(`/plants/${id}/save`);

// Containers
export const getContainers = () => API.get('/containers');

// Gardens
export const getMyGarden = () => API.get('/gardens/my');
export const updateGarden = (data) => API.put('/gardens/my', data);
export const addContainer = (data) => API.post('/gardens/my/containers', data);
export const removeContainer = (id) => API.delete(`/gardens/my/containers/${id}`);
export const getPublicGardens = () => API.get('/gardens/public');

// Posts
export const getPosts = (params) => API.get('/posts', { params });
export const getPost = (id) => API.get(`/posts/${id}`);
export const createPost = (data) => API.post('/posts', data);
export const likePost = (id) => API.post(`/posts/${id}/like`);
export const addComment = (id, data) => API.post(`/posts/${id}/comments`, data);
export const markCommentSolution = (id, commentId) => API.post(`/posts/${id}/comments/${commentId}/solution`);
export const deletePost = (id) => API.delete(`/posts/${id}`);

// Reminders
export const getReminders = (params) => API.get('/reminders', { params });
export const createReminder = (data) => API.post('/reminders', data);
export const completeReminder = (id) => API.put(`/reminders/${id}/complete`);
export const deleteReminder = (id) => API.delete(`/reminders/${id}`);

// Soil
export const getSoilGuides = () => API.get('/soil');
export const getSoilPlantsList = () => API.get('/soil/plants/list');
export const getSoilRecommendation = (plantId) => API.get(`/soil/recommend/${plantId}`);
export const getCategoryComposts = () => API.get('/soil/category-guides');

export default API;

// AI Chatbot
export const aiChat = (data) => API.post('/ai/chat', data);
export const aiDiagnose = (data) => API.post('/ai/diagnose', data);
export const aiRecommend = (data) => API.post('/ai/recommend', data);

// Weather (Open-Meteo - free, no key)
export const getWeather = (params) => API.get('/weather', { params });

// Notifications
export const getNotifications = (params) => API.get('/notifications', { params });
export const markNotifRead = (id) => API.put(`/notifications/${id}/read`);
export const markAllRead = () => API.put('/notifications/read-all');
export const deleteNotif = (id) => API.delete(`/notifications/${id}`);

// Image Upload
export const uploadImage = (formData) => API.post('/upload/image', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const uploadMultiple = (formData) => API.post('/upload/multiple', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

// Stats / Dashboard
export const getDashboardStats = () => API.get('/stats/dashboard');
export const getPublicStats = () => API.get('/stats/public');
