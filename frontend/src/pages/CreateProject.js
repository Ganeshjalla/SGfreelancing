import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectAPI } from '../api/services';
import { PlusCircle, ArrowRight } from 'lucide-react';

const CATEGORIES = ['Web Development', 'Mobile App', 'UI/UX Design', 'Data Science', 'Machine Learning', 'DevOps', 'Content Writing', 'Digital Marketing', 'Other'];

export default function CreateProject() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', budget: '', category: '',
    requiredSkills: '', deadline: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const payload = {
        ...form,
        budget: parseFloat(form.budget),
        deadline: form.deadline ? new Date(form.deadline).toISOString().slice(0,19) : null
      };
      const res = await projectAPI.create(payload);
      navigate(`/projects/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally { setLoading(false); }
  };

  const f = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="page-header">
        <h1>Post a New Project</h1>
        <p>Describe your project and get bids from talented students</p>
      </div>

      <div className="card" style={{ padding: 32, animation: 'slideUp 0.4s ease' }}>
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label className="label">Project Title *</label>
            <input className="input" placeholder="e.g. Build a React E-commerce Website" required
              value={form.title} onChange={e => f('title', e.target.value)} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label className="label">Description *</label>
            <textarea className="input" rows={6}
              placeholder="Describe your project in detail. What do you need? What technologies? What outcome do you expect?"
              required value={form.description} onChange={e => f('description', e.target.value)} />
          </div>

          <div className="grid-2" style={{ marginBottom: 20 }}>
            <div>
              <label className="label">Budget (₹) *</label>
              <input className="input" type="number" placeholder="e.g. 10000" required min="1"
                value={form.budget} onChange={e => f('budget', e.target.value)} />
            </div>
            <div>
              <label className="label">Category *</label>
              <select className="input" required value={form.category} onChange={e => f('category', e.target.value)}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom: 20 }}>
            <div>
              <label className="label">Required Skills</label>
              <input className="input" placeholder="e.g. React, Node.js, MySQL"
                value={form.requiredSkills} onChange={e => f('requiredSkills', e.target.value)} />
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Comma separated</p>
            </div>
            <div>
              <label className="label">Deadline</label>
              <input className="input" type="datetime-local"
                value={form.deadline} onChange={e => f('deadline', e.target.value)}
                min={new Date().toISOString().slice(0, 16)} />
            </div>
          </div>

          {/* Preview card */}
          {form.title && (
            <div style={{ padding: 20, background: 'var(--bg)', borderRadius: 12, marginBottom: 24, border: '1px dashed var(--border)' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Preview</p>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{form.title}</h3>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {form.budget && <span style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 700 }}>₹{parseFloat(form.budget).toLocaleString()}</span>}
                {form.category && <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>📁 {form.category}</span>}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? (
                <><span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} /> Posting...</>
              ) : (
                <><PlusCircle size={16} /> Post Project</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
