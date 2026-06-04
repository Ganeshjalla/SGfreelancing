import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectAPI } from '../api/services';
import { Search, Filter, Clock, DollarSign, Tag, ArrowRight, FolderOpen } from 'lucide-react';

const CATEGORIES = ['All', 'Web Development', 'Mobile App', 'UI/UX Design', 'Data Science', 'Machine Learning', 'DevOps', 'Content Writing', 'Digital Marketing', 'Other'];

function ProjectCard({ project, delay = 0 }) {
  const daysLeft = project.deadline
    ? Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Link to={`/projects/${project.id}`} style={{ textDecoration: 'none' }}>
      <div className="card" style={{ padding: 24, animation: `slideUp 0.4s ease ${delay}s both`, cursor: 'pointer' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <span className="badge badge-open" style={{ fontSize: 11 }}>OPEN</span>
          {daysLeft !== null && (
            <span style={{ fontSize: 12, color: daysLeft < 3 ? '#ef4444' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={13} /> {daysLeft > 0 ? `${daysLeft}d left` : 'Expired'}
            </span>
          )}
        </div>

        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8, lineHeight: 1.4 }}>
          {project.title}
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 16,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {project.description}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          {(project.requiredSkills || '').split(',').filter(Boolean).slice(0, 3).map(skill => (
            <span key={skill} style={{
              padding: '3px 10px', background: 'var(--primary-light)', color: 'var(--primary)',
              borderRadius: 20, fontSize: 11, fontWeight: 600
            }}>{skill.trim()}</span>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: 14 }}>
          <div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Budget</p>
            <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)' }}>₹{project.budget?.toLocaleString()}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Client</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{project.clientName}</p>
          </div>
        </div>

        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6,
          color: 'var(--primary)', fontSize: 13, fontWeight: 600 }}>
          View & Bid <ArrowRight size={14} />
        </div>
      </div>
    </Link>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => { fetchProjects(); }, [category, search]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await projectAPI.getAll({
        category: category === 'All' ? '' : category,
        search: search || ''
      });
      setProjects(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Browse Projects</h1>
        <p>Find projects that match your skills and start bidding</p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch}>
        <div style={{
          display: 'flex', gap: 12, marginBottom: 24,
          padding: 20, background: '#fff', borderRadius: 16,
          border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input className="input" placeholder="Search projects by title or keyword..."
              value={searchInput} onChange={e => setSearchInput(e.target.value)}
              style={{ paddingLeft: 44 }} />
          </div>
          <button type="submit" className="btn btn-primary">
            <Search size={16} /> Search
          </button>
          {search && (
            <button type="button" className="btn btn-ghost" onClick={() => { setSearch(''); setSearchInput(''); }}>
              Clear
            </button>
          )}
        </div>
      </form>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} style={{
            padding: '8px 16px', borderRadius: 20, border: '1.5px solid',
            borderColor: category === cat ? 'var(--primary)' : 'var(--border)',
            background: category === cat ? 'var(--primary)' : '#fff',
            color: category === cat ? '#fff' : 'var(--text-muted)',
            fontWeight: 600, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap',
            transition: 'all 0.2s', fontFamily: 'Inter, sans-serif'
          }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Results */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          {loading ? 'Loading...' : `${projects.length} project${projects.length !== 1 ? 's' : ''} found`}
        </p>
        {(search || category !== 'All') && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setSearchInput(''); setCategory('All'); }}>
            Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid-3">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="skeleton" style={{ height: 280, borderRadius: 16 }} />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="empty-state card" style={{ padding: 60 }}>
          <FolderOpen size={56} />
          <h3>No projects found</h3>
          <p>Try changing your search or category filter</p>
        </div>
      ) : (
        <div className="grid-3">
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} delay={i * 0.05} />
          ))}
        </div>
      )}
    </div>
  );
}
