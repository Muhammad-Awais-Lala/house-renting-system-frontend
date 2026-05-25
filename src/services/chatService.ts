import axios from 'axios';
import api from './api';

export const chatService = {
  createOrGetChat: (propertyId: string, landlordId: string) => 
    api.post('/chats', { propertyId, landlordId }),
  
  getUserChats: () => 
    api.get('/chats'),
  
  getChatMessages: (chatId: string) => 
    api.get(`/chats/${chatId}/messages`),
};
