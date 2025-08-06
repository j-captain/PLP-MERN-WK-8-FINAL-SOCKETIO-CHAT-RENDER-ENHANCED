import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children, username }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [deletionState, setDeletionState] = useState({
    inProgress: false,
    error: null,
    success: false
  });

  useEffect(() => {
    if (!username) return;

    const socketUrl = import.meta.env.VITE_SERVER_URL || 
                     (import.meta.env.DEV 
                      ? 'http://localhost:5000' 
                      : 'https://plp-mern-wk-8-final-socketio-chat-render.onrender.com');

    const newSocket = io(socketUrl, {
      auth: { username },
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket'],
      secure: import.meta.env.PROD,
      path: '/socket.io'
    });

    // Connection handlers
    newSocket.on('connect', () => {
      setIsConnected(true);
      setConnectionError(null);
      if (import.meta.env.DEV) {
        console.log('Socket connected:', newSocket.id);
      }
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      if (import.meta.env.DEV) {
        console.log('Socket disconnected');
      }
    });

    newSocket.on('connect_error', (err) => {
      setConnectionError(err.message);
      console.error('Connection error:', err.message);
      setTimeout(() => newSocket.connect(), 5000); // Attempt reconnect after 5 seconds
    });

    // Message deletion handlers
    newSocket.on('deleteError', (error) => {
      setDeletionState({
        inProgress: false,
        error: error.message,
        success: false
      });
      setTimeout(() => setDeletionState(prev => ({...prev, error: null})), 3000);
    });

    setSocket(newSocket);

    return () => {
      newSocket.off('connect');
      newSocket.off('disconnect');
      newSocket.off('connect_error');
      newSocket.off('deleteError');
      newSocket.disconnect();
    };
  }, [username]);

  const deleteMessage = (messageId, deleteForEveryone = false) => {
    if (!socket || deletionState.inProgress) return;

    setDeletionState({
      inProgress: true,
      error: null,
      success: false
    });

    socket.emit('deleteMessage', { 
      messageId, 
      deleteForEveryone 
    }, (response) => {
      setDeletionState({
        inProgress: false,
        error: response?.error || null,
        success: !response?.error
      });
      
      if (!response?.error) {
        setTimeout(() => setDeletionState(prev => ({...prev, success: false})), 2000);
      }
    });
  };

  return (
    <SocketContext.Provider value={{ 
      socket, 
      isConnected,
      connectionError,
      deleteMessage,
      deletionState
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);