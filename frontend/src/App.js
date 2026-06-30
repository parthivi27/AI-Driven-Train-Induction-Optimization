import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import AIAssistant from './pages/AIAssistant';
import TrainStatus from './pages/TrainStatus';
import Alerts from './pages/Alerts';
import Settings from './pages/Settings';
import './App.css';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [apiKey, setApiKey] = useState(localStorage.getItem('metro_openai_key') || '');

  const saveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem('metro_openai_key', key);
  };

  const pages = {
    dashboard: <Dashboard />,
    ai: <AIAssistant apiKey={apiKey} />,
    trains: <TrainStatus />,
    alerts: <Alerts />,
    settings: <Settings apiKey={apiKey} setApiKey={saveApiKey} />,
  };

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="app-main">
        {pages[activePage] || pages['dashboard']}
      </main>
    </div>
  );
}
