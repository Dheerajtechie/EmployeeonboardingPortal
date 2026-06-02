import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { Users, UserPlus, CheckCircle, Link2 } from 'lucide-react';

const BuddyManagement = () => {
  const [buddies, setBuddies] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssign, setShowAssign] = useState(false);
  const [form, setForm] = useState({ new_hire_id: '', buddy_user_id: '' });

  useEffect(() => { fetchBuddiesAndUsers(); }, []);

  const fetchBuddiesAndUsers = async () => {
    try {
      const [buddiesRes, usersRes] = await Promise.all([
        api.get('/admin/onboarding-status'),
        api.get('/admin/users')
      ]);
      setBuddies(buddiesRes.data);
      setUsers(usersRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/buddy/assign', {
        new_hire_id: parseInt(form.new_hire_id),
        buddy_user_id: parseInt(form.buddy_user_id)
      });
      setShowAssign(false);
      setForm({ new_hire_id: '', buddy_user_id: '' });
      fetchBuddiesAndUsers();
      alert('Buddy assigned successfully!');
    } catch (err) { alert('Assignment failed'); }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Navbar />
        <main className="main-content animate-fade-in">
          <div className="page-header">
            <div>
              <h1>Buddy Management</h1>
              <p>Pair new hires with experienced employees</p>
            </div>
            <button onClick={() => setShowAssign(true)} className="btn btn-primary">
              <UserPlus size={16} /> Assign Buddy
            </button>
          </div>

          {showAssign && (
            <div className="card" style={{ marginBottom: '24px', borderColor: 'rgba(79,110,247,0.3)' }}>
              <h3 style={{ marginBottom: '16px' }}>Assign Buddy Pairing</h3>
              <form onSubmit={handleAssign} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label">New Hire</label>
                  <select className="form-select" value={form.new_hire_id} onChange={e => setForm({...form, new_hire_id: e.target.value})} required>
                    <option value="">Select an unassigned new hire...</option>
                    {buddies.filter(b => b.buddy_name === 'Unassigned').map(b => (
                      <option key={b.user_id} value={b.user_id}>{b.name} ({b.department})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label">Assign to Buddy</label>
                  <select className="form-select" value={form.buddy_user_id} onChange={e => setForm({...form, buddy_user_id: e.target.value})} required>
                    <option value="">Select an experienced employee...</option>
                    {users.filter(u => u.role !== 'new_hire').map(u => (
                      <option key={u.user_id} value={u.user_id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn btn-primary"><Link2 size={14} /> Assign</button>
                <button type="button" onClick={() => setShowAssign(false)} className="btn btn-secondary">Cancel</button>
              </form>
            </div>
          )}

          <div className="card">
            <div className="card-header">
              <span className="card-title">New Hires</span>
            </div>
            <div className="table-container" style={{ border: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Assigned Buddy</th>
                    <th>Completion</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '32px' }}>Loading...</td></tr>
                  ) : buddies.length === 0 ? (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>No new hires in the system.</td></tr>
                  ) : (
                    buddies.map((hire, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: '500' }}>{hire.name}</td>
                        <td style={{ color: 'var(--color-text-secondary)' }}>{hire.email}</td>
                        <td><span className="badge badge-in-progress">{hire.department || 'N/A'}</span></td>
                        <td>
                          {hire.buddy_name !== 'Unassigned' ? (
                            <span style={{ color: 'var(--color-primary)', fontWeight: '500' }}>{hire.buddy_name}</span>
                          ) : (
                            <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Unassigned</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="progress-bar-container" style={{ width: '80px' }}>
                              <div className={`progress-bar-fill ${hire.completion_percentage >= 80 ? 'green' : hire.completion_percentage >= 50 ? '' : 'orange'}`} style={{ width: `${hire.completion_percentage || 0}%` }} />
                            </div>
                            <span style={{ fontSize: '13px' }}>{hire.completion_percentage || 0}%</span>
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

export default BuddyManagement;
