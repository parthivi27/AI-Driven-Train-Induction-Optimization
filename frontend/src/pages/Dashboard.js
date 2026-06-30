import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import {
  Users, Train, Clock, TrendingUp,
  AlertTriangle, CheckCircle, Zap, Activity
} from 'lucide-react';
import './Dashboard.css';

const API = 'http://localhost:5000';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <div className="tooltip-label">{label}</div>
        <div className="tooltip-value">{payload[0]?.value?.toLocaleString()}</div>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API}/api/stats`);
      const data = await res.json();
      setStats(data);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" />
        <span>Loading Metro Command...</span>
      </div>
    );
  }

  const kpis = [
    {
      label: 'Passengers Today',
      value: stats?.total_passengers_today?.toLocaleString() ?? '—',
      icon: Users,
      color: 'gold',
      change: '+4.2%',
      up: true,
    },
    {
      label: 'Trains Running',
      value: stats?.trains_running ?? '—',
      icon: Train,
      color: 'cyan',
      sub: `${stats?.trains_delayed} delayed`,
    },
    {
      label: 'On-Time Rate',
      value: `${stats?.on_time_pct ?? '—'}%`,
      icon: Clock,
      color: 'emerald',
      change: '+1.1%',
      up: true,
    },
    {
      label: "Today's Revenue",
      value: `₹${(stats?.revenue_today / 100000).toFixed(2)}L`,
      icon: TrendingUp,
      color: 'violet',
      change: '+7.8%',
      up: true,
    },
  ];

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dash-header">
        <div className="dash-header-left">
          <h1 className="dash-title">Operations <span className="text-gold">Dashboard</span></h1>
          <p className="dash-subtitle">Real-time metro network intelligence</p>
        </div>
        <div className="dash-header-right">
          <div className="live-badge">
            <span className="live-dot" />
            LIVE
          </div>
          <div className="efficiency-badge">
            <Zap size={13} />
            {stats?.on_time_pct}% Efficiency
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {kpis.map((kpi, i) => (
          <div key={i} className={`kpi-card kpi-${kpi.color} fade-in`} style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="kpi-top">
              <span className="kpi-label">{kpi.label}</span>
              <div className={`kpi-icon-wrap kpi-icon-${kpi.color}`}>
                <kpi.icon size={16} />
              </div>
            </div>
            <div className="kpi-value">{kpi.value}</div>
            {kpi.change && (
              <div className={`kpi-change ${kpi.up ? 'up' : 'down'}`}>
                {kpi.up ? '↑' : '↓'} {kpi.change} vs yesterday
              </div>
            )}
            {kpi.sub && <div className="kpi-sub">{kpi.sub}</div>}
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        {/* Area Chart */}
        <div className="chart-card chart-large fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Passenger Flow</h3>
              <p className="chart-subtitle">24-hour traffic pattern</p>
            </div>
            <Activity size={16} className="text-gold" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stats?.hourly_passengers} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c9a84c" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#c9a84c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,168,76,0.07)" />
              <XAxis dataKey="hour" tick={{ fill: '#5c5848', fontSize: 11 }} axisLine={false} tickLine={false} interval={3} />
              <YAxis tick={{ fill: '#5c5848', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="passengers" stroke="#c9a84c" strokeWidth={2}
                fill="url(#goldGrad)" dot={false} activeDot={{ r: 4, fill: '#c9a84c' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart - Line Performance */}
        <div className="chart-card chart-small fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Line Performance</h3>
              <p className="chart-subtitle">On-time % by line</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats?.line_performance} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,168,76,0.07)" vertical={false} />
              <XAxis dataKey="line" tick={{ fill: '#5c5848', fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => v.split(' ')[0]} />
              <YAxis domain={[70, 100]} tick={{ fill: '#5c5848', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="on_time" fill="#c9a84c" radius={[3, 3, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="bottom-grid fade-in" style={{ animationDelay: '0.5s' }}>
        {/* Quick Stats */}
        <div className="quick-stats-card">
          <h3 className="card-title">Network Health</h3>
          <div className="health-items">
            {[
              { label: 'Active Stations', value: stats?.active_stations, icon: CheckCircle, ok: true },
              { label: 'Avg Delay', value: `${stats?.avg_delay} min`, icon: Clock, ok: stats?.avg_delay < 3 },
              { label: 'Incidents Today', value: stats?.incidents_today, icon: AlertTriangle, ok: stats?.incidents_today === 0 },
              { label: 'Trains Delayed', value: stats?.trains_delayed, icon: Train, ok: stats?.trains_delayed < 3 },
            ].map((item, i) => (
              <div key={i} className="health-item">
                <item.icon size={15} className={item.ok ? 'icon-ok' : 'icon-warn'} />
                <span className="health-label">{item.label}</span>
                <span className={`health-value ${item.ok ? 'val-ok' : 'val-warn'}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Line Passengers */}
        <div className="line-passengers-card">
          <h3 className="card-title">Ridership by Line</h3>
          <div className="line-bars">
            {stats?.line_performance?.map((line, i) => {
              const colors = ['#c9a84c', '#4fc3f7', '#4caf87', '#f59e0b', '#7c6aff'];
              const pct = Math.round((line.passengers / 45000) * 100);
              return (
                <div key={i} className="line-bar-item">
                  <div className="line-bar-label">
                    <span style={{ color: colors[i] }}>{line.line.split(' ')[0]}</span>
                    <span className="line-bar-count">{line.passengers.toLocaleString()}</span>
                  </div>
                  <div className="line-bar-track">
                    <div
                      className="line-bar-fill"
                      style={{ width: `${pct}%`, background: colors[i] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
