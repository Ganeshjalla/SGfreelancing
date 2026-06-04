import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/services';
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { label: 'Admin', email: 'admin@sg.com', password: 'admin123', role: 'ADMIN', color: '#ef4444' },
  { label: 'Client', email: 'client@sg.com', password: 'client123', role: 'CLIENT', color: '#6366f1' },
  { label: 'Student', email: 'student@sg.com', password: 'student123', role: 'STUDENT', color: '#10b981' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await authAPI.login(form);
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally { setLoading(false); }
  };

  const autofill = (acc) => setForm({ email: acc.email, password: acc.password });

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)'
    }}>
      {/* Left panel */}
      <div style={{
        flex: 1, display: 'none', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center', padding: 60, color: '#fff'
      }} className="left-panel">
        <div style={{ animation: 'float 3s ease-in-out infinite', marginBottom: 32 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 24,
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Sparkles size={40} color="#c4b5fd" />
          </div>
        </div>
        <h1 style={{ fontSize: 42, fontWeight: 800, marginBottom: 16, textAlign: 'center' }}>
          Welcome to<br /><span style={{ color: '#c4b5fd' }}>SGnexasoft</span>
        </h1>
        <p style={{ fontSize: 18, color: '#a5b4fc', textAlign: 'center', maxWidth: 380, lineHeight: 1.7 }}>
          Connect talented students with clients. Post projects, place bids, and grow together.
        </p>
        <div style={{ marginTop: 48, display: 'flex', gap: 16 }}>
          {[].map(stat => (
            <div key={stat} style={{
              padding: '12px 20px', background: 'rgba(255,255,255,0.1)',
              borderRadius: 12, textAlign: 'center', backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{stat}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - form */}
      <div style={{
        width: '100%', maxWidth: 480,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '40px 40px', background: '#fff',
        borderRadius: '0 0 0 0'
      }}>
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Sparkles size={22} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: '#1e293b' }}>SGnexasoft</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Freelance Platform</div>
            </div>
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', marginBottom: 8 }}>Sign in</h2>
          <p style={{ color: '#64748b', fontSize: 15 }}>Welcome back! Enter your credentials.</p>
        </div>

        {/* Demo accounts */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Quick Demo Access</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {DEMO_ACCOUNTS.map(acc => (
              <button key={acc.label} onClick={() => autofill(acc)} style={{
                flex: 1, padding: '8px 4px', borderRadius: 10, border: '2px solid',
                borderColor: acc.color + '40', background: acc.color + '10',
                color: acc.color, fontWeight: 700, fontSize: 12, cursor: 'pointer',
                transition: 'all 0.2s', fontFamily: 'Inter, sans-serif'
              }}
                onMouseEnter={e => { e.currentTarget.style.background = acc.color + '20'; e.currentTarget.style.borderColor = acc.color; }}
                onMouseLeave={e => { e.currentTarget.style.background = acc.color + '10'; e.currentTarget.style.borderColor = acc.color + '40'; }}
              >
                {acc.label}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>Click to autofill credentials</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-error" style={{ marginBottom: 20 }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ marginBottom: 18 }}>
            <label className="label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input className="input" type="email" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                required style={{ paddingLeft: 40 }} />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label className="label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input className="input" type={showPass ? 'text' : 'password'} placeholder="••••••••"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                required style={{ paddingLeft: 40, paddingRight: 40 }} />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8'
              }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}
            style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? (
              <><span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} /> Signing in...</>
            ) : (
              <>Sign In <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, color: '#64748b', fontSize: 14 }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#6366f1', fontWeight: 700, textDecoration: 'none' }}>Create one free</Link>
        </p>

        <p style={{ textAlign: 'center', marginTop: 32, color: '#94a3b8', fontSize: 12 }}>
          © 2026 SGnexasoft · by Ganesh Jalla
        </p>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .left-panel { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
