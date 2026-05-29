import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { Users, UserPlus, CheckCircle, Link2 } from 'lucide-react';

const BuddyManagement = () => {
  const [buddies, setBuddies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssign, setShowAssign] = useState(false);
  const [form, setForm] = useState({ new_hire_id: '', buddy_user_id: '' });

  useEffect(() => { fetchBuddies(); }, []);

  const fetchBuddies = async () => {
    try {
      const res = await api.get('/admin/onboarding-status');
      setBuddies(res.data);
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
      fetchBuddies();
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
                  <label className="form-label">New Hire User ID</label>
                  <input className="form-input" type="number" value={form.new_hire_id} onChange={e => setForm({...form, new_hire_id: e.target.value})} required />
                </div>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label">Buddy User ID</label>
                  <input className="form-input" type="number" value={form.buddy_user_id} onChange={e => setForm({...form, buddy_user_id: e.target.value})} required />
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="progress-bar-container" style={{ width: '80px' }}>
                              <div className="progress-bar-fill" style={{ width: `${hire.completion_percentage || 0}%` }} />
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
