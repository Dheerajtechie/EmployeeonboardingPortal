import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { Monitor, Plus, Package, CheckCircle, AlertCircle, Wrench } from 'lucide-react';

const ITAssetPanel = () => {
  const [inventory, setInventory] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssign, setShowAssign] = useState(false);
  const [form, setForm] = useState({ asset_id: '', user_id: '' });

  const [showCreate, setShowCreate] = useState(false);
  const [newAsset, setNewAsset] = useState({ name: '', serial_number: '', category: 'Hardware', condition: 'New', status: 'Available' });

  useEffect(() => { fetchInventoryAndUsers(); }, []);

  const fetchInventoryAndUsers = async () => {
    try {
      const [invRes, usersRes] = await Promise.all([
        api.get('/admin/assets/inventory'),
        api.get('/admin/users')
      ]);
      setInventory(invRes.data);
      setUsers(usersRes.data);
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
      fetchInventoryAndUsers();
    } catch (err) { alert('Assignment failed'); }
  };

  const handleCreateAsset = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/assets', newAsset);
      setShowCreate(false);
      setNewAsset({ name: '', serial_number: '', category: 'Hardware', condition: 'New', status: 'Available' });
      fetchInventoryAndUsers();
    } catch (err) { alert('Failed to create asset'); }
  };

  const handleUnassign = async (asset_id) => {
    if(confirm('Are you sure you want to unassign this asset?')) {
      try {
        await api.put(`/admin/assets/${asset_id}/unassign`);
        fetchInventoryAndUsers();
      } catch (err) { alert('Unassign failed'); }
    }
  };

  const totalAssets = inventory.length;
  const assigned = inventory.filter(a => a.asset_status === 'Assigned').length;
  const available = inventory.filter(a => a.asset_status === 'Available').length;

  return (
    <div className="app-layout">
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Navbar />
        <main className="main-content animate-fade-in">
          <div className="page-header">
            <div>
               <h1>IT Asset Command Center</h1>
               <p>ServiceNow-style IT inventory and lifecycle management</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowCreate(true)} className="btn btn-secondary">
                <Plus size={16} /> Add Asset
              </button>
              <button onClick={() => setShowAssign(true)} className="btn btn-primary">
                <Plus size={16} /> New Allocation
              </button>
            </div>
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
                  <label className="form-label">Select Asset</label>
                  <select className="form-select" value={form.asset_id} onChange={e => setForm({...form, asset_id: e.target.value})} required>
                    <option value="">Choose an available asset...</option>
                    {inventory.filter(a => a.asset_status === 'Available').map(a => (
                      <option key={a.asset_id} value={a.asset_id}>{a.name} ({a.serial_number})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label">Assign to Employee</label>
                  <select className="form-select" value={form.user_id} onChange={e => setForm({...form, user_id: e.target.value})} required>
                    <option value="">Choose an employee...</option>
                    {users.map(u => (
                      <option key={u.user_id} value={u.user_id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn btn-primary">Assign</button>
                <button type="button" onClick={() => setShowAssign(false)} className="btn btn-secondary">Cancel</button>
              </form>
            </div>
          )}

          {/* Create Asset Modal */}
          {showCreate && (
            <div className="card" style={{ marginBottom: '24px', borderColor: 'rgba(79,110,247,0.3)' }}>
              <h3 style={{ marginBottom: '16px' }}>Add New Asset to Inventory</h3>
              <form onSubmit={handleCreateAsset} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}>
                  <label className="form-label">Asset Name</label>
                  <input className="form-input" value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} placeholder="e.g. MacBook Pro" required />
                </div>
                <div className="form-group" style={{ flex: 1, minWidth: '150px', marginBottom: 0 }}>
                  <label className="form-label">Serial Number</label>
                  <input className="form-input" value={newAsset.serial_number} onChange={e => setNewAsset({...newAsset, serial_number: e.target.value})} required />
                </div>
                <div className="form-group" style={{ minWidth: '150px', marginBottom: 0 }}>
                  <label className="form-label">Category</label>
                  <select className="form-select" value={newAsset.category} onChange={e => setNewAsset({...newAsset, category: e.target.value})} required>
                    <option value="Hardware">Hardware</option>
                    <option value="Software">Software</option>
                    <option value="Peripherals">Peripherals</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary">Add</button>
                <button type="button" onClick={() => setShowCreate(false)} className="btn btn-secondary">Cancel</button>
              </form>
            </div>
          )}

          {/* Inventory Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Asset / Serial</th>
                  <th>Category</th>
                  <th>Condition</th>
                  <th>Assignment Status</th>
                  <th>Assigned To</th>
                  <th>Lifecycle</th>
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
                      <td>
                        <div style={{ fontWeight: '500' }}>{a.name}</div>
                        <div style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--color-text-secondary)' }}>{a.serial_number || 'N/A'}</div>
                      </td>
                      <td><span className="badge badge-in-progress">{a.category}</span></td>
                      <td>
                        {a.condition === 'Good' ? <span className="badge badge-completed">{a.condition}</span> :
                         a.condition === 'Damaged' ? <span className="badge badge-rejected">{a.condition}</span> :
                         <span>{a.condition}</span>}
                      </td>
                      <td>
                        {a.asset_status === 'Available' ? <span className="badge badge-completed">In Stock</span>
                          : a.assignment_status === 'Acknowledged' ? <span className="badge badge-completed">In Use</span>
                          : a.assignment_status === 'Assigned' ? <span className="badge badge-pending">Pending Delivery</span>
                          : a.assignment_status === 'Returned' ? <span className="badge badge-in-progress">Returned</span>
                          : a.assignment_status === 'Damaged' ? <span className="badge badge-rejected">Reported Damaged</span>
                          : <span className="badge badge-rejected">{a.asset_status}</span>}
                      </td>
                      <td>
                        {a.assigned_to ? (
                            <div>
                                <div style={{ fontWeight: '500' }}>{a.assigned_to}</div>
                                {a.return_date && <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Ret: {new Date(a.return_date).toLocaleDateString()}</div>}
                            </div>
                        ) : '—'}
                      </td>
                      <td>
                         {a.assignment_status === 'Assigned' && (
                             <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={async () => {
                                 try {
                                     await api.put(`/assets/${a.aa_id}/status`, { status: "Delivered" });
                                     fetchInventoryAndUsers();
                                 } catch (err) { alert("Update failed"); }
                             }}>Mark Delivered</button>
                         )}
                         {a.asset_status === 'Assigned' && (
                             <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', fontSize: '11px', marginRight: '4px' }} onClick={() => handleUnassign(a.asset_id)}>Unassign</button>
                         )}
                         {a.asset_status === 'Needs Repair' && (
                             <button className="btn btn-primary btn-sm" style={{ padding: '4px 8px', fontSize: '11px', marginRight: '4px' }} onClick={async () => {
                                 try {
                                     await api.put(`/assets/${a.aa_id}/status`, { status: "Repaired" }); // Note: actual implementation would likely resolve this back to available
                                     fetchInventoryAndUsers();
                                 } catch (err) { alert("Update failed"); }
                             }}><Wrench size={12} style={{marginRight:'4px'}}/> Repair</button>
                         )}
                         {a.asset_status !== 'Assigned' && (
                           <button className="btn btn-danger btn-sm" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={async () => {
                               if(confirm('Are you sure you want to delete this asset?')) {
                                   try {
                                       await api.delete(`/admin/assets/${a.asset_id}`);
                                       fetchInventoryAndUsers();
                                   } catch (err) { alert(err.response?.data?.detail || "Delete failed"); }
                               }
                           }}>Delete</button>
                         )}
                      </td>
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
