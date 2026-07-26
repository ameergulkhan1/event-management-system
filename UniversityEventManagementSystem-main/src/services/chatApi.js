import httpClient from './httpClient';

// Send a chat message
export const apiSendChatMessage = async (message) => {
    const response = await httpClient.post('/chat/send', { message });
    return response.data;
};

// Get chat messages for an event
export const apiGetChatMessages = async (eventId) => {
    const response = await httpClient.get(`/chat/${eventId}`);
    return response.data;
};

// Send message to event chat
export const apiSendEventMessage = async (eventId, message) => {
    const response = await httpClient.post(`/chat/${eventId}`, { message });
    return response.data;
};

const chatApi = {
    sendMessage: apiSendChatMessage,
    getMessages: apiGetChatMessages,
    sendEventMessage: apiSendEventMessage
};

export default chatApi;