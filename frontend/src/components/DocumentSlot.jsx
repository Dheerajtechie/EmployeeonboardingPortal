import React from 'react';
import { FileText, CheckCircle, XCircle, Clock, Eye, Download, RefreshCw } from 'lucide-react';

const DocumentSlot = ({ doc, onReupload }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
      case 'Verified': return <span className="badge badge-verified"><CheckCircle size={12} /> Approved</span>;
      case 'Under Review': return <span className="badge badge-pending"><Clock size={12} /> Under Review</span>;
      case 'Expired': return <span className="badge badge-rejected"><Clock size={12} /> Expired</span>;
      case 'Rejected': return <span className="badge badge-rejected"><XCircle size={12} /> Rejected</span>;
      case 'Draft': return <span className="badge badge-in-progress">Draft</span>;
      default: return <span className="badge badge-pending"><Clock size={12} /> {status || 'Pending'}</span>;
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
        <div>{doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</div>
        {doc.sla_breached ? <div style={{color:'var(--color-danger)', fontSize: '11px', marginTop: '2px'}}>SLA Breached</div> : doc.status === 'Under Review' ? <div style={{color:'var(--color-warning)', fontSize: '11px', marginTop: '2px'}}>SLA Active</div> : null}
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
