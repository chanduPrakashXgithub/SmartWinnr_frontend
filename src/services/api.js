import axios from 'axios';

// Base API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ============================================
// Auth Service
// ============================================
export const authService = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data),
    changePassword: (data) => api.put('/auth/password', data),
    uploadAvatar: (file) => {
        const formData = new FormData();
        formData.append('avatar', file);
        return api.post('/auth/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};

// ============================================
// User Service
// ============================================
export const userService = {
    getUsers: (params) => api.get('/users', { params }),
    getUserById: (userId) => api.get(`/users/${userId}`),
    searchUsers: (query) => api.get('/users/search', { params: { q: query } }),
    getOnlineUsers: () => api.get('/users/online'),
    getContacts: () => api.get('/users/contacts'),
    addContact: (userId) => api.post(`/users/contacts/${userId}`),
    removeContact: (userId) => api.delete(`/users/contacts/${userId}`),
};

// ============================================
// Chat Room Service
// ============================================
export const chatRoomService = {
    getChatRooms: (params) => api.get('/chatrooms', { params }),
    getChatRoom: (roomId) => api.get(`/chatrooms/${roomId}`),
    createPrivateChat: (userId) => api.post('/chatrooms/private', { userId }),
    createGroupChat: (data) => api.post('/chatrooms/group', data),
    updateChatRoom: (roomId, data) => api.put(`/chatrooms/${roomId}`, data),
    addParticipant: (roomId, userId) => api.post(`/chatrooms/${roomId}/participants`, { userId }),
    removeParticipant: (roomId, userId) => api.delete(`/chatrooms/${roomId}/participants/${userId}`),
    leaveGroup: (roomId) => api.post(`/chatrooms/${roomId}/leave`),
    markAsRead: (roomId) => api.post(`/chatrooms/${roomId}/read`),
};

// ============================================
// Message Service
// ============================================
export const messageService = {
    getMessages: (roomId, params) => api.get(`/messages/${roomId}`, { params }),
    sendMessage: (data) => api.post('/messages', data),
    sendMediaMessage: (data) => {
        const formData = new FormData();
        formData.append('chatRoomId', data.chatRoomId);
        formData.append('file', data.file);
        if (data.content) {
            formData.append('content', data.content);
        }
        return api.post('/messages/media', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    editMessage: (messageId, content) => api.put(`/messages/${messageId}`, { content }),
    deleteMessage: (messageId) => api.delete(`/messages/${messageId}`),
    markAsRead: (messageId) => api.post(`/messages/${messageId}/read`),
    getUnreadCount: () => api.get('/messages/unread/count'),
};

export default api;
