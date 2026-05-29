import React from 'react';
import { FileText, CheckCircle, XCircle, Clock, Eye, Download, RefreshCw } from 'lucide-react';

const DocumentSlot = ({ doc, onReupload }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Verified': return <span className="badge badge-verified"><CheckCircle size={12} /> Verified</span>;
      case 'Rejected': return <span className="badge badge-rejected"><XCircle size={12} /> Rejected</span>;
      default: return <span className="badge badge-pending"><Clock size={12} /> Pending</span>;
    }
  };

  return (
    <tr>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FileText size={18} color="var(--color-primary)" />
          <span style={{ fontWeight: '500' }}>{doc.doc_type}</span>
        </div>
      </td>
      <td>{getStatusBadge(doc.status)}</td>
      <td style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>
        {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
      </td>
      <td>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-icon btn-secondary" title="View">
            <Eye size={14} />
          </button>
          <button className="btn btn-icon btn-secondary" title="Download">
            <Download size={14} />
          </button>
          {doc.status === 'Rejected' && (
            <button onClick={() => onReupload(doc.doc_type)} className="btn btn-sm btn-primary" title="Re-upload">
              <RefreshCw size={14} /> Re-upload
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default DocumentSlot;
