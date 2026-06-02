import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { Users, AlertTriangle, CheckSquare, Target, ArrowRight, ShieldAlert, Zap, Trash2 } from 'lucide-react';

const HRDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [successData, setSuccessData] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'new_hire', department_id: 1, joining_date: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/enterprise/command-center');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHire = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', formData);
      setShowAddModal(false);
      setSuccessData({ ...formData, temp_password: res.data.temp_password });
      setFormData({ name: '', email: '', role: 'new_hire', department_id: 1, joining_date: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create new hire');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsersList(res.data);
    } catch (err) { console.error(err); }
  };

  const handleDeleteUser = async (userId) => {
    if(confirm('Are you sure you want to deactivate this user?')) {
      try {
        await api.delete(`/admin/users/${userId}`);
        fetchUsers();
        fetchData();
      } catch (err) { alert(err.response?.data?.detail || 'Failed to delete user'); }
    }
  };

  if (loading) return <div className="app-layout"><Sidebar/><div style={{flex: 1}}><Navbar/><main style={{padding: '24px'}}>Loading Command Center...</main></div></div>;

  return (
    <div className="app-layout">
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Navbar />
        <main className="main-content animate-fade-in">
          <div className="page-header" style={{ marginBottom: '24px' }}>
            <div>
              <h1>HR Command Center</h1>
              <p>Real-time enterprise onboarding operations & risk overview</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => { fetchUsers(); setShowUsersModal(true); }} className="btn btn-secondary">Manage Users</button>
              <button onClick={() => setShowAddModal(true)} className="btn btn-primary">Register New Hire</button>
            </div>
          </div>

          {/* AI Insights Bar */}
          {(data?.sla_breaches > 0 || data?.risk_levels?.High > 0) && (
            <div className="card" style={{ background: 'var(--color-primary-light)', borderLeft: '4px solid var(--color-primary)', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: 'var(--color-primary)', color: 'white', padding: '8px', borderRadius: '50%' }}>
                <Zap size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, color: 'var(--color-primary-dark)' }}>AI Operational Insight</h4>
                <p style={{ margin: 0, color: 'var(--color-primary-dark)', fontSize: '14px' }}>
                  Attention required: You have {data.sla_breaches} SLA breaches and {data.risk_levels?.High || 0} employees at high risk of delayed onboarding. Immediate intervention recommended for the IT Asset Allocation queue.
                </p>
              </div>
              <Link to="/hr/risk" className="btn btn-sm btn-primary">Take Action</Link>
            </div>
          )}

          {/* KPI Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue"><Users size={22} /></div>
              <div>
                <div className="stat-value">{data?.total_hires || 0}</div>
                <div className="stat-label">Total Active Hires</div>
              </div>
            </div>
            <div className="stat-card" style={{ borderBottom: data?.risk_levels?.High > 0 ? '4px solid var(--color-error)' : 'none' }}>
              <div className="stat-icon red"><ShieldAlert size={22} /></div>
              <div>
                <div className="stat-value">{data?.risk_levels?.High || 0}</div>
                <div className="stat-label">High Risk Profiles</div>
              </div>
            </div>
            <div className="stat-card" style={{ borderBottom: data?.sla_breaches > 0 ? '4px solid var(--color-error)' : 'none' }}>
              <div className="stat-icon orange"><Target size={22} /></div>
              <div>
                <div className="stat-value">{data?.sla_breaches || 0}</div>
                <div className="stat-label">SLA Breaches</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green"><CheckSquare size={22} /></div>
              <div>
                <div className="stat-value">{data?.pipeline?.Completed || 0}</div>
                <div className="stat-label">Fully Onboarded</div>
              </div>
            </div>
          </div>

          <div className="grid-2">
            {/* Pipeline Stages */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Onboarding Pipeline</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '120px', fontSize: '13px', color: 'var(--color-text-muted)' }}>Registered</div>
                  <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', height: '24px', borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{ width: '100%', height: '100%', background: 'var(--color-primary-light)', borderRight: '2px solid var(--color-primary)', display: 'flex', alignItems: 'center', paddingLeft: '12px', fontSize: '12px', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                      {data?.total_hires || 0}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '120px', fontSize: '13px', color: 'var(--color-text-muted)' }}>In Progress</div>
                  <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', height: '24px', borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, ((data?.pipeline?.['In Progress'] || 0) / (data?.total_hires || 1)) * 100)}%`, minWidth: '10%', height: '100%', background: 'var(--color-info-bg)', borderRight: '2px solid var(--color-info)', display: 'flex', alignItems: 'center', paddingLeft: '12px', fontSize: '12px', fontWeight: 'bold', color: 'var(--color-info)' }}>
                      {data?.pipeline?.['In Progress'] || 0}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '120px', fontSize: '13px', color: 'var(--color-error)' }}>Blocked</div>
                  <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', height: '24px', borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, ((data?.pipeline?.['Blocked'] || 0) / (data?.total_hires || 1)) * 100)}%`, minWidth: '5%', height: '100%', background: 'var(--color-danger-bg)', borderRight: '2px solid var(--color-danger)', display: 'flex', alignItems: 'center', paddingLeft: '12px', fontSize: '12px', fontWeight: 'bold', color: 'var(--color-danger)' }}>
                      {data?.pipeline?.['Blocked'] || 0}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '120px', fontSize: '13px', color: 'var(--color-success)' }}>Completed</div>
                  <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', height: '24px', borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, ((data?.pipeline?.['Completed'] || 0) / (data?.total_hires || 1)) * 100)}%`, minWidth: '5%', height: '100%', background: 'var(--color-success-bg)', borderRight: '2px solid var(--color-success)', display: 'flex', alignItems: 'center', paddingLeft: '12px', fontSize: '12px', fontWeight: 'bold', color: 'var(--color-success)' }}>
                      {data?.pipeline?.['Completed'] || 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Action Center</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                <Link to="/hr/approvals" className="btn btn-secondary" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckSquare size={16}/> Document Approvals</span>
                  <span className="badge badge-pending">{data?.overdue_docs || 0} Pending</span>
                </Link>
                <Link to="/hr/risk" className="btn btn-secondary" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><AlertTriangle size={16}/> Risk Monitoring</span>
                  <span className="badge badge-rejected">{data?.risk_levels?.High || 0} High</span>
                </Link>
                <Link to="/hr/sla" className="btn btn-secondary" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Target size={16}/> SLA Tracking</span>
                  <ArrowRight size={16} color="var(--color-text-muted)" />
                </Link>
              </div>
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
                <h2 style={{ marginBottom: '20px' }}>Register New Hire</h2>
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

          {/* Manage Users Modal */}
          {showUsersModal && (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1000, backdropFilter: 'blur(4px)'
            }}>
              <div className="card animate-slide-up" style={{ width: '800px', maxWidth: '90vw', maxHeight: '80vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ margin: 0 }}>Manage Active Users</h2>
                  <button onClick={() => setShowUsersModal(false)} className="btn btn-secondary btn-sm">Close</button>
                </div>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.length === 0 ? (
                        <tr><td colSpan="4" style={{ textAlign: 'center', padding: '24px' }}>No users found.</td></tr>
                      ) : (
                        usersList.map(u => (
                          <tr key={u.user_id}>
                            <td style={{ fontWeight: '500' }}>{u.name}</td>
                            <td>{u.email}</td>
                            <td><span className="badge badge-in-progress">{u.role}</span></td>
                            <td>
                              <button className="btn btn-danger btn-sm" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => handleDeleteUser(u.user_id)}>
                                <Trash2 size={12} style={{ marginRight: '4px' }} /> Deactivate
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Success Modal */}
          {successData && (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1000, backdropFilter: 'blur(4px)'
            }}>
              <div className="card animate-slide-up" style={{ width: '400px', maxWidth: '90vw', textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--color-success-bg)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <CheckSquare size={32} />
                </div>
                <h2 style={{ marginBottom: '8px' }}>New Hire Created!</h2>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>
                  Successfully registered <strong>{successData.name}</strong> and auto-assigned all onboarding tasks.
                </p>
                <div style={{ background: 'var(--color-bg)', padding: '16px', borderRadius: '8px', marginBottom: '24px', textAlign: 'left', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Login Email</div>
                  <div style={{ fontWeight: '500', marginBottom: '12px', wordBreak: 'break-all' }}>{successData.email}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Temporary Password</div>
                  <div style={{ fontWeight: '500', fontFamily: 'monospace', fontSize: '18px', color: 'var(--color-primary)' }}>{successData.temp_password}</div>
                </div>
                <button onClick={() => setSuccessData(null)} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Done</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default HRDashboard;
