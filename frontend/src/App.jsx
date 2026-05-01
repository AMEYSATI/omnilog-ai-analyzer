import { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './components/Login';
import Dashboard from './components/Dashboard'; // Move your current App logic here

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('adminToken'));

  // If a token exists in storage, consider them logged in (for now)
  useEffect(() => {
    if (token) setIsAuthenticated(true);
  }, [token]);

  const handleLogin = async (credentials, mode) => {
  try {
    const endpoint = mode === 'signup' ? '/signup' : '/login';
    const response = await axios.post(`https://dashboard-service-jmee.onrender.com${endpoint}`, credentials);
    
    // 1. Grab both the token and the apiKey
    const { token, apiKey } = response.data;

    // 2. Save both to localStorage
    localStorage.setItem('adminToken', token);
    if (apiKey) {
      localStorage.setItem('apiKey', apiKey);
    }

    setToken(token);
    setIsAuthenticated(true);
  } catch (err) {
    alert(err.response?.data?.message || "Authentication Failed");
  }
};

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
    setIsAuthenticated(false);
  };

  // This is the "Conditional Rendering" switch
  return (
    <>
      {isAuthenticated ? (
        <Dashboard onLogout={handleLogout} /> 
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </>
  );
}

export default App;