import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationAPI } from '../../api/services';
import {
  LayoutDashboard, FolderOpen, PlusCircle, Gavel, MessageCircle,
  CreditCard, User, Settings, LogOut, Bell, Menu, X, Shield,
  ChevronDown, Sparkles, Briefcase, Star
} from 'lucide-react';

const navItems = {
  CLIENT: [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
    { label: 'Browse Projects', icon: FolderOpen, to: '/projects' },
    { label: 'Post Project', icon: PlusCircle, to: '/create-project' },
    { label: 'My Projects', icon: Briefcase, to: '/my-projects' },
    { label: 'Messages', icon: MessageCircle, to: '/messages' },
    { label: 'Transactions', icon: CreditCard, to: '/transactions' },
    { label: 'Profile', icon: User, to: '/profile' },
  ],
  STUDENT: [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
    { label: 'Browse Projects', icon: FolderOpen, to: '/projects' },
    { label: 'My Bids', icon: Gavel, to: '/my-bids' },
    { label: 'My Work', icon: Briefcase, to: '/my-projects' },
    { label: 'Messages', icon: MessageCircle, to: '/messages' },
    { label: 'Earnings', icon: CreditCard, to: '/transactions' },
    { label: 'Profile', icon: User, to: '/profile' },
  ],
  ADMIN: [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
    { label: 'All Users', icon: User, to: '/admin/users' },
    { label: 'All Projects', icon: FolderOpen, to: '/admin/projects' },
    { label: 'Messages', icon: MessageCircle, to: '/messages' },
    { label: 'Profile', icon: User, to: '/profile' },
  ],
};

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  // ✅ FIX 1: Start as true on desktop so sidebar shows by default
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const items = navItems[user?.role] || [];

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handler(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ✅ FIX 2: Handle window resize — auto open on desktop, auto close on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.getAll();
      setNotifications(res.data.slice(0, 10));
      setUnreadCount(res.data.filter(n => !n.isRead).length);
    } catch {}
  };

  const handleMarkAllRead = async () => {
    await notificationAPI.markAllRead();
    setUnreadCount(0);
    setNotifications(n => n.map(x => ({ ...x, isRead: true })));
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const isActive = (path) => location.pathname === path;

  const isDesktop = window.innerWidth >= 1024;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside style={{
        flexShrink: 0,
        background: 'linear-gradient(160deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
        display: 'flex', flexDirection: 'column',
        // ✅ FIX 3: Use sidebarOpen state directly (no more CSS override needed)
        position: isDesktop ? 'relative' : 'fixed',
        top: 0,
        bottom: 0,
        zIndex: 200,

        width: sidebarOpen
            ? 'var(--sidebar-w)'
            : (isDesktop ? '0px' : 'var(--sidebar-w)'),

        overflow: 'hidden',

        left: !isDesktop && !sidebarOpen
            ? 'calc(-1 * var(--sidebar-w))'
            : 0,

        transition: 'width 0.3s ease, left 0.3s ease',
      }}>

        {/* Logo */}
        <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg, #818cf8, #c084fc)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'float 3s ease-in-out infinite'
            }}>
              <Sparkles size={20} color="#fff" />
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 18, letterSpacing: '-0.5px' }}>SGnexasoft</div>
              <div style={{ color: '#a5b4fc', fontSize: 11, fontWeight: 500 }}>Freelance Platform</div>
            </div>
          </div>
        </div>

        {/* User info */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'linear-gradient(135deg, #818cf8, #c084fc)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 16
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
              <div style={{ color: '#a5b4fc', fontSize: 12 }}>{user?.role}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 12px', overflowY: 'auto' }}>
          {items.map(item => {
            const Icon = item.icon;
            const active = isActive(item.to);
            return (
              <Link key={item.to} to={item.to}
                onClick={() => { if (!isDesktop) setSidebarOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', borderRadius: 10, marginBottom: 4,
                  textDecoration: 'none', transition: 'all 0.2s',
                  background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                  color: active ? '#fff' : '#a5b4fc',
                  fontWeight: active ? 600 : 500, fontSize: 14,
                  borderLeft: active ? '3px solid #818cf8' : '3px solid transparent',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: 10, width: '100%',
            padding: '10px 14px', borderRadius: 10, border: 'none',
            background: 'rgba(239,68,68,0.15)', color: '#fca5a5',
            fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s'
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.25)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
          >
            <LogOut size={18} />Logout
          </button>
          <div style={{ textAlign: 'center', marginTop: 16, color: '#6366f1', fontSize: 11 }}>
            © 2026 SGnexasoft · by Ganesh Jalla
          </div>
        </div>
      </aside>

      {/* Overlay for mobile — closes sidebar when clicking outside */}
      {sidebarOpen && !isDesktop && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 199 }}
        />
      )}

      {/* ── Main Content ─────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Topbar */}
        <header style={{
          background: '#fff', borderBottom: '1px solid var(--border)',
          padding: '0 24px', height: 64, display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 100,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
        }}>

          {/* ✅ FIX 4: Toggle (not just open) + show X when open */}
          <button
            onClick={() => setSidebarOpen(prev => !prev)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 8,
              borderRadius: 8, color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Wallet */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
              background: 'var(--primary-light)', borderRadius: 20
            }}>
              <CreditCard size={15} color="var(--primary)" />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>
                ₹{(user?.walletBalance || 0).toFixed(2)}
              </span>
            </div>

            {/* Notifications */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button onClick={() => setNotifOpen(!notifOpen)} style={{
                position: 'relative', background: 'none', border: 'none',
                cursor: 'pointer', padding: 8, borderRadius: 8,
                color: 'var(--text-muted)', transition: 'background 0.2s'
              }}>
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: 4, right: 4, width: 16, height: 16,
                    background: '#ef4444', color: '#fff', borderRadius: '50%',
                    fontSize: 10, fontWeight: 700, display: 'flex',
                    alignItems: 'center', justifyContent: 'center'
                  }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </button>
              {notifOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: '100%', marginTop: 8,
                  width: 340, background: '#fff', borderRadius: 16,
                  border: '1px solid var(--border)', boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
                  zIndex: 200, animation: 'slideUp 0.2s ease', overflow: 'hidden'
                }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>Notifications</span>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} style={{
                        fontSize: 12, color: 'var(--primary)', background: 'none',
                        border: 'none', cursor: 'pointer', fontWeight: 600
                      }}>Mark all read</button>
                    )}
                  </div>
                  <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                        No notifications yet
                      </div>
                    ) : notifications.map(n => (
                      <div key={n.id} style={{
                        padding: '14px 20px', borderBottom: '1px solid var(--border)',
                        background: n.isRead ? '#fff' : '#f0f4ff', cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                        onClick={() => {
                          notificationAPI.markRead(n.id);
                          setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x));
                          setUnreadCount(c => Math.max(0, c - (n.isRead ? 0 : 1)));
                          if (n.link) { navigate(n.link); setNotifOpen(false); }
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 3 }}>{n.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{n.message}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Avatar */}
            <Link to="/profile" style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 15, textDecoration: 'none'
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '28px 28px', maxWidth: 1400, width: '100%', margin: '0 auto' }}>
          {children}
        </main>

        {/* Footer */}
        <footer style={{
          textAlign: 'center', padding: '16px', borderTop: '1px solid var(--border)',
          color: 'var(--text-muted)', fontSize: 13
        }}>
          © 2026 SGnexasoft · Developed by <strong>Ganesh Jalla</strong> · All rights reserved
        </footer>
      </div>
    </div>
  );
}