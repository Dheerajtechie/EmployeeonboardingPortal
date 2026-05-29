import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { FileText, CheckCircle, XCircle, Clock, Eye, Search } from 'lucide-react';

const DocumentReview = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => { fetchDocs(); }, []);

  const fetchDocs = async () => {
    try {
      const res = await api.get('/admin/pending-documents');
      setDocuments(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleVerify = async (docId) => {
    try {
      await api.put(`/documents/${docId}/verify`);
      fetchDocs();
    } catch (err) { alert('Verification failed'); }
  };

  const handleReject = async (docId) => {
    try {
      await api.put(`/documents/${docId}/reject`, { reason: rejectReason });
      setRejectId(null);
      setRejectReason('');
      fetchDocs();
    } catch (err) { alert('Rejection failed'); }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Navbar />
        <main className="main-content animate-fade-in">
          <div className="page-header">
            <div>
              <h1>Document Review</h1>
              <p>Review and verify employee documents</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-pending" style={{ fontSize: '14px', padding: '6px 12px' }}>
                {documents.length} Pending
              </span>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Document Type</th>
                  <th>Uploaded On</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '32px' }}>Loading...</td></tr>
                ) : documents.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>
                    <CheckCircle size={32} style={{ marginBottom: '8px', opacity: 0.5 }} /><br />
                    All documents have been reviewed. No pending reviews!
                  </td></tr>
                ) : (
                  documents.map((doc, i) => (
                    <tr key={i}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '13px', fontWeight: '600', color: 'white'
                          }}>{doc.user_name?.charAt(0)?.toUpperCase() || 'U'}</div>
                          <div>
                            <div style={{ fontWeight: '500' }}>{doc.user_name || 'Employee'}</div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{doc.user_email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileText size={16} color="var(--color-primary)" />
                          <span style={{ fontWeight: '500' }}>{doc.doc_type}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                        {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString('en-IN') : '-'}
                      </td>
                      <td><span className="badge badge-pending"><Clock size={12} /> Pending</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleVerify(doc.doc_id)} className="btn btn-sm btn-success">
                            <CheckCircle size={14} /> Verify
                          </button>
                          <button onClick={() => setRejectId(doc.doc_id)} className="btn btn-sm btn-danger">
                            <XCircle size={14} /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Reject Modal */}
          {rejectId && (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1000
            }}>
              <div className="card animate-slide-up" style={{ width: '400px' }}>
                <h3 style={{ marginBottom: '16px' }}>Rejection Reason</h3>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="form-input"
                  rows={3}
                  placeholder="Please provide a reason for rejection..."
                  required
                />
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'flex-end' }}>
                  <button onClick={() => { setRejectId(null); setRejectReason(''); }} className="btn btn-secondary">Cancel</button>
                  <button onClick={() => handleReject(rejectId)} className="btn btn-danger">Reject Document</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DocumentReview;
