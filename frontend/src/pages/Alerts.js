import React, { useState, useEffect } from 'react';
import { AlertTriangle, Info, XCircle, Bell, CheckCircle } from 'lucide-react';
import './Alerts.css';

const API = 'http://localhost:5000';

const ICONS = {
  critical: XCircle,
  warning: AlertTriangle,
  info: Info,
};

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetch(`${API}/api/alerts`)
      .then(r => r.json())
      .then(setAlerts)
      .catch(() => {});
  }, []);

  return (
    <div className="alerts-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">System <span className="text-gold">Alerts</span></h1>
          <p className="page-sub">Live operational notifications</p>
        </div>
        <div className="alerts-count">
          <Bell size={14} />
          {alerts.length} Active
        </div>
      </div>

      <div className="alerts-list">
        {alerts.map((alert, i) => {
          const Icon = ICONS[alert.type] || Info;
          return (
            <div key={alert.id} className={`alert-card alert-${alert.type} fade-in`} style={{ animationDelay: `${i * 0.08}s` }}>
              <div className={`alert-icon-wrap icon-${alert.type}`}>
                <Icon size={16} />
              </div>
              <div className="alert-body">
                <div className="alert-top">
                  <span className={`alert-type-label label-${alert.type}`}>{alert.type.toUpperCase()}</span>
                  <span className="alert-line">{alert.line}</span>
                  <span className="alert-time">{alert.time}</span>
                </div>
                <p className="alert-message">{alert.message}</p>
              </div>
              <div className={`alert-severity-bar bar-${alert.type}`} />
            </div>
          );
        })}
      </div>

      {alerts.length === 0 && (
        <div className="no-alerts">
          <CheckCircle size={32} className="text-gold" />
          <p>All systems operating normally</p>
        </div>
      )}
    </div>
  );
}
