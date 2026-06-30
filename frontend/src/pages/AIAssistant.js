import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, Bot, User, Sparkles, RotateCcw,
  Copy, Check, ChevronDown, Zap, AlertCircle
} from 'lucide-react';
import './AIAssistant.css';

const API = 'http://localhost:5000'; 

const SUGGESTIONS = [
  "What's the current status of all metro lines?",
  "Which line has the most delays today?",
  "Give me a summary of today's passenger traffic",
  "What are the peak hours for the Blue Line?",
  "Suggest ways to reduce average delay time",
  "Show me revenue trends and insights",
];

function MessageBubble({ msg, isLast }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = msg.role === 'user';

  return (
    <div className={`message-row ${isUser ? 'user-row' : 'ai-row'} fade-in`}>
      {!isUser && (
        <div className="avatar ai-avatar">
          <Bot size={15} />
        </div>
      )}

      <div className={`bubble-wrap ${isUser ? 'user-wrap' : 'ai-wrap'}`}>
        {!isUser && (
          <div className="bubble-meta">
            <span className="bubble-name">MetroAI</span>
            <span className="bubble-time">{msg.time}</span>
          </div>
        )}
        <div className={`bubble ${isUser ? 'user-bubble' : 'ai-bubble'}`}>
          {msg.streaming ? (
            <span className="streaming-text">
              {msg.content}
              <span className="cursor-blink">▌</span>
            </span>
          ) : (
            <FormattedMessage content={msg.content} />
          )}
        </div>
        {!isUser && !msg.streaming && msg.content && (
          <button className="copy-btn" onClick={handleCopy} title="Copy">
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </button>
        )}
      </div>

      {isUser && (
        <div className="avatar user-avatar">
          <User size={15} />
        </div>
      )}
    </div>
  );
}

function FormattedMessage({ content }) {
  // Simple markdown-like rendering
  const lines = content.split('\n');
  return (
    <div className="formatted-content">
      {lines.map((line, i) => {
        if (line.startsWith('### ')) return <h4 key={i} className="md-h4">{line.slice(4)}</h4>;
        if (line.startsWith('## ')) return <h3 key={i} className="md-h3">{line.slice(3)}</h3>;
        if (line.startsWith('# ')) return <h2 key={i} className="md-h2">{line.slice(2)}</h2>;
        if (line.startsWith('**') && line.endsWith('**')) {
          return <strong key={i} className="md-bold">{line.slice(2, -2)}</strong>;
        }
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return <div key={i} className="md-li">
            <span className="md-bullet">◆</span>
            <span>{renderInline(line.slice(2))}</span>
          </div>;
        }
        if (line.match(/^\d+\. /)) {
          const [num, ...rest] = line.split('. ');
          return <div key={i} className="md-li">
            <span className="md-num">{num}.</span>
            <span>{renderInline(rest.join('. '))}</span>
          </div>;
        }
        if (line === '') return <div key={i} className="md-spacer" />;
        return <p key={i} className="md-p">{renderInline(line)}</p>;
      })}
    </div>
  );
}

function renderInline(text) {
  // Bold inline
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export default function AIAssistant({ apiKey }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Welcome to **MetroAI** — your intelligent metro operations assistant.\n\nI have real-time access to train positions, delays, passenger data, and performance metrics. Ask me anything about the network.\n\n◆ How can I assist you today?",
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      id: 'welcome',
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showScroll, setShowScroll] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setShowScroll(!nearBottom);
  };

  const handleSend = async (text = input) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    if (!apiKey) {
      setError('Please add your OpenAI API key in Settings first.');
      return;
    }
    setError('');
    setInput('');

    const userMsg = {
      role: 'user',
      content: trimmed,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      id: Date.now(),
    };

    const aiMsgId = Date.now() + 1;
    const aiMsg = {
      role: 'assistant',
      content: '',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      id: aiMsgId,
      streaming: true,
    };

    setMessages(prev => [...prev, userMsg, aiMsg]);
    setLoading(true);

    try {
      const history = [...messages, userMsg].map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      }));

      const response = await fetch(`${API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          api_key: apiKey,
          model: 'gpt-4o',
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Request failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.delta) {
  accumulated += parsed.delta;
  setMessages(prev =>
    prev.map(m => m.id === aiMsgId ? { ...m, content: accumulated } : m)
  );
}
if (parsed.error) {
  throw new Error(parsed.error);
}
            } catch {}
          }
        }
      }

      // Mark streaming done
      setMessages(prev =>
        prev.map(m => m.id === aiMsgId ? { ...m, streaming: false } : m)
      );
    } catch (err) {
      setMessages(prev => prev.filter(m => m.id !== aiMsgId));
      setError(err.message || 'Failed to reach MetroAI. Check your API key and backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setMessages([{
      role: 'assistant',
      content: "Conversation cleared. How can I assist you with the metro network?",
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      id: Date.now(),
    }]);
  };

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  };

  return (
    <div className="ai-page">
      {/* Header */}
      <div className="ai-header">
        <div className="ai-header-left">
          <div className="ai-avatar-large">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="ai-title">Metro<span className="text-gold">AI</span></h1>
            <p className="ai-subtitle">Powered by GPT-4o · Real-time network intelligence</p>
          </div>
        </div>
        <div className="ai-header-actions">
          <div className={`ai-status ${loading ? 'thinking' : 'ready'}`}>
            <span className="ai-status-dot" />
            {loading ? 'Thinking...' : 'Ready'}
          </div>
          <button className="icon-btn" onClick={handleReset} title="New conversation">
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        className="messages-container"
        ref={messagesContainerRef}
        onScroll={handleScroll}
      >
        <div className="messages-inner">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}

          {loading && messages[messages.length - 1]?.streaming === true && (
            <div className="typing-indicator">
              <span />
              <span />
              <span />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Scroll to bottom button */}
      {showScroll && (
        <button className="scroll-btn" onClick={() => scrollToBottom()}>
          <ChevronDown size={16} />
        </button>
      )}

      {/* Error */}
      {error && (
        <div className="ai-error">
          <AlertCircle size={14} />
          <span>{error}</span>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {/* Suggestions (show only when 1 message) */}
      {messages.length <= 1 && !loading && (
        <div className="suggestions-row">
          {SUGGESTIONS.slice(0, 3).map((s, i) => (
            <button key={i} className="suggestion-chip" onClick={() => handleSend(s)}>
              <Zap size={12} />
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="input-area">
        <div className="input-wrap">
          <textarea
            ref={textareaRef}
            className="chat-input"
            placeholder="Ask MetroAI about train status, delays, passengers, revenue..."
            value={input}
            onChange={(e) => { setInput(e.target.value); autoResize(); }}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={loading}
          />
          <button
            className={`send-btn ${input.trim() && !loading ? 'active' : ''}`}
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
          >
            <Send size={16} />
          </button>
        </div>
        <p className="input-hint">Enter to send · Shift+Enter for new line · Powered by OpenAI GPT-4o</p>
      </div>
    </div>
  );
}
