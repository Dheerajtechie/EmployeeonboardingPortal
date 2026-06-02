import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { User, Clock, AlertTriangle, CheckCircle, Briefcase, FileText, Monitor, BookOpen, Users, ShieldAlert } from 'lucide-react';

const Employee360 = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/enterprise/employee-360/${id}`);
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="app-layout"><Sidebar/><div style={{flex: 1}}><Navbar/><main style={{padding: '24px'}}>Loading Employee 360...</main></div></div>;
  if (!data) return <div className="app-layout"><Sidebar/><div style={{flex: 1}}><Navbar/><main style={{padding: '24px'}}>Employee not found.</main></div></div>;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <User size={16} /> },
    { id: 'timeline', label: 'Audit Timeline', icon: <Clock size={16} /> },
    { id: 'tasks', label: 'Tasks', icon: <Briefcase size={16} /> },
    { id: 'docs', label: 'Documents', icon: <FileText size={16} /> },
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Navbar />
        <main className="main-content animate-fade-in">
          <div className="page-header" style={{ marginBottom: '24px' }}>
            <div>
              <Link to="/hr/dashboard" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontSize: '14px', display: 'block', marginBottom: '8px' }}>← Back to Command Center</Link>
              <h1>Employee 360: {data.user.name}</h1>
              <p>Comprehensive onboarding profile</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {data.user.risk_level === 'High' && (
                <div style={{ color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                  <ShieldAlert size={18} /> High Risk Profile
                </div>
              )}
              <span className={`badge ${data.user.onboarding_status === 'Completed' ? 'badge-completed' : 'badge-in-progress'}`} style={{ padding: '8px 16px', fontSize: '14px' }}>
                Status: {data.user.onboarding_status}
              </span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 20px', borderRadius: '8px',
                  background: activeTab === tab.id ? 'var(--color-primary-light)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  fontWeight: activeTab === tab.id ? '600' : '500',
                  border: 'none', cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="animate-fade-in">
            {activeTab === 'overview' && (
              <div className="grid-2">
                <div className="card">
                  <h3 style={{ marginBottom: '16px' }}><User size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }}/>Profile Identity</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Name</span>
                      <span style={{ fontWeight: '500' }}>{data.user.name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Email</span>
                      <span style={{ fontWeight: '500' }}>{data.user.email}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Department</span>
                      <span style={{ fontWeight: '500' }}>{data.user.department}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Joining Date</span>
                      <span style={{ fontWeight: '500' }}>{data.user.joining_date?.split('T')[0]}</span>
                    </div>
                  </div>
                </div>
                
                <div className="card">
                  <h3 style={{ marginBottom: '16px' }}><AlertTriangle size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }}/>AI Risk Assessment</h3>
                  {data.user.risk_level === 'High' ? (
                    <div style={{ background: 'var(--color-danger-bg)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                      <p style={{ color: 'var(--color-danger)', fontWeight: '600', marginBottom: '8px' }}>High Risk Detected</p>
                      <p style={{ fontSize: '13px', color: 'var(--color-text)' }}>This employee has pending mandatory items that are past their SLA. Review the Timeline to unblock their onboarding immediately.</p>
                    </div>
                  ) : (
                    <div style={{ background: 'var(--color-success-bg)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                      <p style={{ color: 'var(--color-success)', fontWeight: '600', marginBottom: '8px' }}>Pipeline Healthy</p>
                      <p style={{ fontSize: '13px', color: 'var(--color-text)' }}>This employee is progressing through onboarding within acceptable SLAs.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="card">
                <h3 style={{ marginBottom: '16px' }}>Immutable Audit Log</h3>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>Event Type</th>
                        <th>Action Details</th>
                        <th>Status</th>
                        <th>Next Responsible</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.timeline.length === 0 ? (
                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '32px' }}>No events recorded.</td></tr>
                      ) : (
                        data.timeline.map((ev) => (
                          <tr key={ev.event_id}>
                            <td style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{new Date(ev.created_at).toLocaleString()}</td>
                            <td><span className="badge badge-in-progress">{ev.type}</span></td>
                            <td style={{ fontWeight: '500' }}>{ev.action}</td>
                            <td>{ev.status}</td>
                            <td style={{ fontStyle: 'italic', color: 'var(--color-primary)' }}>{ev.next_action || 'System'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'tasks' && (
              <div className="card">
                <h3 style={{ marginBottom: '16px' }}>Task Assignments</h3>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Task</th>
                        <th>Status</th>
                        <th>Due Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.tasks.map(t => (
                        <tr key={t.id}>
                          <td style={{ fontWeight: '500' }}>{t.title}</td>
                          <td>
                            <span className={`badge ${t.status === 'Completed' ? 'badge-completed' : 'badge-pending'}`}>
                              {t.status}
                            </span>
                          </td>
                          <td style={{ color: t.due_date && new Date(t.due_date) < new Date() && t.status !== 'Completed' ? 'var(--color-danger)' : 'var(--color-text)' }}>
                            {t.due_date?.split('T')[0] || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'docs' && (
              <div className="card">
                <h3 style={{ marginBottom: '16px' }}>Document Verification</h3>
                <div className="empty-state">
                  <FileText size={48} />
                  <h3>No Documents Found</h3>
                  <p>This employee hasn't uploaded any documents yet.</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Employee360;
