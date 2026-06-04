import React, { useEffect, useState } from 'react';
import { adminAPI } from '../api/services';
import { Users, FolderOpen, DollarSign, TrendingUp, Shield } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, projRes] = await Promise.all([
        adminAPI.getStats(), adminAPI.getUsers(), adminAPI.getProjects()
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setProjects(projRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const roleColor = r => ({ ADMIN: '#ef4444', CLIENT: '#6366f1', STUDENT: '#10b981' }[r] || '#64748b');

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Shield size={28} color="var(--primary)" />
        <div>
          <h1>Admin Dashboard</h1>
          <p>Full platform overview and management</p>
        </div>
      </div>

      {loading ? <div className="spinner" /> : (
        <>
          {/* Stats */}
          <div className="grid-4" style={{ marginBottom: 28 }}>
            {[
              { icon: Users, label: 'Total Users', val: stats?.totalUsers, color: '#6366f1' },
              { icon: FolderOpen, label: 'Total Projects', val: stats?.totalProjects, color: '#f59e0b' },
              { icon: TrendingUp, label: 'Open Projects', val: stats?.openProjects, color: '#10b981' },
              { icon: DollarSign, label: 'Payments Released', val: `₹${(stats?.totalPaymentsReleased || 0).toFixed(0)}`, color: '#8b5cf6' },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="card" style={{ padding: 24, animation: `slideUp 0.4s ease ${i * 0.1}s both` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>{s.label}</p>
                      <p style={{ fontSize: 30, fontWeight: 800 }}>{s.val}</p>
                    </div>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: s.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={22} color={s.color} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#fff', padding: 6, borderRadius: 12, border: '1px solid var(--border)', width: 'fit-content' }}>
            {['overview', 'users', 'projects'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '9px 20px', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14,
                cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Inter, sans-serif',
                background: tab === t ? 'var(--primary)' : 'transparent',
                color: tab === t ? '#fff' : 'var(--text-muted)',
                textTransform: 'capitalize'
              }}>{t}</button>
            ))}
          </div>

          {tab === 'users' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden', animation: 'fadeIn 0.3s ease' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 16 }}>
                All Users ({users.length})
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg)' }}>
                      {['Name', 'Email', 'Role', 'Wallet', 'Rating', 'Joined'].map(h => (
                        <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <tr key={u.id} style={{ borderTop: '1px solid var(--border)', transition: 'background 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 34, height: 34, borderRadius: '50%',
                              background: roleColor(u.role) + '20',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: roleColor(u.role), fontWeight: 700, fontSize: 14
                            }}>{u.name?.charAt(0)}</div>
                            <span style={{ fontWeight: 600 }}>{u.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: 13, color: 'var(--text-muted)' }}>{u.email}</td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                            background: roleColor(u.role) + '20', color: roleColor(u.role) }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px', fontWeight: 600 }}>₹{(u.walletBalance || 0).toFixed(0)}</td>
                        <td style={{ padding: '14px 20px' }}>⭐ {(u.rating || 0).toFixed(1)}</td>
                        <td style={{ padding: '14px 20px', fontSize: 13, color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'projects' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden', animation: 'fadeIn 0.3s ease' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 16 }}>
                All Projects ({projects.length})
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg)' }}>
                      {['Title', 'Client', 'Budget', 'Status', 'Created'].map(h => (
                        <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((p) => (
                      <tr key={p.id} style={{ borderTop: '1px solid var(--border)' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '14px 20px', fontWeight: 600 }}>{p.title}</td>
                        <td style={{ padding: '14px 20px', fontSize: 13, color: 'var(--text-muted)' }}>{p.clientName}</td>
                        <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--primary)' }}>₹{p.budget?.toLocaleString()}</td>
                        <td style={{ padding: '14px 20px' }}>
                          <span className={`badge badge-${p.status?.toLowerCase()}`}>{p.status?.replace('_',' ')}</span>
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: 13, color: 'var(--text-muted)' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'overview' && (
            <div className="grid-2">
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 16 }}>User Breakdown</h3>
                {[
                  { label: 'Clients', count: stats?.totalClients, color: '#6366f1' },
                  { label: 'Students', count: stats?.totalStudents, color: '#10b981' },
                ].map(r => (
                  <div key={r.label} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{r.label}</span>
                      <span style={{ fontWeight: 700 }}>{r.count || 0}</span>
                    </div>
                    <div style={{ height: 8, background: 'var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 10, background: r.color,
                        width: `${stats?.totalUsers ? ((r.count / stats.totalUsers) * 100) : 0}%`,
                        transition: 'width 1s ease'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Project Breakdown</h3>
                {[
                  { label: 'Open', count: stats?.openProjects, color: '#10b981' },
                  { label: 'Completed', count: stats?.completedProjects, color: '#6366f1' },
                ].map(r => (
                  <div key={r.label} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{r.label}</span>
                      <span style={{ fontWeight: 700 }}>{r.count || 0}</span>
                    </div>
                    <div style={{ height: 8, background: 'var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 10, background: r.color,
                        width: `${stats?.totalProjects ? ((r.count / stats.totalProjects) * 100) : 0}%`,
                        transition: 'width 1s ease'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
