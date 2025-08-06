import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_API_BASE_URL || 'https://plp-mern-wk-8-final-socketio-chat-render.onrender.com';

 
const socket = io('https://plp-mern-wk-8-final-socketio-chat-render.onrender.com', {
  auth: {
    token: localStorage.getItem('authToken')  
  }
});

export const initSocket = (token) => {
  return io(URL, {
    auth: { token },
    autoConnect: false,
  });
};