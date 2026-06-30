import React from 'react';
import {
  LayoutDashboard, Train, BotMessageSquare,
  Bell, Settings, Activity, Zap
} from 'lucide-react';
import './Sidebar.css';

const NAV = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'trains', icon: Train, label: 'Live Trains' },
  { id: 'alerts', icon: Bell, label: 'Alerts' },
  { id: 'ai', icon: BotMessageSquare, label: 'Metro AI' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ activePage, setActivePage }) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Zap size={18} />
        </div>
        <div className="logo-text">
          <span className="logo-title">METRO</span>
          <span className="logo-sub">COMMAND</span>
        </div>
      </div>

      {/* Status indicator */}
      <div className="sidebar-status">
        <span className="status-dot" />
        <span className="status-label">System Online</span>
      </div>

      {/* Divider */}
      <div className="sidebar-divider" />

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            className={`nav-item ${activePage === id ? 'active' : ''}`}
            onClick={() => setActivePage(id)}
          >
            <Icon size={17} className="nav-icon" />
            <span className="nav-label">{label}</span>
            {activePage === id && <span className="nav-indicator" />}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-divider" />
        <div className="system-time">
          <Activity size={12} className="time-icon" />
          <div>
            <div className="time-value">{timeStr}</div>
            <div className="time-date">{dateStr}</div>
          </div>
        </div>
        <div className="version-tag">v2.4.1 · Metro OS</div>
      </div>
    </aside>
  );
}
