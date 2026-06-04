import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { messageAPI } from '../api/services';
import { Send, MessageCircle, User } from 'lucide-react';

export default function Messages() {
  const { user } = useAuth();
  const [partners, setPartners] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    loadPartners();
    return () => clearInterval(pollRef.current);
  }, []);

  useEffect(() => {
    if (selectedUser) {
      loadConversation(selectedUser.id);
      clearInterval(pollRef.current);
      pollRef.current = setInterval(() => loadConversation(selectedUser.id), 5000);
    }
    return () => clearInterval(pollRef.current);
  }, [selectedUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadPartners = async () => {
    try {
      const res = await messageAPI.getPartners();
      setPartners(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadConversation = async (userId) => {
    setMsgLoading(true);
    try {
      const res = await messageAPI.getConversation(userId);
      setMessages(res.data);
    } catch (e) { console.error(e); }
    finally { setMsgLoading(false); }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedUser || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    // Optimistic update
    const tempMsg = { id: Date.now(), content: text, senderId: user.id, senderName: user.name, createdAt: new Date().toISOString(), isRead: false };
    setMessages(prev => [...prev, tempMsg]);
    try {
      await messageAPI.send({ receiverId: selectedUser.id, content: text });
      loadConversation(selectedUser.id);
      // Refresh partners for unread count update
      loadPartners();
    } catch (e) {
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
      alert('Failed to send message');
    } finally { setSending(false); }
  };

  const formatTime = (dt) => {
    const d = new Date(dt);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString();
  };

  return (
    <div>
      <div className="page-header">
        <h1>Messages</h1>
        <p>Chat with clients and students</p>
      </div>

      <div style={{ display: 'flex', gap: 20, height: 'calc(100vh - 240px)', minHeight: 500 }}>
        {/* Partner list */}
        <div className="card" style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 15 }}>
            Conversations
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 16 }}>
                {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 12, marginBottom: 10 }} />)}
              </div>
            ) : partners.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                <MessageCircle size={32} style={{ margin: '0 auto 8px', color: '#cbd5e1' }} />
                <p>No conversations yet</p>
                <p style={{ fontSize: 12, marginTop: 4 }}>Accept a bid or get hired to start chatting</p>
              </div>
            ) : partners.map(p => (
              <div key={p.id} onClick={() => setSelectedUser(p)} style={{
                padding: '14px 20px', cursor: 'pointer', transition: 'background 0.2s',
                background: selectedUser?.id === p.id ? 'var(--primary-light)' : 'transparent',
                borderLeft: selectedUser?.id === p.id ? '3px solid var(--primary)' : '3px solid transparent',
                display: 'flex', alignItems: 'center', gap: 12
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: 16
                }}>
                  {p.name?.charAt(0)}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <p style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat panel */}
        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {!selectedUser ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <MessageCircle size={56} style={{ color: '#cbd5e1', marginBottom: 16 }} />
              <h3 style={{ fontWeight: 600, fontSize: 18, color: 'var(--text)' }}>Select a conversation</h3>
              <p style={{ fontSize: 14, marginTop: 6 }}>Choose a contact from the left to start chatting</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: 16
                }}>
                  {selectedUser.name?.charAt(0)}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15 }}>{selectedUser.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selectedUser.role}</p>
                </div>
              </div>

              {/* Messages area */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {msgLoading && messages.length === 0 ? (
                  <div className="spinner" />
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
                    <p>No messages yet. Say hi!</p>
                  </div>
                ) : messages.map((msg) => {
                  const isMe = msg.senderId === user?.id;
                  return (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', gap: 8 }}>
                      {!isMe && (
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                          background: 'var(--primary-light)', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', color: 'var(--primary)', fontWeight: 700, fontSize: 14
                        }}>
                          {msg.senderName?.charAt(0)}
                        </div>
                      )}
                      <div style={{ maxWidth: '72%' }}>
                        <div style={{
                          padding: '10px 16px', borderRadius: 16, fontSize: 14, lineHeight: 1.6,
                          background: isMe ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#f1f5f9',
                          color: isMe ? '#fff' : 'var(--text)',
                          borderBottomRightRadius: isMe ? 4 : 16,
                          borderBottomLeftRadius: isMe ? 16 : 4,
                        }}>
                          {msg.content}
                        </div>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, textAlign: isMe ? 'right' : 'left' }}>
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 12 }}>
                <input className="input" placeholder={`Message ${selectedUser.name}...`}
                  value={input} onChange={e => setInput(e.target.value)}
                  style={{ flex: 1, borderRadius: 24 }} />
                <button type="submit" className="btn btn-primary" disabled={!input.trim() || sending}
                  style={{ borderRadius: 24, padding: '10px 20px' }}>
                  <Send size={16} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
