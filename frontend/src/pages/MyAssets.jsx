import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import AssetCard from '../components/AssetCard';
import api from '../services/api';
import { Package, AlertCircle, CheckCircle, Monitor } from 'lucide-react';

const MyAssets = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAssets(); }, []);

  const fetchAssets = async () => {
    try {
      const res = await api.get('/assets/my');
      setAssets(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleConfirm = async (aaId) => {
    try {
      await api.put(`/assets/${aaId}/confirm`);
      fetchAssets();
    } catch (err) { alert('Confirmation failed'); }
  };

  const totalAssets = assets.length;
  const confirmedAssets = assets.filter(a => a.confirmed_at).length;
  const pendingAssets = totalAssets - confirmedAssets;

  return (
    <div className="app-layout">
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Navbar />
        <main className="main-content animate-fade-in">
          <div className="page-header">
            <div>
              <h1>Assets Dashboard</h1>
              <p>Track and manage employee assets</p>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="stats-grid" style={{ marginBottom: '24px' }}>
            <div className="stat-card">
              <div className="stat-icon blue"><Package size={22} /></div>
              <div>
                <div className="stat-value">{totalAssets}</div>
                <div className="stat-label">Total Assigned</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green"><CheckCircle size={22} /></div>
              <div>
                <div className="stat-value">{confirmedAssets}</div>
                <div className="stat-label">Confirmed</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon orange"><AlertCircle size={22} /></div>
              <div>
                <div className="stat-value">{pendingAssets}</div>
                <div className="stat-label">Pending Confirmation</div>
              </div>
            </div>
          </div>

          {/* Assets Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Serial Number</th>
                  <th>Category</th>
                  <th>Condition</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '32px' }}>Loading...</td></tr>
                ) : assets.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>
                    <Monitor size={32} style={{ marginBottom: '12px', opacity: 0.5 }} /><br />
                    No assets assigned to you yet. IT will assign your equipment soon.
                  </td></tr>
                ) : (
                  assets.map((a, i) => (
                    <AssetCard 
                      key={i} 
                      assignment={a} 
                      onConfirm={handleConfirm} 
                    />
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

export default MyAssets;
