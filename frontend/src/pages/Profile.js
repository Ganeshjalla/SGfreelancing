import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../api/services';
import { User, Mail, Star, Edit2, Save, X } from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', bio: '', skills: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const [profRes, revRes] = await Promise.all([
        userAPI.getProfile(),
        userAPI.getReviews(user.id)
      ]);
      setProfile(profRes.data);
      setReviews(revRes.data);
      setForm({ name: profRes.data.name || '', bio: profRes.data.bio || '', skills: profRes.data.skills || '' });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await userAPI.updateProfile(form);
      setProfile(res.data);
      updateUser({ name: res.data.name });
      setEditing(false);
      setSuccess('Profile updated!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="spinner" />;

  const stars = (n) => Array.from({ length: 5 }, (_, i) => (
    <Star key={i} size={14} color={i < Math.round(n) ? '#f59e0b' : '#e2e8f0'} fill={i < Math.round(n) ? '#f59e0b' : 'none'} />
  ));

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your personal information and view your ratings</p>
      </div>

      {success && <div className="alert alert-success">{success}</div>}

      <div className="card" style={{ padding: 32, marginBottom: 24, animation: 'slideUp 0.4s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 28, fontWeight: 800
            }}>
              {profile?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800 }}>{profile?.name}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{profile?.email}</p>
              <span style={{
                display: 'inline-block', marginTop: 6, padding: '3px 12px', borderRadius: 20,
                background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700, fontSize: 12
              }}>{profile?.role}</span>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => { editing ? handleSave() : setEditing(true); }}>
            {editing ? <><Save size={14} /> Save</> : <><Edit2 size={14} /> Edit</>}
          </button>
        </div>

        {/* Stats row */}
        <div className="grid-3" style={{ marginBottom: 28 }}>
          <div style={{ textAlign: 'center', padding: 16, background: 'var(--bg)', borderRadius: 12 }}>
            <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)' }}>₹{(profile?.walletBalance || 0).toFixed(2)}</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Wallet Balance</p>
          </div>
          <div style={{ textAlign: 'center', padding: 16, background: 'var(--bg)', borderRadius: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginBottom: 4 }}>
              {stars(profile?.rating || 0)}
            </div>
            <p style={{ fontSize: 20, fontWeight: 800 }}>{(profile?.rating || 0).toFixed(1)}</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{profile?.totalRatings} reviews</p>
          </div>
          <div style={{ textAlign: 'center', padding: 16, background: 'var(--bg)', borderRadius: 12 }}>
            <p style={{ fontSize: 28, fontWeight: 800 }}>{new Date(profile?.createdAt).getFullYear()}</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Member Since</p>
          </div>
        </div>

        {/* Edit form */}
        {editing ? (
          <div>
            <div style={{ marginBottom: 16 }}>
              <label className="label">Full Name</label>
              <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label className="label">Bio</label>
              <textarea className="input" rows={3} placeholder="Tell others about yourself..."
                value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label className="label">Skills (comma separated)</label>
              <input className="input" placeholder="React, Node.js, Python..."
                value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <div>
            {profile?.bio && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>BIO</p>
                <p style={{ fontSize: 15, lineHeight: 1.7 }}>{profile.bio}</p>
              </div>
            )}
            {profile?.skills && (
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>SKILLS</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {profile.skills.split(',').filter(Boolean).map(s => (
                    <span key={s} style={{
                      padding: '5px 14px', background: 'var(--primary-light)',
                      color: 'var(--primary)', borderRadius: 20, fontSize: 13, fontWeight: 600
                    }}>{s.trim()}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="card" style={{ padding: 28, animation: 'slideUp 0.4s ease 0.2s both' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Reviews ({reviews.length})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {reviews.map(r => (
              <div key={r.id} style={{ padding: 18, background: 'var(--bg)', borderRadius: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <p style={{ fontWeight: 600 }}>{r.reviewerName}</p>
                  <div style={{ display: 'flex', gap: 2 }}>{stars(r.rating)}</div>
                </div>
                <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}>{r.comment}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                  Project: {r.projectTitle} · {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
