import { useState } from 'react';
import AuthForm from '../components/AuthForm';

export default function AuthPage({ onAuthSuccess }) {
  const [error, setError] = useState('');

  const handleAuth = async (username, password, isLogin) => {
    try {
      const endpoint = isLogin ? '/login' : '/register';
      const apiUrl = import.meta.env.VITE_API_URL || 
                    (import.meta.env.DEV 
                      ? 'http://localhost:5000/api' 
                      : 'https://plp-mern-wk-8-final-socketio-chat-render.onrender.com/api');
      
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });

      // First read the response as text
      const responseText = await response.text();
      
      if (!response.ok) {
        // Try to parse as JSON if possible
        try {
          const errorData = JSON.parse(responseText);
          throw new Error(errorData.message || 'Authentication failed');
        } catch {
          throw new Error(responseText || 'Authentication failed');
        }
      }

      // If successful, try to parse as JSON
      try {
        const data = JSON.parse(responseText);
        onAuthSuccess(username, data);
      } catch {
        onAuthSuccess(username);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
      console.error('Auth error:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <AuthForm 
        onAuth={handleAuth} 
        error={error} 
        setError={setError}
      />
    </div>
  );
}