import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Chatbot() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Assalamu alaikum. I am ITQAN, your AI Islamic Finance Advisor. How can I assist you with your financial decisions today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if(!input.trim()) return;

    setMessages(prev => [...prev, { sender: 'user', text: input }]);
    setInput('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('itqan_token');
      const res = await fetch('http://localhost:8080/api/ai/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: input, history: messages, userId: user.uid })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { sender: 'ai', text: data.reply || data.message }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Error connecting to the AI engine. Please ensure the backend server is running.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Shariah AI Advisor</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Ask questions related to Zakat, halal investments, and budget planning.</p>
      
      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
        
        {/* Chat History View */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '70%',
                padding: '16px',
                borderRadius: '16px',
                lineHeight: '1.5',
                background: msg.sender === 'user' ? 'var(--primary-color)' : 'var(--surface)',
                color: msg.sender === 'user' ? 'white' : 'var(--text-main)',
                boxShadow: msg.sender === 'ai' ? 'var(--glass-shadow)' : 'none',
                border: msg.sender === 'ai' ? '1px solid var(--glass-border)' : 'none',
                borderBottomRightRadius: msg.sender === 'user' ? '4px' : '16px',
                borderBottomLeftRadius: msg.sender === 'ai' ? '4px' : '16px',
              }}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{ padding: '16px', borderRadius: '16px', background: 'var(--surface)', color: 'var(--text-muted)' }}>
                ITQAN is typing...
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input box */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--glass-border)', background: 'var(--surface)' }}>
          <form onSubmit={handleSend} style={{ display: 'flex', gap: '12px' }}>
            <input 
              type="text" 
              className="input-field" 
              style={{ margin: 0, flex: 1 }} 
              placeholder="E.g., Is it halal to invest in bonds?" 
              value={input} 
              onChange={e => setInput(e.target.value)}
            />
            <button className="btn btn-primary" type="submit" disabled={isLoading}>Send Query</button>
          </form>
        </div>
      </div>
    </div>
  );
}
