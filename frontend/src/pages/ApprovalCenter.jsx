import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { CheckSquare, AlertCircle, FileText, Monitor, BookOpen, Users } from 'lucide-react';

const ApprovalCenter = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('documents');

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      const res = await api.get('/enterprise/approval-center');
      setApprovals(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (doc_id, action) => {
    try {
      await api.post(`/admin/documents/${doc_id}/review`, {
        status: action === 'approve' ? 'Approved' : action === 'request_reupload' ? 'Reupload Required' : 'Rejected',
        rejection_reason: action === 'reject' ? 'Missing required signatures' : action === 'request_reupload' ? 'Document blurry. Please upload again.' : null
      });
      fetchApprovals();
    } catch (err) {
      alert('Failed to process approval');
    }
  };

  const tabs = [
    { id: 'documents', label: 'Documents', icon: <FileText size={16} />, count: approvals.length },
    { id: 'assets', label: 'Assets', icon: <Monitor size={16} />, count: 0 },
    { id: 'training', label: 'Training', icon: <BookOpen size={16} />, count: 0 },
    { id: 'buddy', label: 'Buddy Program', icon: <Users size={16} />, count: 0 }
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Navbar />
        <main className="main-content animate-fade-in">
          <div className="page-header" style={{ marginBottom: '24px' }}>
            <div>
              <h1>Unified Approval Center</h1>
              <p>Process pending reviews and enforce SLAs across all operational domains</p>
            </div>
            <div className="stat-card" style={{ padding: '12px 24px', background: 'var(--color-primary-light)', border: '1px solid var(--color-primary)' }}>
              <span style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--color-primary)' }}>{approvals.length}</span> 
              <span style={{ marginLeft: '8px', color: 'var(--color-text)' }}>Pending Tasks</span>
            </div>
          </div>

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
                {tab.count > 0 && (
                  <span style={{ background: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-surface-hover)', color: activeTab === tab.id ? 'white' : 'var(--color-text)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', marginLeft: '4px' }}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="card">
            <div className="table-container" style={{ border: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Request Item</th>
                    <th>Submitted On</th>
                    <th>SLA Deadline</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTab !== 'documents' ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>
                      No pending items in this queue.
                    </td></tr>
                  ) : loading ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '32px' }}>Loading...</td></tr>
                  ) : approvals.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>
                      <CheckSquare size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                      All caught up! No pending document approvals.
                    </td></tr>
                  ) : (
                    approvals.map((doc) => (
                      <tr key={doc.doc_id} style={{ background: doc.is_breached ? 'rgba(239, 68, 68, 0.05)' : 'transparent' }}>
                        <td style={{ fontWeight: '500' }}>{doc.employee_name}</td>
                        <td>{doc.doc_type}</td>
                        <td style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{new Date(doc.uploaded_at).toLocaleDateString()}</td>
                        <td style={{ fontSize: '13px', color: doc.is_breached ? 'var(--color-error)' : 'var(--color-text-muted)' }}>
                          {doc.sla_due_date ? new Date(doc.sla_due_date).toLocaleDateString() : 'N/A'}
                          {doc.is_breached && <AlertCircle size={14} style={{ verticalAlign: 'middle', marginLeft: '4px', color: 'var(--color-error)' }}/>}
                        </td>
                        <td><span className="badge badge-pending">Pending Review</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleAction(doc.doc_id, 'approve')} className="btn btn-sm btn-primary">Approve</button>
                            <button onClick={() => handleAction(doc.doc_id, 'request_reupload')} className="btn btn-sm btn-secondary" style={{ color: 'var(--color-warning)' }}>Request Reupload</button>
                            <button onClick={() => handleAction(doc.doc_id, 'reject')} className="btn btn-sm btn-secondary" style={{ color: 'var(--color-danger)' }}>Reject</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ApprovalCenter;
