import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/services';
import { Sparkles, Mail, Lock, User, ArrowRight, Briefcase, GraduationCap } from 'lucide-react';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.role) { setError('Please select a role'); return; }
    setError(''); setLoading(true);
    try {
      const res = await authAPI.register(form);
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
      padding: 20
    }}>
      <div style={{
        width: '100%', maxWidth: 480, background: '#fff',
        borderRadius: 24, padding: '40px', boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
        animation: 'slideUp 0.5s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Sparkles size={22} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: '#1e293b' }}>SGNexasoft</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>Create your account</div>
          </div>
        </div>

        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1e293b', marginBottom: 6 }}>Get Started Free</h2>
        <p style={{ color: '#64748b', fontSize: 14, marginBottom: 28 }}>Join hundreds of students and clients today.</p>

        {/* Role selector */}
        <div style={{ marginBottom: 20 }}>
          <label className="label">I am a...</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { value: 'CLIENT', label: 'Client', desc: 'Post projects, hire talent', icon: Briefcase, color: '#6366f1' },
              { value: 'STUDENT', label: 'Student', desc: 'Bid on projects, earn money', icon: GraduationCap, color: '#10b981' },
            ].map(r => {
              const Icon = r.icon;
              const selected = form.role === r.value;
              return (
                <button key={r.value} type="button" onClick={() => setForm({ ...form, role: r.value })}
                  style={{
                    padding: 16, borderRadius: 12, border: '2px solid',
                    borderColor: selected ? r.color : 'var(--border)',
                    background: selected ? r.color + '10' : '#fff',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                    fontFamily: 'Inter, sans-serif'
                  }}>
                  <Icon size={22} color={selected ? r.color : '#94a3b8'} />
                  <div style={{ fontWeight: 700, fontSize: 14, color: selected ? r.color : '#1e293b', marginTop: 8 }}>{r.label}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{r.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}

          <div style={{ marginBottom: 16 }}>
            <label className="label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input className="input" type="text" placeholder="Your full name"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                required style={{ paddingLeft: 40 }} />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input className="input" type="email" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                required style={{ paddingLeft: 40 }} />
            </div>
          </div>

          <div style={{ marginBottom: 28 }}>
            <label className="label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input className="input" type="password" placeholder="Min. 6 characters"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                required minLength={6} style={{ paddingLeft: 40 }} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}
            style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? (
              <><span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} /> Creating account...</>
            ) : (
              <>Create Account <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, color: '#64748b', fontSize: 14 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#6366f1', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
        </p>
        <p style={{ textAlign: 'center', marginTop: 20, color: '#94a3b8', fontSize: 12 }}>
          © 2026 SGNexasoft · by Ganesh Jalla
        </p>
      </div>
    </div>
  );
}
