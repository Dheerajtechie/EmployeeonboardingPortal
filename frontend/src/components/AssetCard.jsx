import React from 'react';
import { Monitor, CheckCircle } from 'lucide-react';

const AssetCard = ({ assignment, onConfirm }) => {
  const asset = assignment.asset || assignment;
  
  return (
    <tr>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px',
            background: 'var(--color-primary-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Monitor size={18} color="var(--color-primary)" />
          </div>
          <span style={{ fontWeight: '500' }}>{asset.name}</span>
        </div>
      </td>
      <td style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
        {asset.serial_number || 'N/A'}
      </td>
      <td><span className="badge badge-in-progress">{asset.category}</span></td>
      <td>{asset.condition || 'Good'}</td>
      <td>
        {assignment.confirmed_at
          ? <span className="badge badge-completed"><CheckCircle size={12} /> Confirmed</span>
          : <span className="badge badge-pending">Pending</span>}
      </td>
      <td>
        {!assignment.confirmed_at && (
          <button onClick={() => onConfirm(assignment.aa_id)} className="btn btn-sm btn-success">
            <CheckCircle size={14} /> Confirm Receipt
          </button>
        )}
      </td>
    </tr>
  );
};

export default AssetCard;
