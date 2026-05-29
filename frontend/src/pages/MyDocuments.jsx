import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import DocumentSlot from '../components/DocumentSlot';
import api from '../services/api';
import {
  Upload, FileText, CheckCircle, XCircle, Clock,
  Eye, Download, RefreshCw
} from 'lucide-react';

const DOC_TYPES = [
  'Aadhaar Card',
  'PAN Card',
  'Degree Certificate',
  'Passport Photo',
  'Bank Details',
  'Experience Letter'
];

const MyDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      const res = await api.get('/documents/my');
      setDocuments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !selectedType) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('doc_type', selectedType);

    try {
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowUpload(false);
      setSelectedFile(null);
      setSelectedType('');
      fetchDocs();
    } catch (err) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };


  return (
    <div className="app-layout">
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Navbar />
        <main className="main-content animate-fade-in">
          {/* Header */}
          <div className="page-header">
            <div>
              <h1>Documents</h1>
              <p>Upload and manage your onboarding documents</p>
            </div>
            <button onClick={() => setShowUpload(true)} className="btn btn-primary">
              <Upload size={16} /> Upload New
            </button>
          </div>

          {/* Upload Modal */}
          {showUpload && (
            <div className="card" style={{ marginBottom: '24px', borderColor: 'rgba(79,110,247,0.3)' }}>
              <h3 style={{ marginBottom: '16px' }}>Upload Document</h3>
              <form onSubmit={handleUpload} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label">Document Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="form-select"
                    required
                  >
                    <option value="">Select type...</option>
                    {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
                  <label className="form-label">File</label>
                  <input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="form-input"
                    accept=".pdf,.jpg,.jpeg,.png"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Submit'}
                </button>
                <button type="button" onClick={() => setShowUpload(false)} className="btn btn-secondary">Cancel</button>
              </form>
            </div>
          )}

          {/* Documents Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Document Type</th>
                  <th>Status</th>
                  <th>Uploaded On</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '32px' }}>Loading...</td></tr>
                ) : documents.length === 0 ? (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                    No documents uploaded yet. Click "Upload New" to get started.
                  </td></tr>
                ) : (
                  documents.map((doc, i) => (
                    <DocumentSlot 
                      key={i} 
                      doc={doc} 
                      onReupload={(type) => {
                        setSelectedType(type);
                        setShowUpload(true);
                      }} 
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Rejection reason display */}
          {documents.filter(d => d.status === 'Rejected').map((doc, i) => (
            <div key={i} className="card" style={{ marginTop: '16px', borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <XCircle size={16} color="var(--color-danger)" />
                <span style={{ fontWeight: '500', color: 'var(--color-danger)' }}>Rejection Reason — {doc.doc_type}</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                {doc.rejection_reason || 'No reason provided. Please contact HR.'}
              </p>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
};

export default MyDocuments;
