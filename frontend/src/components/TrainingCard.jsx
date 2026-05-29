import React from 'react';
import { ExternalLink, CheckCircle, Clock, BookOpen } from 'lucide-react';

const TrainingCard = ({ assignment, onComplete }) => {
  const training = assignment.training || assignment;
  const progress = assignment.status === 'Completed' ? 100 : assignment.status === 'In-Progress' ? 50 : 0;

  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
      {/* Icon */}
      <div style={{
        width: '48px', height: '48px', borderRadius: '12px',
        background: assignment.status === 'Completed' ? 'var(--color-success-bg)' : 'var(--color-primary-light)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
      }}>
        {assignment.status === 'Completed' ? <CheckCircle size={22} color="var(--color-success)" /> : <BookOpen size={22} color="var(--color-primary)" />}
      </div>

      {/* Info */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <span style={{ fontSize: '15px', fontWeight: '600' }}>{training.title}</span>
          {assignment.status === 'Completed' && <span className="badge badge-completed">Completed</span>}
          {assignment.status === 'Pending' && <span className="badge badge-pending">Pending</span>}
        </div>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
          {training.description || 'Complete this training module to proceed.'}
        </p>
        {/* Progress Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="progress-bar-container" style={{ maxWidth: '200px' }}>
            <div className={`progress-bar-fill ${assignment.status === 'Completed' ? 'green' : ''}`} style={{ width: `${progress}%` }} />
          </div>
          <span style={{ fontSize: '12px', fontWeight: '500' }}>{progress}%</span>
          {training.duration_hours && (
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} /> {training.duration_hours}h
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        {training.resource_url && (
          <a href={training.resource_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-secondary">
            <ExternalLink size={14} /> Open Course
          </a>
        )}
        {assignment.status !== 'Completed' && (
          <button onClick={() => onComplete(assignment.ta_id)} className="btn btn-sm btn-primary">
            <CheckCircle size={14} /> Mark Done
          </button>
        )}
      </div>
    </div>
  );
};

export default TrainingCard;
