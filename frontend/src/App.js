// src/App.js
import React, { useContext, useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer'; // <-- 1. Footer Import
import Notification from './components/Notification'; // Import Notification
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import UploadPage from './pages/UploadPage';
import PostDetailPage from './pages/PostDetailPage';
import SearchPage from './pages/SearchPage';
import ProfilePage from './pages/ProfilePage';
import InboxPage from './pages/InboxPage';
import ConversationPage from './pages/ConversationPage';
import { AuthContext } from './context/AuthContext';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5000';
const API = axios.create({ baseURL: `${API_URL}/api` });

API.interceptors.request.use((req) => {
  if (localStorage.getItem('token')) {
    req.headers['x-auth-token'] = localStorage.getItem('token');
  }
  return req;
});

export { API, API_URL }; 

function App() {
  const { loadUser, isAuthenticated } = useContext(AuthContext);
  
  // 2. State for controlling global notifications
  const [notification, setNotification] = useState(null); 

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <div className="App">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* Pass setNotification to LoginPage */}
          <Route path="/login" element={<LoginPage setNotification={setNotification} />} /> 
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/upload" element={isAuthenticated ? <UploadPage /> : <LoginPage />} />
          <Route path="/post/:id" element={<PostDetailPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="/messages" element={isAuthenticated ? <InboxPage /> : <LoginPage />} />
          <Route path="/messages/:conversationId" element={isAuthenticated ? <ConversationPage /> : <LoginPage />} />
        </Routes>
      </main>
      
      {/* 3. Render the Footer outside the main content area */}
      <Footer /> 
      
      {/* 4. Render Notification Globally */}
      {notification && (
        <Notification 
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}

export default App;