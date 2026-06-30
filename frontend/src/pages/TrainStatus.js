import React, { useState, useEffect } from 'react';
import { Train, RefreshCw, Users, Clock, ArrowRight } from 'lucide-react';
import './TrainStatus.css';

const API = 'http://localhost:5000';

const LINE_COLORS = {
  'Blue Line': '#4fc3f7',
  'Red Line': '#e05c6b',
  'Green Line': '#4caf87',
  'Yellow Line': '#f59e0b',
  'Purple Line': '#7c6aff',
};

export default function TrainStatus() {
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState('');
  const [filter, setFilter] = useState('All');

  const lines = ['All', 'Blue Line', 'Red Line', 'Green Line', 'Yellow Line', 'Purple Line'];

  useEffect(() => {
    fetchTrains();
    const interval = setInterval(fetchTrains, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchTrains = async () => {
    try {
      const res = await fetch(`${API}/api/trains`);
      const data = await res.json();
      setTrains(data);
      setLastUpdate(new Date().toLocaleTimeString());
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  const filtered = filter === 'All' ? trains : trains.filter(t => t.line === filter);

  return (
    <div className="trains-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Live <span className="text-gold">Train Status</span></h1>
          <p className="page-sub">Real-time positions · Updates every 15 seconds</p>
        </div>
        <div className="header-right">
          <span className="last-update">Last updated: {lastUpdate}</span>
          <button className="refresh-btn" onClick={fetchTrains}>
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="filter-tabs">
        {lines.map(line => (
          <button
            key={line}
            className={`filter-tab ${filter === line ? 'active' : ''}`}
            style={filter === line && LINE_COLORS[line] ? { borderColor: LINE_COLORS[line], color: LINE_COLORS[line] } : {}}
            onClick={() => setFilter(line)}
          >
            {line === 'All' ? 'All Lines' : line.split(' ')[0]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="trains-loading"><div className="loading-spinner" /></div>
      ) : (
        <div className="trains-grid">
          {filtered.map((train, i) => {
            const color = LINE_COLORS[train.line] || '#c9a84c';
            const isDelayed = train.delay > 0;
            const capacityPct = Math.round((train.passengers / train.capacity) * 100);

            return (
              <div
                key={train.id}
                className={`train-card fade-in ${isDelayed ? 'delayed' : ''}`}
                style={{ '--line-color': color, animationDelay: `${i * 0.04}s` }}
              >
                <div className="train-card-top">
                  <div className="train-id-wrap">
                    <Train size={14} style={{ color }} />
                    <span className="train-id">{train.id}</span>
                  </div>
                  <span
                    className={`train-status-badge ${isDelayed ? 'badge-delayed' : 'badge-ok'}`}
                  >
                    {isDelayed ? `+${train.delay}m` : '✓ On Time'}
                  </span>
                </div>

                <div className="train-line-name" style={{ color }}>{train.line}</div>

                <div className="train-route">
                  <span className="route-station">{train.location}</span>
                  <ArrowRight size={12} className="route-arrow" />
                  <span className="route-station next">{train.next_station}</span>
                </div>

                <div className="train-metrics">
                  <div className="metric">
                    <Users size={12} />
                    <span>{train.passengers}</span>
                  </div>
                  <div className="metric">
                    <Clock size={12} />
                    <span>{isDelayed ? `${train.delay} min delay` : 'On schedule'}</span>
                  </div>
                </div>

                {/* Capacity bar */}
                <div className="capacity-row">
                  <span className="capacity-label">Capacity</span>
                  <div className="capacity-track">
                    <div
                      className="capacity-fill"
                      style={{
                        width: `${capacityPct}%`,
                        background: capacityPct > 85 ? '#e05c6b' : capacityPct > 60 ? '#f59e0b' : color,
                      }}
                    />
                  </div>
                  <span className="capacity-pct">{capacityPct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
