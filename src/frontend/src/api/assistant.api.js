import apiClient from './client';

export const assistantApi = {
  /**
   * @param {{ message: string, context?: object }} data
   */
  sendMessage: (data) => apiClient.post('/farmer/assistant/chat', data),
};
