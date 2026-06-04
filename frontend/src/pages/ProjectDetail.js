import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectAPI, bidAPI, submissionAPI, paymentAPI } from '../api/services';
import { Clock, DollarSign, User, Gavel, Send, CheckCircle, XCircle, Upload, Link as LinkIcon, Star } from 'lucide-react';

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [bids, setBids] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('details');
  const [bidForm, setBidForm] = useState({ amount: '', proposal: '', deliveryDays: '' });
  const [subForm, setSubForm] = useState({ description: '', githubUrl: '', liveUrl: '' });
  const [bidError, setBidError] = useState('');
  const [subError, setSubError] = useState('');
  const [bidLoading, setBidLoading] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => { loadAll(); }, [id]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [projRes, bidsRes, subRes] = await Promise.all([
        projectAPI.getById(id),
        bidAPI.getForProject(id),
        submissionAPI.getForProject(id)
      ]);
      setProject(projRes.data);
      setBids(bidsRes.data);
      setSubmissions(subRes.data);
    } catch { navigate('/projects'); }
    finally { setLoading(false); }
  };

  const handleBid = async (e) => {
    e.preventDefault();
    setBidError(''); setBidLoading(true);
    try {
      await bidAPI.place(id, bidForm);
      setSuccess('Bid placed successfully!');
      setBidForm({ amount: '', proposal: '', deliveryDays: '' });
      loadAll();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setBidError(err.response?.data?.message || 'Failed to place bid');
    } finally { setBidLoading(false); }
  };

  const handleAcceptBid = async (bidId) => {
    try {
      await bidAPI.accept(bidId);
      setSuccess('Bid accepted! Project is now in progress.');
      loadAll();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept bid');
    }
  };

  const handleRejectBid = async (bidId) => {
    try {
      await bidAPI.reject(bidId);
      loadAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject bid');
    }
  };

  const handleSubmitWork = async (e) => {
    e.preventDefault();
    setSubError(''); setSubLoading(true);
    try {
      await submissionAPI.submit(id, subForm);
      setSuccess('Work submitted successfully!');
      setSubForm({ description: '', githubUrl: '', liveUrl: '' });
      loadAll();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setSubError(err.response?.data?.message || 'Failed to submit work');
    } finally { setSubLoading(false); }
  };

  const handleReviewSubmission = async (subId, status, feedback = '') => {
    try {
      await submissionAPI.review(subId, { status, feedback });
      setSuccess(`Submission ${status.toLowerCase()}!`);
      loadAll();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to review submission');
    }
  };

  const handleInitiatePayment = async () => {
    setPayLoading(true);
    try {
      await paymentAPI.initiate({ projectId: id, amount: project.budget });
      setSuccess('Payment placed in escrow!');
      loadAll();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to initiate payment');
    } finally { setPayLoading(false); }
  };

  if (loading) return (
    <div>
      <div className="skeleton" style={{ height: 200, borderRadius: 16, marginBottom: 24 }} />
      <div className="skeleton" style={{ height: 300, borderRadius: 16 }} />
    </div>
  );

  if (!project) return null;

  const isClient = user?.role === 'CLIENT' && project.clientId === user?.id;
  const isStudent = user?.role === 'STUDENT';
  const isAssigned = project.assignedStudentId === user?.id;
  const myBid = bids.find(b => b.studentId === user?.id);
  const statusColor = { OPEN:'#10b981', IN_PROGRESS:'#6366f1', COMPLETED:'#64748b', CANCELLED:'#ef4444' };
  const tabs = [
    { key: 'details', label: 'Details' },
    ...(isClient || user?.role === 'ADMIN' ? [{ key: 'bids', label: `Bids (${bids.length})` }] : []),
    { key: 'submissions', label: `Submissions (${submissions.length})` },
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {success && <div className="alert alert-success">{success}</div>}

      {/* Header */}
      <div className="card" style={{ padding: 28, marginBottom: 24, animation: 'slideUp 0.4s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <span className={`badge badge-${project.status?.toLowerCase()}`} style={{ marginBottom: 12 }}>
              {project.status?.replace('_', ' ')}
            </span>
            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>{project.title}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              Posted by <strong>{project.clientName}</strong> · {new Date(project.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Budget</p>
            <p style={{ fontSize: 32, fontWeight: 800, color: 'var(--primary)' }}>₹{project.budget?.toLocaleString()}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 20, marginTop: 20, flexWrap: 'wrap' }}>
          {project.category && (
            <span style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
              📁 {project.category}
            </span>
          )}
          {project.deadline && (
            <span style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={14} /> Due {new Date(project.deadline).toLocaleDateString()}
            </span>
          )}
          <span style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Gavel size={14} /> {project.bidCount || bids.length} bids
          </span>
        </div>

        {project.requiredSkills && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
            {project.requiredSkills.split(',').filter(Boolean).map(s => (
              <span key={s} style={{
                padding: '4px 12px', background: 'var(--primary-light)',
                color: 'var(--primary)', borderRadius: 20, fontSize: 12, fontWeight: 600
              }}>{s.trim()}</span>
            ))}
          </div>
        )}

        {/* Client actions */}
        {isClient && project.status === 'IN_PROGRESS' && (
          <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
            <button className="btn btn-success" onClick={handleInitiatePayment} disabled={payLoading}>
              <DollarSign size={16} /> {payLoading ? 'Processing...' : 'Pay to Escrow (₹' + project.budget + ')'}
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#fff', padding: 6, borderRadius: 12, border: '1px solid var(--border)' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, padding: '10px 16px', border: 'none', borderRadius: 8,
            background: tab === t.key ? 'var(--primary)' : 'transparent',
            color: tab === t.key ? '#fff' : 'var(--text-muted)',
            fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s',
            fontFamily: 'Inter, sans-serif'
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Details tab */}
      {tab === 'details' && (
        <div className="card" style={{ padding: 28, animation: 'fadeIn 0.3s ease' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Project Description</h2>
          <p style={{ color: 'var(--text)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{project.description}</p>

          {/* Student: Place bid */}
          {isStudent && project.status === 'OPEN' && !myBid && (
            <div style={{ marginTop: 32, padding: 24, background: 'var(--primary-light)', borderRadius: 16, border: '1px solid var(--primary)' }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16, color: 'var(--primary)' }}>Place Your Bid</h3>
              {bidError && <div className="alert alert-error">{bidError}</div>}
              <form onSubmit={handleBid}>
                <div className="grid-2" style={{ marginBottom: 16 }}>
                  <div>
                    <label className="label">Your Bid Amount (₹)</label>
                    <input className="input" type="number" placeholder="e.g. 5000" required min="1"
                      value={bidForm.amount} onChange={e => setBidForm({ ...bidForm, amount: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Delivery Days</label>
                    <input className="input" type="number" placeholder="e.g. 7" min="1"
                      value={bidForm.deliveryDays} onChange={e => setBidForm({ ...bidForm, deliveryDays: e.target.value })} />
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label className="label">Your Proposal</label>
                  <textarea className="input" rows={4} placeholder="Explain why you're the best fit for this project..."
                    required value={bidForm.proposal} onChange={e => setBidForm({ ...bidForm, proposal: e.target.value })} />
                </div>
                <button type="submit" className="btn btn-primary" disabled={bidLoading}>
                  <Gavel size={16} /> {bidLoading ? 'Submitting...' : 'Submit Bid'}
                </button>
              </form>
            </div>
          )}

          {/* My existing bid */}
          {isStudent && myBid && (
            <div style={{ marginTop: 24, padding: 20, background: '#f0fdf4', borderRadius: 12, border: '1px solid #86efac' }}>
              <h3 style={{ fontWeight: 700, color: '#16a34a', marginBottom: 8 }}>✅ Your Bid Submitted</h3>
              <p>Amount: <strong>₹{myBid.amount}</strong> · Status: <span className={`badge badge-${myBid.status?.toLowerCase()}`}>{myBid.status}</span></p>
              <p style={{ marginTop: 8, fontSize: 13, color: 'var(--text-muted)' }}>{myBid.proposal}</p>
            </div>
          )}

          {/* Student: Submit work */}
          {isStudent && isAssigned && project.status === 'IN_PROGRESS' && (
            <div style={{ marginTop: 28, padding: 24, background: 'var(--primary-light)', borderRadius: 16, border: '1px solid var(--primary)' }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16, color: 'var(--primary)' }}>Submit Your Work</h3>
              {subError && <div className="alert alert-error">{subError}</div>}
              <form onSubmit={handleSubmitWork}>
                <div style={{ marginBottom: 14 }}>
                  <label className="label">Work Description</label>
                  <textarea className="input" rows={4} placeholder="Describe what you've built..." required
                    value={subForm.description} onChange={e => setSubForm({ ...subForm, description: e.target.value })} />
                </div>
                <div className="grid-2" style={{ marginBottom: 14 }}>
                  <div>
                    <label className="label">GitHub Repository URL</label>
                    <input className="input" type="url" placeholder="https://github.com/..."
                      value={subForm.githubUrl} onChange={e => setSubForm({ ...subForm, githubUrl: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Live Demo URL</label>
                    <input className="input" type="url" placeholder="https://yourapp.com"
                      value={subForm.liveUrl} onChange={e => setSubForm({ ...subForm, liveUrl: e.target.value })} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={subLoading}>
                  <Upload size={16} /> {subLoading ? 'Submitting...' : 'Submit Work'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Bids tab */}
      {tab === 'bids' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeIn 0.3s ease' }}>
          {bids.length === 0 ? (
            <div className="empty-state card" style={{ padding: 48 }}>
              <Gavel size={48} />
              <h3>No bids yet</h3>
              <p>Bids from students will appear here</p>
            </div>
          ) : bids.map(bid => (
            <div key={bid.id} className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%', background: 'var(--primary-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--primary)', fontWeight: 700, fontSize: 16
                  }}>
                    {bid.studentName?.charAt(0)}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 15 }}>{bid.studentName}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Star size={12} color="#f59e0b" /> {bid.studentRating?.toFixed(1) || '0.0'} rating
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>₹{bid.amount?.toLocaleString()}</p>
                  {bid.deliveryDays && <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{bid.deliveryDays} days</p>}
                </div>
              </div>

              <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.7, marginBottom: 16 }}>{bid.proposal}</p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className={`badge badge-${bid.status?.toLowerCase()}`}>{bid.status}</span>
                {isClient && project.status === 'OPEN' && bid.status === 'PENDING' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-success btn-sm" onClick={() => handleAcceptBid(bid.id)}>
                      <CheckCircle size={14} /> Accept
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleRejectBid(bid.id)}>
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submissions tab */}
      {tab === 'submissions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeIn 0.3s ease' }}>
          {submissions.length === 0 ? (
            <div className="empty-state card" style={{ padding: 48 }}>
              <Upload size={48} />
              <h3>No submissions yet</h3>
              <p>Work submissions will appear here</p>
            </div>
          ) : submissions.map(sub => (
            <div key={sub.id} className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15 }}>{sub.studentName}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(sub.createdAt).toLocaleString()}</p>
                </div>
                <span className={`badge badge-${sub.status?.toLowerCase()}`}>{sub.status}</span>
              </div>

              <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.7, marginBottom: 12 }}>{sub.description}</p>

              <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                {sub.githubUrl && (
                  <a href={sub.githubUrl} target="_blank" rel="noopener noreferrer"
                    className="btn btn-outline btn-sm">
                    <LinkIcon size={13} /> GitHub
                  </a>
                )}
                {sub.liveUrl && (
                  <a href={sub.liveUrl} target="_blank" rel="noopener noreferrer"
                    className="btn btn-outline btn-sm">
                    <LinkIcon size={13} /> Live Demo
                  </a>
                )}
              </div>

              {sub.feedback && (
                <div style={{ padding: 12, background: '#f8fafc', borderRadius: 10, marginBottom: 12, fontSize: 13 }}>
                  <strong>Feedback:</strong> {sub.feedback}
                </div>
              )}

              {isClient && sub.status === 'PENDING' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-success btn-sm" onClick={() => handleReviewSubmission(sub.id, 'APPROVED', 'Great work!')}>
                    <CheckCircle size={14} /> Approve
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => {
                    const fb = prompt('Enter revision feedback:');
                    if (fb) handleReviewSubmission(sub.id, 'REVISION_REQUESTED', fb);
                  }}>
                    Request Revision
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleReviewSubmission(sub.id, 'REJECTED', 'Does not meet requirements')}>
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
