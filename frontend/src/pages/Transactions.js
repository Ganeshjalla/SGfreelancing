import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { paymentAPI, userAPI } from '../api/services';
import { CreditCard, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, DollarSign } from 'lucide-react';

export default function Transactions() {
  const { user, updateUser } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addFunds, setAddFunds] = useState('');
  const [addingFunds, setAddingFunds] = useState(false);
  const [releaseLoading, setReleaseLoading] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [payRes, profileRes] = await Promise.all([paymentAPI.getMy(), userAPI.getProfile()]);
      setPayments(payRes.data);
      updateUser({ walletBalance: profileRes.data.walletBalance });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleAddFunds = async (e) => {
    e.preventDefault();
    if (!addFunds || parseFloat(addFunds) <= 0) return;
    setAddingFunds(true); setError('');
    try {
      const res = await userAPI.addFunds(parseFloat(addFunds));
      updateUser({ walletBalance: res.data.walletBalance });
      setAddFunds('');
      setSuccess(`₹${addFunds} added to wallet!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add funds');
    } finally { setAddingFunds(false); }
  };

  const handleRelease = async (paymentId) => {
    setReleaseLoading(paymentId);
    try {
      await paymentAPI.release(paymentId);
      setSuccess('Payment released to student!');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to release payment');
    } finally { setReleaseLoading(null); }
  };

  const totalIn = payments.filter(p => p.status === 'RELEASED' && p.studentId === user?.id).reduce((a, b) => a + b.amount, 0);
  const totalOut = payments.filter(p => p.status === 'RELEASED' && p.clientId === user?.id).reduce((a, b) => a + b.amount, 0);

  return (
    <div>
      <div className="page-header">
        <h1>{user?.role === 'STUDENT' ? 'My Earnings' : 'Transactions'}</h1>
        <p>Manage your wallet and payment history</p>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Wallet summary */}
      <div className="grid-3" style={{ marginBottom: 28 }}>
        <div className="card" style={{ padding: 24, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', animation: 'slideUp 0.4s ease' }}>
          <p style={{ opacity: 0.8, fontSize: 13, marginBottom: 8 }}>Wallet Balance</p>
          <p style={{ fontSize: 32, fontWeight: 800 }}>₹{(user?.walletBalance || 0).toFixed(2)}</p>
        </div>
        <div className="card" style={{ padding: 24, animation: 'slideUp 0.4s ease 0.1s both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            {user?.role === 'STUDENT' ? <ArrowDownLeft size={20} color="#10b981" /> : <ArrowUpRight size={20} color="#ef4444" />}
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{user?.role === 'STUDENT' ? 'Total Earned' : 'Total Paid'}</p>
          </div>
          <p style={{ fontSize: 28, fontWeight: 800, color: user?.role === 'STUDENT' ? '#10b981' : '#ef4444' }}>
            ₹{(user?.role === 'STUDENT' ? totalIn : totalOut).toFixed(2)}
          </p>
        </div>
        <div className="card" style={{ padding: 24, animation: 'slideUp 0.4s ease 0.2s both' }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Total Transactions</p>
          <p style={{ fontSize: 28, fontWeight: 800 }}>{payments.length}</p>
        </div>
      </div>

      {/* Add funds (CLIENT only) */}
      {user?.role === 'CLIENT' && (
        <div className="card" style={{ padding: 24, marginBottom: 28, animation: 'slideUp 0.4s ease 0.3s both' }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>Add Funds to Wallet</h2>
          <form onSubmit={handleAddFunds} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#64748b' }}>₹</span>
                <input className="input" type="number" placeholder="Enter amount" min="1" step="0.01"
                  value={addFunds} onChange={e => setAddFunds(e.target.value)}
                  style={{ paddingLeft: 28 }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[500, 1000, 5000, 10000].map(amt => (
                <button key={amt} type="button" className="btn btn-ghost btn-sm" onClick={() => setAddFunds(String(amt))}>
                  ₹{amt.toLocaleString()}
                </button>
              ))}
            </div>
            <button type="submit" className="btn btn-primary" disabled={addingFunds || !addFunds}>
              <DollarSign size={16} /> {addingFunds ? 'Adding...' : 'Add Funds'}
            </button>
          </form>
        </div>
      )}

      {/* Transaction history */}
      <div className="card" style={{ padding: 24, animation: 'slideUp 0.4s ease 0.4s both' }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>Payment History</h2>

        {loading ? (
          <div>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12, marginBottom: 12 }} />)}</div>
        ) : payments.length === 0 ? (
          <div className="empty-state">
            <CreditCard size={48} />
            <h3>No transactions yet</h3>
            <p>Your payment history will appear here</p>
          </div>
        ) : payments.map((pay, i) => (
          <div key={pay.id} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '16px', borderRadius: 12, marginBottom: 10, background: '#f8fafc',
            border: '1px solid var(--border)', animation: `slideUp 0.4s ease ${i * 0.05}s both`,
            flexWrap: 'wrap', gap: 12
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: pay.status === 'RELEASED' ? '#dcfce7' : pay.status === 'ESCROW' ? '#dbeafe' : '#f3f4f6',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {pay.status === 'RELEASED' ? <CheckCircle size={22} color="#16a34a" /> :
                 pay.status === 'ESCROW' ? <Clock size={22} color="#1d4ed8" /> :
                 <CreditCard size={22} color="#64748b" />}
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: 14 }}>{pay.projectTitle}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {pay.clientName} → {pay.studentName} · {new Date(pay.createdAt).toLocaleDateString()}
                </p>
                {pay.transactionId && (
                  <p style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>{pay.transactionId}</p>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>₹{pay.amount?.toLocaleString()}</p>
                <span className={`badge badge-${pay.status?.toLowerCase()}`}>{pay.status}</span>
              </div>
              {user?.role === 'CLIENT' && pay.status === 'ESCROW' && (
                <button className="btn btn-success btn-sm" onClick={() => handleRelease(pay.id)}
                  disabled={releaseLoading === pay.id}>
                  {releaseLoading === pay.id ? 'Releasing...' : 'Release'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
