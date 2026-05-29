import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { Monitor, Plus, Package, CheckCircle, AlertCircle, Wrench } from 'lucide-react';

const ITAssetPanel = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssign, setShowAssign] = useState(false);
  const [form, setForm] = useState({ asset_id: '', user_id: '' });

  useEffect(() => { fetchInventory(); }, []);

  const fetchInventory = async () => {
    try {
      const res = await api.get('/admin/assets/inventory');
      setInventory(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/assets/assign', {
        asset_id: parseInt(form.asset_id),
        user_id: parseInt(form.user_id)
      });
      setShowAssign(false);
      setForm({ asset_id: '', user_id: '' });
      fetchInventory();
    } catch (err) { alert('Assignment failed'); }
  };

  const totalAssets = inventory.length;
  const assigned = inventory.filter(a => a.status === 'Assigned').length;
  const available = inventory.filter(a => a.status === 'Available').length;

  return (
    <div className="app-layout">
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Navbar />
        <main className="main-content animate-fade-in">
          <div className="page-header">
            <div>
              <h1>Asset Management</h1>
              <p>Track and manage employee assets</p>
            </div>
            <button onClick={() => setShowAssign(true)} className="btn btn-primary">
              <Plus size={16} /> Assign Asset
            </button>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue"><Package size={22} /></div>
              <div><div className="stat-value">{totalAssets}</div><div className="stat-label">Total Assets</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon orange"><Monitor size={22} /></div>
              <div><div className="stat-value">{assigned}</div><div className="stat-label">Assigned</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green"><CheckCircle size={22} /></div>
              <div><div className="stat-value">{available}</div><div className="stat-label">Available</div></div>
            </div>
          </div>

          {/* Assign Modal */}
          {showAssign && (
            <div className="card" style={{ marginBottom: '24px', borderColor: 'rgba(79,110,247,0.3)' }}>
              <h3 style={{ marginBottom: '16px' }}>Assign Asset to Employee</h3>
              <form onSubmit={handleAssign} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label">Asset ID</label>
                  <input className="form-input" type="number" value={form.asset_id} onChange={e => setForm({...form, asset_id: e.target.value})} required />
                </div>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label">Employee User ID</label>
                  <input className="form-input" type="number" value={form.user_id} onChange={e => setForm({...form, user_id: e.target.value})} required />
                </div>
                <button type="submit" className="btn btn-primary">Assign</button>
                <button type="button" onClick={() => setShowAssign(false)} className="btn btn-secondary">Cancel</button>
              </form>
            </div>
          )}

          {/* Inventory Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Serial Number</th>
                  <th>Category</th>
                  <th>Condition</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '32px' }}>Loading...</td></tr>
                ) : inventory.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>No assets in inventory.</td></tr>
                ) : (
                  inventory.map((a, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: '500' }}>{a.name}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--color-text-secondary)' }}>{a.serial_number || 'N/A'}</td>
                      <td><span className="badge badge-in-progress">{a.category}</span></td>
                      <td>{a.condition}</td>
                      <td>
                        {a.status === 'Available' ? <span className="badge badge-completed">Available</span>
                          : a.status === 'Assigned' ? <span className="badge badge-pending">Assigned</span>
                          : <span className="badge badge-rejected">{a.status}</span>}
                      </td>
                      <td style={{ color: 'var(--color-text-secondary)' }}>{a.assigned_to || '—'}</td>
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

export default ITAssetPanel;
