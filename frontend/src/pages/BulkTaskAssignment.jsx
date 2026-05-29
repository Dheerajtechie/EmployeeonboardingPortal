import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { CheckSquare, Loader2, Users } from 'lucide-react';

const BulkTaskAssignment = () => {
  const [departments, setDepartments] = useState([]);
  const [deptId, setDeptId] = useState('');
  const [taskId, setTaskId] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.get('/admin/departments').then(res => setDepartments(res.data)).catch(console.error);
  }, []);

  const handleBulkAssign = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    try {
      const res = await api.post('/admin/bulk-assign', {
        department_id: parseInt(deptId),
        task_id: parseInt(taskId)
      });
      setSuccess(res.data?.message || 'Tasks assigned successfully!');
    } catch (err) {
      alert('Bulk assignment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Navbar />
        <main className="main-content animate-fade-in">
          <div className="page-header">
            <div>
              <h1>Bulk Task Assignment</h1>
              <p>Assign onboarding tasks to all new hires in a department</p>
            </div>
          </div>

          <div className="card" style={{ maxWidth: '600px' }}>
            <form onSubmit={handleBulkAssign}>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select className="form-select" value={deptId} onChange={e => setDeptId(e.target.value)} required>
                  <option value="">Select department...</option>
                  {departments.map((d, i) => (
                    <option key={i} value={d.department_id || d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Task ID</label>
                <input className="form-input" type="number" value={taskId} onChange={e => setTaskId(e.target.value)}
                  placeholder="Enter onboarding task ID to assign" required />
              </div>
              {success && (
                <div style={{
                  padding: '12px', background: 'var(--color-success-bg)',
                  border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px',
                  color: 'var(--color-success)', fontSize: '13px', marginBottom: '16px'
                }}>{success}</div>
              )}
              <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? <><Loader2 size={16} className="animate-spin" /> Assigning...</> : <><CheckSquare size={16} /> Assign to All New Hires</>}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BulkTaskAssignment;
