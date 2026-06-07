import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Bot, User, Minimize2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { aiAPI } from '../../api/services';

const SYSTEM_PROMPT = `You are SGnexasoft AI Assistant — a helpful, friendly assistant for the SGnexasoft freelance platform. Help users with: posting projects (CLIENT role), placing bids (STUDENT role), payment/escrow system, submitting work, messaging, and navigating the platform. Keep answers concise, friendly, and practical.`;

const QUICK_REPLIES = [
  'How do I post a project?',
  'How do I place a bid?',
  'How does payment work?',
  'How do I submit work?',
];

export default function AIChatBot() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hi ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm the SGNexasoft AI Assistant. How can I help you today?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const content = text || input.trim();
    if (!content || loading) return;
    setInput('');
    const userMsg = { role: 'user', content };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
      const res = await aiAPI.chat({ system: SYSTEM_PROMPT, messages: history });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting right now. Please try again in a moment!" }]);
    } finally { setLoading(false); }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <>
      <button onClick={() => setOpen(!open)} style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 999, width: 56, height: 56, borderRadius: '50%', border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', cursor: 'pointer', boxShadow: '0 8px 24px rgba(99,102,241,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease', animation: 'float 3s ease-in-out infinite' }} title="AI Assistant">
        {open ? <X size={22} /> : <Sparkles size={22} />}
      </button>

      {open && (
        <div style={{ position: 'fixed', bottom: 96, right: 28, zIndex: 998, width: 360, height: 500, background: '#fff', borderRadius: 20, boxShadow: '0 24px 60px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'slideUp 0.3s ease', border: '1px solid rgba(99,102,241,0.2)' }}>
          <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={20} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>SGnexasoft AI</div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>● Online — Powered by Claude</div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: '#fff' }}>
              <Minimize2 size={16} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {msg.role === 'assistant' && (
                  <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bot size={14} color="#fff" />
                  </div>
                )}
                <div style={{ maxWidth: '80%', padding: '10px 14px', borderRadius: 14, fontSize: 13, lineHeight: 1.5, background: msg.role === 'user' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#f1f5f9', color: msg.role === 'user' ? '#fff' : '#1e293b', borderBottomRightRadius: msg.role === 'user' ? 4 : 14, borderBottomLeftRadius: msg.role === 'assistant' ? 4 : 14 }}>
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={14} color="#64748b" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={14} color="#fff" />
                </div>
                <div style={{ background: '#f1f5f9', padding: '10px 16px', borderRadius: 14, display: 'flex', gap: 4 }}>
                  {[0, 0.2, 0.4].map((d, i) => (
                    <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#94a3b8', animation: 'pulse 1.2s ease-in-out infinite', animationDelay: `${d}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {messages.length <= 1 && (
            <div style={{ padding: '8px 16px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {QUICK_REPLIES.map(q => (
                <button key={q} onClick={() => send(q)} style={{ padding: '5px 10px', borderRadius: 20, border: '1px solid var(--border)', background: '#fff', fontSize: 11, cursor: 'pointer', fontWeight: 500, color: 'var(--primary)', transition: 'all 0.2s', fontFamily: 'Inter, sans-serif' }}>
                  {q}
                </button>
              ))}
            </div>
          )}

          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'center' }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey} placeholder="Ask me anything..." style={{ flex: 1, padding: '9px 14px', borderRadius: 20, border: '1.5px solid var(--border)', fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif', transition: 'border-color 0.2s' }}
              onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            <button onClick={() => send()} disabled={!input.trim() || loading} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: input.trim() && !loading ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#e2e8f0', color: input.trim() && !loading ? '#fff' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}>
              <Send size={15} />
            </button>
          </div>
          <div style={{ padding: 6, textAlign: 'center', fontSize: 10, color: '#94a3b8', borderTop: '1px solid var(--border)' }}>© 2026 SGnexasoft · by Ganesh Jalla</div>
        </div>
      )}
    </>
  );
}
