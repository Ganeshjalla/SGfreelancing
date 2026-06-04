import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectAPI } from '../api/services';
import { FolderOpen, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

export default function MyProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    projectAPI.getMy().then(res => setProjects(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'ALL' ? projects : projects.filter(p => p.status === filter);
  const statusFilters = ['ALL', 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

  return (
    <div>
      <div className="page-header">
        <h1>My Projects</h1>
        <p>Track all your projects in one place</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {statusFilters.map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: '7px 16px', borderRadius: 20, border: '1.5px solid',
            borderColor: filter === s ? 'var(--primary)' : 'var(--border)',
            background: filter === s ? 'var(--primary)' : '#fff',
            color: filter === s ? '#fff' : 'var(--text-muted)',
            fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
            fontFamily: 'Inter, sans-serif'
          }}>{s.replace('_', ' ')}</button>
        ))}
      </div>

      {loading ? (
        <div className="grid-2">{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 16 }} />)}</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state card" style={{ padding: 60 }}>
          <FolderOpen size={48} />
          <h3>No projects found</h3>
          <p>Your projects will appear here</p>
        </div>
      ) : (
        <div className="grid-2">
          {filtered.map((p, i) => (
            <Link key={p.id} to={`/projects/${p.id}`} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: 24, animation: `slideUp 0.4s ease ${i * 0.05}s both` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <span className={`badge badge-${p.status?.toLowerCase()}`}>{p.status?.replace('_', ' ')}</span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>₹{p.budget?.toLocaleString()}</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{p.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {p.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                  <span>{p.category}</span>
                  <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                </div>
                <div style={{ marginTop: 14, color: 'var(--primary)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  View Details <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
