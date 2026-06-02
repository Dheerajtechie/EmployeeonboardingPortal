import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import axios from 'axios';
import { Zap, MessageSquare, ShieldAlert, Target, TrendingUp, AlertCircle, Bot } from 'lucide-react';

const AICopilot = () => {
  const { user } = useContext(AuthContext);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', content: 'Hello! I am your Enterprise HR Copilot. I analyze live Oracle data. What would you like to know about your operations?' }
  ]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const res = await api.get('/enterprise/ai-copilot/insights');
      setInsights(res.data.insights);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    const newHistory = [...chatHistory, { role: 'user', content: query }];
    setChatHistory(newHistory);
    setQuery('');
    
    try {
      const res = await axios.post('/chatbot/ask', { query: query, user_id: user?.user_id });
      setChatHistory([...newHistory, { role: 'ai', content: res.data.reply }]);
    } catch (err) {
      setChatHistory([...newHistory, { role: 'ai', content: 'Connection error while contacting the Oracle database.' }]);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Navbar />
        <main className="main-content animate-fade-in">
          <div className="page-header" style={{ marginBottom: '24px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ background: 'var(--color-primary)', padding: '8px', borderRadius: '8px', color: 'white', display: 'flex' }}>
                  <Bot size={24} />
                </div>
                <h1 style={{ margin: 0 }}>Enterprise AI Copilot</h1>
              </div>
              <p>Dynamic operational intelligence powered by live Oracle data</p>
            </div>
          </div>

          <div className="grid-2-1">
            <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '600px' }}>
              <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><MessageSquare size={18} /> Copilot Chat</h3>
              
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px', paddingRight: '8px' }}>
                {chatHistory.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '80%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: msg.role === 'user' ? 'var(--color-primary)' : 'rgba(255,255,255,0.04)',
                      color: msg.role === 'user' ? 'white' : 'var(--color-text)',
                      border: msg.role === 'user' ? 'none' : '1px solid var(--color-border)',
                      borderBottomLeftRadius: msg.role === 'ai' ? '2px' : '12px',
                      borderBottomRightRadius: msg.role === 'user' ? '2px' : '12px'
                    }}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleChat} style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Ask about risks, SLAs, or department bottlenecks..."
                  className="form-input"
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-primary">Ask</button>
              </form>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="card" style={{ background: 'var(--color-primary-light)', border: '1px solid var(--color-primary)' }}>
                <h3 style={{ marginBottom: '16px', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={18} /> Executive Summary
                </h3>
                {loading ? <p>Analyzing Oracle Data...</p> : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {insights?.map((insight, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <div style={{ marginTop: '2px', color: insight.type === 'Risk' ? 'var(--color-danger)' : insight.type === 'Operations' ? 'var(--color-warning)' : 'var(--color-success)' }}>
                          {insight.type === 'Risk' ? <ShieldAlert size={16} /> : insight.type === 'Operations' ? <Target size={16} /> : <TrendingUp size={16} />}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{insight.type}</div>
                          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>{insight.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="card">
                <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><AlertCircle size={18}/> Suggested Queries</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button onClick={() => setQuery('Which employees are at high risk?')} className="btn btn-secondary" style={{ textAlign: 'left', display: 'block', width: '100%' }}>Which employees are at risk?</button>
                  <button onClick={() => setQuery('Which department has the most delayed tasks?')} className="btn btn-secondary" style={{ textAlign: 'left', display: 'block', width: '100%' }}>Which department has the most delayed tasks?</button>
                  <button onClick={() => setQuery('Give me an SLA performance summary.')} className="btn btn-secondary" style={{ textAlign: 'left', display: 'block', width: '100%' }}>Give me an SLA performance summary.</button>
                </div>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default AICopilot;
