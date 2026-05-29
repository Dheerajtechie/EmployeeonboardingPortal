import React from 'react';
import { Clock, CheckCircle } from 'lucide-react';

const TaskCard = ({ task, isLast, onComplete }) => {
  return (
    <div style={{
      padding: '14px 0',
      borderBottom: isLast ? 'none' : '1px solid var(--color-border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>{task.title}</div>
          <span className={`badge ${task.is_mandatory ? 'badge-in-progress' : 'badge-pending'}`}>
            {task.is_mandatory ? 'High Priority' : 'Low Priority'}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginLeft: '12px' }}>
            Category: {task.category || 'General'}
          </span>
        </div>
        
        {task.status === 'Completed' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-success)', fontSize: '13px', fontWeight: '500' }}>
            <CheckCircle size={16} /> Completed
          </div>
        ) : (
          <button 
            onClick={() => onComplete(task.task_id)} 
            className="btn btn-sm btn-primary"
          >
            Complete
          </button>
        )}
      </div>
      
      {task.due_date && task.status !== 'Completed' && (
        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={12} /> Due: {task.due_date}
        </div>
      )}
    </div>
  );
};

export default TaskCard;
