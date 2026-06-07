import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bidAPI } from '../api/services';
import { Gavel, ArrowRight } from 'lucide-react';

export default function MyBids() {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    bidAPI.getMy().then(res => setBids(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'ALL' ? bids : bids.filter(b => b.status === filter);

  return (
    <div>
      <div className="page-header">
        <h1>My Bids</h1>
        <p>Track all bids you've placed on projects</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{ padding: '7px 16px', borderRadius: 20, border: '1.5px solid', borderColor: filter === s ? 'var(--primary)' : 'var(--border)', background: filter === s ? 'var(--primary)' : '#fff', color: filter === s ? '#fff' : 'var(--text-muted)', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Inter, sans-serif' }}>{s}</button>
        ))}
      </div>

      {loading ? (
        <div>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16, marginBottom: 16 }} />)}</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state card" style={{ padding: 60 }}>
          <Gavel size={48} />
          <h3>No bids found</h3>
          <p>Start bidding on open projects to see them here</p>
          <Link to="/projects" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Projects</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map((bid, i) => (
            <div key={bid.id} className="card" style={{ padding: 24, animation: `slideUp 0.4s ease ${i * 0.05}s both` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <Link to={`/projects/${bid.projectId}`} style={{ textDecoration: 'none' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>{bid.projectTitle}</h3>
                  </Link>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{bid.proposal}</p>
                  <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                    <span>Placed: {new Date(bid.createdAt).toLocaleDateString()}</span>
                    {bid.deliveryDays && <span>⏱ {bid.deliveryDays} days</span>}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)', marginBottom: 8 }}>₹{bid.amount?.toLocaleString()}</p>
                  <span className={`badge badge-${bid.status?.toLowerCase()}`}>{bid.status}</span>
                </div>
              </div>
              <div style={{ marginTop: 14 }}>
                <Link to={`/projects/${bid.projectId}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  View Project <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
