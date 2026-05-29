import React from 'react';

const ProgressBar = ({ completionPct, totalTasks, completedTasks }) => {
  const remaining = Math.max(0, totalTasks - completedTasks);

  return (
    <div style={{ flex: 1, maxWidth: '400px', marginLeft: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Estimated Completion</span>
        <span style={{ fontSize: '13px', fontWeight: '500' }}>
          ⏱ {remaining} Tasks Remaining
        </span>
      </div>
      <div className="progress-bar-container" style={{ height: '12px' }}>
        <div className="progress-bar-fill" style={{ width: `${completionPct}%` }} />
      </div>
    </div>
  );
};

export default ProgressBar;
