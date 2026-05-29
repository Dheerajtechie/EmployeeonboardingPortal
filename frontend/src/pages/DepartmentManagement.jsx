import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { Building, Plus, Loader2 } from 'lucide-react';

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetchDepts(); }, []);

  const fetchDepts = async () => {
    try {
      const res = await api.get('/admin/departments');
      setDepartments(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/admin/departments', form);
      setShowAdd(false);
      setForm({ name: '', description: '' });
      fetchDepts();
    } catch (err) { alert('Creation failed'); }
    finally { setCreating(false); }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Navbar />
        <main className="main-content animate-fade-in">
          <div className="page-header">
            <div>
              <h1>Department Management</h1>
              <p>Create and manage organization departments</p>
            </div>
            <button onClick={() => setShowAdd(true)} className="btn btn-primary">
              <Plus size={16} /> Add Department
            </button>
          </div>

          {showAdd && (
            <div className="card" style={{ marginBottom: '24px', borderColor: 'rgba(79,110,247,0.3)' }}>
              <h3 style={{ marginBottom: '16px' }}>New Department</h3>
              <form onSubmit={handleCreate} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label">Name</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Operations" required />
                </div>
                <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
                  <label className="form-label">Description</label>
                  <input className="form-input" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Department description" />
                </div>
                <button type="submit" disabled={creating} className="btn btn-primary">
                  {creating ? <Loader2 size={14} className="animate-spin" /> : 'Create'}
                </button>
                <button type="button" onClick={() => setShowAdd(false)} className="btn btn-secondary">Cancel</button>
              </form>
            </div>
          )}

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Description</th>
                  <th>ID</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="3" style={{ textAlign: 'center', padding: '32px' }}>Loading...</td></tr>
                ) : departments.length === 0 ? (
                  <tr><td colSpan="3" style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>No departments. Create one to get started.</td></tr>
                ) : (
                  departments.map((d, i) => (
                    <tr key={i}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '8px',
                            background: `hsl(${(i * 90) % 360}, 50%, 25%)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            <Building size={18} color="white" />
                          </div>
                          <span style={{ fontWeight: '500' }}>{d.name}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--color-text-secondary)' }}>{d.description || '-'}</td>
                      <td style={{ fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>{d.department_id || d.id}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DepartmentManagement;
