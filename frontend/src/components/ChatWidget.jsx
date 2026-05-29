import { useState, useRef, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const ChatWidget = () => {
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m your AI onboarding assistant. Ask me anything about your onboarding process! 👋' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setIsLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/chatbot/ask', {
        query: text,
        user_id: user?.user_id
      });
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data.reply || res.data.answer || 'Sorry, I could not process that.'
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I\'m having trouble connecting. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if not logged in (AFTER all hooks)
  if (!user) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed', bottom: '24px', right: '24px',
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
          border: 'none', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', boxShadow: '0 4px 16px rgba(79, 110, 247, 0.4)',
          zIndex: 900, fontSize: '24px'
        }}
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: '92px', right: '24px',
          width: '380px', height: '500px',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '16px',
          display: 'flex', flexDirection: 'column',
          zIndex: 900, boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'rgba(79,110,247,0.06)'
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px'
            }}>🤖</div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '14px' }}>AI Assistant</div>
              <div style={{ fontSize: '11px', color: 'var(--color-success)' }}>● Online</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  maxWidth: '80%', padding: '10px 14px',
                  borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  background: msg.role === 'user' ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                  border: msg.role === 'user' ? 'none' : '1px solid var(--color-border)',
                  fontSize: '13px', lineHeight: '1.5', whiteSpace: 'pre-wrap'
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '12px 12px 12px 2px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--color-border)',
                  fontSize: '13px', color: 'var(--color-text-muted)'
                }}>
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--color-border)',
            display: 'flex', gap: '8px'
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              style={{
                flex: 1, padding: '8px 12px',
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px', color: 'var(--color-text)',
                fontSize: '13px', outline: 'none'
              }}
            />
            <button type="submit" disabled={isLoading || !input.trim()}
              style={{
                width: '36px', height: '36px', borderRadius: '8px',
                background: 'var(--color-primary)', border: 'none',
                color: 'white', display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer', fontSize: '14px'
              }}>
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
