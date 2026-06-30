import React, { useState } from 'react';
import { Key, Eye, EyeOff, Check, AlertCircle, Server, Palette, Info } from 'lucide-react';
import './Settings.css';

export default function Settings({ apiKey, setApiKey }) {
  const [inputKey, setInputKey] = useState(apiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleSave = () => {
    setApiKey(inputKey.trim());
    setSaved(true);
    setTestResult(null);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleTest = async () => {
    if (!inputKey.trim()) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Say "MetroAI connection verified" only.' }],
          api_key: inputKey.trim(),
          model: 'gpt-4o',
        }),
      });
      if (res.ok) {
        setTestResult({ ok: true, msg: 'Connection verified! API key is valid.' });
      } else {
        const err = await res.json();
        setTestResult({ ok: false, msg: err.detail || 'Connection failed.' });
      }
    } catch {
      setTestResult({ ok: false, msg: 'Could not reach backend. Make sure it is running.' });
    }
    setTesting(false);
  };

  const maskedKey = inputKey
    ? inputKey.slice(0, 7) + '••••••••••••••••' + inputKey.slice(-4)
    : '';

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">System <span className="text-gold">Settings</span></h1>
          <p className="page-sub">Configuration & preferences</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* API Key Card */}
        <div className="settings-card fade-in">
          <div className="settings-card-header">
            <div className="settings-icon-wrap">
              <Key size={16} />
            </div>
            <div>
              <h3 className="settings-card-title">OpenAI API Key</h3>
              <p className="settings-card-sub">Required for MetroAI assistant</p>
            </div>
          </div>

          <div className="api-key-section">
            <div className="input-group">
              <label className="field-label">API Key</label>
              <div className="key-input-wrap">
                <input
                  type={showKey ? 'text' : 'password'}
                  className="key-input"
                  value={inputKey}
                  onChange={e => setInputKey(e.target.value)}
                  placeholder="sk-proj-..."
                  spellCheck={false}
                />
                <button
                  className="toggle-vis"
                  onClick={() => setShowKey(!showKey)}
                  title={showKey ? 'Hide key' : 'Show key'}
                >
                  {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {apiKey && (
              <div className="current-key">
                <span className="current-key-label">Current key:</span>
                <code className="current-key-value">{maskedKey}</code>
              </div>
            )}

            <div className="settings-actions">
              <button
                className="btn-test"
                onClick={handleTest}
                disabled={!inputKey.trim() || testing}
              >
                {testing ? 'Testing...' : 'Test Connection'}
              </button>
              <button
                className={`btn-save ${saved ? 'saved' : ''}`}
                onClick={handleSave}
                disabled={!inputKey.trim()}
              >
                {saved ? (
                  <><Check size={14} /> Saved!</>
                ) : (
                  'Save Key'
                )}
              </button>
            </div>

            {testResult && (
              <div className={`test-result ${testResult.ok ? 'result-ok' : 'result-err'}`}>
                {testResult.ok ? <Check size={14} /> : <AlertCircle size={14} />}
                <span>{testResult.msg}</span>
              </div>
            )}

            <div className="key-info">
              <Info size={13} />
              <span>
                Your API key is stored locally in your browser (localStorage) and is never sent
                to any server other than OpenAI. Get your key at{' '}
                <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer">
                  platform.openai.com
                </a>.
              </span>
            </div>
          </div>
        </div>

        {/* Backend Status */}
        <div className="settings-card fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="settings-card-header">
            <div className="settings-icon-wrap icon-cyan">
              <Server size={16} />
            </div>
            <div>
              <h3 className="settings-card-title">Backend Connection</h3>
              <p className="settings-card-sub">FastAPI service at localhost:5000</p>
            </div>
          </div>

          <div className="backend-info">
            {[
              { label: 'Backend URL', value: 'http://localhost:5000' },
              { label: 'API Version', value: 'v1.0' },
              { label: 'AI Model', value: 'GPT-4o' },
              { label: 'Streaming', value: 'Enabled (SSE)' },
            ].map((item, i) => (
              <div key={i} className="info-row">
                <span className="info-label">{item.label}</span>
                <span className="info-value">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="startup-guide">
            <h4 className="guide-title">Startup Instructions</h4>
            <div className="code-block">
              <div className="code-comment"># Terminal 1 — Backend</div>
              <div className="code-line">cd backend</div>
              <div className="code-line">python -m venv venv</div>
              <div className="code-line">venv\Scripts\activate</div>
              <div className="code-line">pip install -r requirements.txt</div>
              <div className="code-line">python main.py</div>
              <div className="code-spacer" />
              <div className="code-comment"># Terminal 2 — Frontend</div>
              <div className="code-line">cd frontend</div>
              <div className="code-line">npm install</div>
              <div className="code-line">npm start</div>
            </div>
          </div>
        </div>

        {/* Theme / About */}
        <div className="settings-card fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="settings-card-header">
            <div className="settings-icon-wrap icon-violet">
              <Palette size={16} />
            </div>
            <div>
              <h3 className="settings-card-title">About Metro Command</h3>
              <p className="settings-card-sub">System information</p>
            </div>
          </div>

          <div className="about-section">
            {[
              { label: 'Application', value: 'Metro Command v2.4.1' },
              { label: 'Theme', value: 'Luxury Dark · Gold Accent' },
              { label: 'Frontend', value: 'React 19 + Recharts' },
              { label: 'Backend', value: 'FastAPI + Python 3.11' },
              { label: 'AI Provider', value: 'OpenAI (GPT-4o)' },
              { label: 'Fonts', value: 'Cormorant Garamond + Outfit' },
            ].map((item, i) => (
              <div key={i} className="info-row">
                <span className="info-label">{item.label}</span>
                <span className="info-value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
