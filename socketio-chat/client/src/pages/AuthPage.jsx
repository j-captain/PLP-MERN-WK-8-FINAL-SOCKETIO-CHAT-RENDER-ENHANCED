import { useState } from 'react';
import AuthForm from '../components/AuthForm';

export default function AuthPage({ onAuthSuccess }) {
  const [error, setError] = useState('');

  const handleAuth = async (username, password, isLogin) => {
    try {
      const endpoint = isLogin ? '/api/login' : '/api/register';
      const apiUrl = import.meta.env.VITE_API_URL || 
                    (import.meta.env.DEV 
                      ? 'http://localhost:5000/api' 
                      : 'https://plp-mern-wk-8-final-socketio-chat-render.onrender.com/api');
      
      // Remove duplicate /api if present in both apiUrl and endpoint
      const fullUrl = `${apiUrl.replace(/\/api$/, '')}${endpoint}`;

      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || await response.text());
      }

      onAuthSuccess(username);
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