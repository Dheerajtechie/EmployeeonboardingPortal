import axios from 'axios';

const chatApi = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

const chatService = {
  askQuestion: async (question, userId) => {
    const response = await chatApi.post('/chatbot/ask', {
      query: question,
      user_id: userId,
    });
    return response.data;
  },
};

export default chatService;
