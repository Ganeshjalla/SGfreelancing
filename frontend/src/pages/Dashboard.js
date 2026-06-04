import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectAPI, bidAPI, paymentAPI, adminAPI, userAPI } from '../api/services';
import { FolderOpen, Gavel, CreditCard, TrendingUp, Plus, ArrowRight, Star, Clock, CheckCircle } from 'lucide-react';

function StatCard({ icon: Icon, label, value, color, sub, delay = 0 }) {
  return (
    <div className="card" style={{ padding: 24, animation: `slideUp 0.5s ease ${delay}s both` }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8 }}>{label}</p>
          <p style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)' }}>{value}</p>
          {sub && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</p>}
        </div>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Icon size={22} color={color} />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const [stats, setStats] = useState({});
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      if (user?.role === 'ADMIN') {
        const res = await adminAPI.getStats();
        setStats(res.data);
        const proj = await adminAPI.getProjects();
        setRecentProjects(proj.data.slice(0, 5));
      } else if (user?.role === 'CLIENT') {
        const [myProj, myPay, profile] = await Promise.all([
          projectAPI.getMy(),
          paymentAPI.getMy(),
          userAPI.getProfile()
        ]);
        updateUser({ walletBalance: profile.data.walletBalance });
        setStats({
          totalProjects: myProj.data.length,
          activeProjects: myProj.data.filter(p => p.status === 'IN_PROGRESS').length,
          completedProjects: myProj.data.filter(p => p.status === 'COMPLETED').length,
          totalSpent: myPay.data.filter(p => p.status === 'RELEASED').reduce((a, b) => a + b.amount, 0),
        });
        setRecentProjects(myProj.data.slice(0, 5));
      } else {
        const [myBids, myPay, profile] = await Promise.all([
          bidAPI.getMy(),
          paymentAPI.getMy(),
          userAPI.getProfile()
        ]);
        updateUser({ walletBalance: profile.data.walletBalance });
        setStats({
          totalBids: myBids.data.length,
          acceptedBids: myBids.data.filter(b => b.status === 'ACCEPTED').length,
          pendingBids: myBids.data.filter(b => b.status === 'PENDING').length,
          totalEarned: myPay.data.filter(p => p.status === 'RELEASED').reduce((a, b) => a + b.amount, 0),
        });
        setRecentProjects(myBids.data.slice(0, 5));
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const statusColor = s => ({
    OPEN: '#10b981', IN_PROGRESS: '#6366f1', COMPLETED: '#64748b',
    CANCELLED: '#ef4444', PENDING: '#f59e0b', ACCEPTED: '#10b981', REJECTED: '#ef4444'
  }[s] || '#64748b');

  if (loading) return (
    <div>
      <div className="page-header">
        <div className="skeleton" style={{ width: 280, height: 36, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: 200, height: 20 }} />
      </div>
      <div className="grid-4">
        {[1,2,3,4].map(i => <div key={i} className="skeleton card" style={{ height: 120 }} />)}
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>{greeting()}, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋</h1>
          <p>Here's what's happening on your platform today.</p>
        </div>
        {user?.role === 'CLIENT' && (
          <Link to="/create-project" className="btn btn-primary">
            <Plus size={16} /> Post Project
          </Link>
        )}
        {user?.role === 'STUDENT' && (
          <Link to="/projects" className="btn btn-primary">
            <FolderOpen size={16} /> Browse Projects
          </Link>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid-4" style={{ marginBottom: 32 }}>
        {user?.role === 'ADMIN' && <>
          <StatCard icon={FolderOpen} label="Total Projects" value={stats.totalProjects || 0} color="#6366f1" delay={0} />
          <StatCard icon={Clock} label="Open Projects" value={stats.openProjects || 0} color="#f59e0b" delay={0.1} />
          <StatCard icon={CheckCircle} label="Completed" value={stats.completedProjects || 0} color="#10b981" delay={0.2} />
          <StatCard icon={TrendingUp} label="Total Users" value={stats.totalUsers || 0} color="#8b5cf6" delay={0.3} />
        </>}
        {user?.role === 'CLIENT' && <>
          <StatCard icon={FolderOpen} label="My Projects" value={stats.totalProjects || 0} color="#6366f1" delay={0} />
          <StatCard icon={Clock} label="In Progress" value={stats.activeProjects || 0} color="#f59e0b" delay={0.1} />
          <StatCard icon={CheckCircle} label="Completed" value={stats.completedProjects || 0} color="#10b981" delay={0.2} />
          <StatCard icon={CreditCard} label="Total Spent" value={`₹${(stats.totalSpent || 0).toFixed(0)}`} color="#8b5cf6" delay={0.3}
            sub={`Wallet: ₹${(user?.walletBalance || 0).toFixed(2)}`} />
        </>}
        {user?.role === 'STUDENT' && <>
          <StatCard icon={Gavel} label="Total Bids" value={stats.totalBids || 0} color="#6366f1" delay={0} />
          <StatCard icon={Clock} label="Pending" value={stats.pendingBids || 0} color="#f59e0b" delay={0.1} />
          <StatCard icon={CheckCircle} label="Accepted" value={stats.acceptedBids || 0} color="#10b981" delay={0.2} />
          <StatCard icon={CreditCard} label="Earned" value={`₹${(stats.totalEarned || 0).toFixed(0)}`} color="#8b5cf6" delay={0.3}
            sub={`Wallet: ₹${(user?.walletBalance || 0).toFixed(2)}`} />
        </>}
      </div>

      {/* Wallet card for CLIENT */}
      {user?.role === 'CLIENT' && (
        <div className="card" style={{
          padding: 24, marginBottom: 24,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: '#fff', animation: 'slideUp 0.5s ease 0.4s both'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 13, opacity: 0.8 }}>Wallet Balance</p>
              <p style={{ fontSize: 36, fontWeight: 800 }}>₹{(user?.walletBalance || 0).toFixed(2)}</p>
              <p style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>Available to pay for projects</p>
            </div>
            <Link to="/transactions" style={{
              background: 'rgba(255,255,255,0.2)', padding: '10px 20px', borderRadius: 12,
              color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: 14,
              display: 'flex', alignItems: 'center', gap: 6
            }}>
              Add Funds <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}

      {/* Recent activity */}
      <div className="card" style={{ padding: 24, animation: 'slideUp 0.5s ease 0.5s both' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>
            {user?.role === 'STUDENT' ? 'Recent Bids' : 'Recent Projects'}
          </h2>
          <Link to={user?.role === 'STUDENT' ? '/my-bids' : '/my-projects'}
            style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {recentProjects.length === 0 ? (
          <div className="empty-state">
            <FolderOpen size={48} />
            <h3>Nothing here yet</h3>
            <p>{user?.role === 'STUDENT' ? 'Start bidding on projects' : 'Post your first project'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentProjects.map((item, i) => (
              <Link key={item.id}
                to={user?.role === 'STUDENT' ? `/projects/${item.projectId || item.id}` : `/projects/${item.id}`}
                style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 16px', borderRadius: 12, background: '#f8fafc',
                  border: '1px solid var(--border)', transition: 'all 0.2s',
                  animation: `slideUp 0.4s ease ${0.1 * i}s both`
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-light)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>
                      {item.title || item.projectTitle}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                      {item.budget ? `₹${item.budget}` : item.amount ? `Bid: ₹${item.amount}` : ''}
                    </p>
                  </div>
                  <span className={`badge badge-${(item.status || '').toLowerCase()}`}>
                    {item.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
