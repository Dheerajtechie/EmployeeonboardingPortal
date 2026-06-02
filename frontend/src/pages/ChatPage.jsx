import { useState, useRef, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { MessageSquare, Send, Bot, User, Loader2, Sparkles, FileText, CheckSquare, Users } from 'lucide-react';
import axios from 'axios';

const SUGGESTIONS = [
  { icon: <FileText size={14} />, text: 'How to upload documents?' },
  { icon: <CheckSquare size={14} />, text: 'What should I do next?' },
  { icon: <Users size={14} />, text: 'Who is my buddy?' },
];

const ChatPage = () => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hello ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm your AI onboarding assistant. I can help you with:\n\n• Checking your pending tasks\n• Document upload guidance\n• Training information\n• Company policies\n• Asset allocation status\n\nHow can I help you today?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text) => {
    const message = text || input.trim();
    if (!message || isLoading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    setIsLoading(true);

    try {
      const res = await axios.post('/chatbot/ask', {
        query: message,
        user_id: user?.user_id
      });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply || res.data.answer || 'I could not process that request.' }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I\'m having trouble connecting right now. Please try again in a moment.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Navbar />
        <main className="main-content" style={{ display: 'flex', flexDirection: 'column', padding: '24px 32px', height: 'calc(100vh - var(--navbar-height))' }}>
          <div className="page-header" style={{ marginBottom: '16px' }}>
            <div>
              <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={24} color="var(--color-primary)" /> AI Assistant
              </h1>
              <p>Your AI-powered onboarding copilot</p>
            </div>
            <button onClick={() => { setMessages([messages[0]]); }} className="btn btn-secondary">New Chat</button>
          </div>

          {/* Chat Area */}
          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {messages.map((msg, i) => (
                <div key={i} style={{
                  display: 'flex',
                  gap: '12px',
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  animation: 'fadeIn 0.3s ease-out'
                }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                    background: msg.role === 'user' ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                  </div>
                  <div style={{
                    maxWidth: '70%',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    background: msg.role === 'user' ? 'var(--color-primary)' : 'var(--color-surface-alt)',
                    border: msg.role === 'user' ? 'none' : '1px solid var(--color-border)',
                    fontSize: '14px',
                    lineHeight: '1.7',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Bot size={18} />
                  </div>
                  <div style={{
                    padding: '14px 18px', borderRadius: '12px',
                    background: 'var(--color-surface-alt)',
                    border: '1px solid var(--color-border)',
                    display: 'flex', alignItems: 'center', gap: '8px',
                    fontSize: '14px', color: 'var(--color-text-muted)'
                  }}>
                    <Loader2 size={16} className="animate-spin" /> Thinking...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length <= 1 && (
              <div style={{ padding: '0 24px 16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} onClick={() => handleSend(s.text)}
                    className="btn btn-sm btn-secondary" style={{ fontSize: '13px' }}>
                    {s.icon} {s.text}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '12px' }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything..."
                className="form-input"
                style={{ flex: 1 }}
              />
              <button type="submit" disabled={isLoading || !input.trim()} className="btn btn-primary">
                Send <Send size={16} />
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChatPage;
