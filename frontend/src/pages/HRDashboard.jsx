import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import {
  Users, FileText, CheckSquare, AlertTriangle,
  TrendingUp, BarChart3, UserPlus, Download,
  ChevronRight, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

const HRDashboard = () => {
  const [stats, setStats] = useState(null);
  const [newHires, setNewHires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'new_hire', department_id: 1, joining_date: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, hiresRes] = await Promise.all([
        api.get('/admin/dashboard-stats'),
        api.get('/admin/onboarding-status')
      ]);
      setStats(statsRes.data);
      setNewHires(hiresRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHire = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', formData);
      setShowAddModal(false);
      setFormData({ name: '', email: '', role: 'new_hire', department_id: 1, joining_date: '' });
      fetchData();
    } catch (err) {
      alert('Failed to create new hire');
    }
  };

  // Department completion data for the bar chart
  const deptCompletion = [
    { name: 'Engineering', pct: 92 },
    { name: 'HR', pct: 86 },
    { name: 'Finance', pct: 78 },
    { name: 'Operations', pct: 65 }
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Navbar />
        <main className="main-content animate-fade-in">
          {/* Header */}
          <div className="page-header">
            <div>
              <h1>HR Dashboard</h1>
              <p>Overview of onboarding across the organization</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', padding: '10px 0' }}>This Month</span>
              <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
                <UserPlus size={16} /> Add New Hire
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue"><Users size={22} /></div>
              <div>
                <div className="stat-value">{stats?.total_new_hires ?? 0}</div>
                <div className="stat-label">Total New Hires</div>
                <div className="stat-link" style={{ color: 'var(--color-success)' }}>
                  <ArrowUpRight size={12} /> +12%
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green"><TrendingUp size={22} /></div>
              <div>
                <div className="stat-value">{stats?.completion_rate ?? 0}%</div>
                <div className="stat-label">Completion Rate</div>
                <div className="stat-link" style={{ color: 'var(--color-success)' }}>
                  <ArrowUpRight size={12} /> +6%
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon orange"><FileText size={22} /></div>
              <div>
                <div className="stat-value">{stats?.pending_documents ?? 0}</div>
                <div className="stat-label">Pending Documents</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon red"><AlertTriangle size={22} /></div>
              <div>
                <div className="stat-value">{stats?.pending_tasks ?? 0}</div>
                <div className="stat-label">Pending Tasks</div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid-2" style={{ marginBottom: '24px' }}>
            {/* Onboarding Trend (Simulated Chart) */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Onboarding Trend</span>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Last 6 months</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '160px', paddingTop: '20px' }}>
                {[65, 78, 82, 71, 88, stats?.completion_rate || 86].map((val, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                      width: '100%',
                      height: `${val * 1.4}px`,
                      background: i === 5 ? 'var(--color-primary)' : 'rgba(79,110,247,0.2)',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.4s ease'
                    }} />
                    <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                      {['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Department Completion */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Department Wise Completion</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
                {deptCompletion.map((dept, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px' }}>{dept.name}</span>
                      <span style={{ fontSize: '13px', fontWeight: '500' }}>{dept.pct}%</span>
                    </div>
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: `${dept.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* New Hires Table */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">New Hire Onboarding Status</span>
              <Link to="/hr/reports" className="btn btn-sm btn-secondary">
                <Download size={14} /> Export
              </Link>
            </div>
            <div className="table-container" style={{ border: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Tasks</th>
                    <th>Docs</th>
                    <th>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '32px' }}>Loading...</td></tr>
                  ) : newHires.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                      No new hires yet. Click "Add New Hire" to get started.
                    </td></tr>
                  ) : (
                    newHires.map((hire, i) => (
                      <tr key={i}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '32px', height: '32px', borderRadius: '50%',
                              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '13px', fontWeight: '600', color: 'white'
                            }}>{hire.name?.charAt(0)?.toUpperCase()}</div>
                            <div>
                              <div style={{ fontWeight: '500' }}>{hire.name}</div>
                              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{hire.email}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="badge badge-in-progress">{hire.department || 'Unassigned'}</span></td>
                        <td>{hire.completed_tasks}/{hire.total_tasks}</td>
                        <td>{hire.verified_docs}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="progress-bar-container" style={{ width: '100px' }}>
                              <div className={`progress-bar-fill ${hire.completion_percentage >= 80 ? 'green' : hire.completion_percentage >= 50 ? '' : 'orange'}`}
                                style={{ width: `${hire.completion_percentage}%` }} />
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: '500' }}>{hire.completion_percentage}%</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add New Hire Modal */}
          {showAddModal && (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1000, backdropFilter: 'blur(4px)'
            }}>
              <div className="card animate-slide-up" style={{ width: '500px', maxWidth: '90vw' }}>
                <h2 style={{ marginBottom: '20px' }}>Create New Hire</h2>
                <form onSubmit={handleCreateHire}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                  </div>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Department</label>
                      <select className="form-select" value={formData.department_id} onChange={e => setFormData({...formData, department_id: parseInt(e.target.value)})}>
                        <option value={1}>Engineering</option>
                        <option value={2}>HR</option>
                        <option value={3}>Finance</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Joining Date</label>
                      <input className="form-input" type="date" value={formData.joining_date} onChange={e => setFormData({...formData, joining_date: e.target.value})} required />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">Cancel</button>
                    <button type="submit" className="btn btn-primary">Create Employee</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default HRDashboard;
