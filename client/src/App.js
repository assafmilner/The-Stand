import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Home from './components/Home';
import { UserProvider } from './components/context/UserContext';
import Settings from "./components/Settings";

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/home" element={<Home />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
