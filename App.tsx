import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { StoreProvider } from './store';
import Header from './components/Header';
import Profile from './components/Profile';
import Messaging from './components/Messaging';
import Admin from './components/Admin';

const App: React.FC = () => {
  return (
    <StoreProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-[#F3F2EF] font-sans">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Profile />} />
              <Route path="/messages" element={<Messaging />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>
        </div>
      </Router>
    </StoreProvider>
  );
};

export default App;