import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider, AdminOnly } from './auth.jsx';
import { ToastProvider } from './ui.jsx';
import Login from './Login.jsx';
import Admin from './Admin.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ToastProvider>
      <AuthProvider>
        <Routes>
          <Route path="/ingresar" element={<Login />} />
          <Route path="/*" element={<AdminOnly><Admin /></AdminOnly>} />
        </Routes>
      </AuthProvider>
    </ToastProvider>
  </BrowserRouter>,
);
