import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { Users, Search, ArrowUpDown } from 'lucide-react';

const OnboardingTracker = () => {
  const [hires, setHires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchHires(); }, []);

  const fetchHires = async () => {
    try {
      const res = await api.get('/admin/onboarding-status');
      setHires(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filtered = hires.filter(h =>
    h.name?.toLowerCase().includes(search.toLowerCase()) ||
    h.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Navbar />
        <main className="main-content animate-fade-in">
          <div className="page-header">
            <div>
              <h1>Onboarding Tracker</h1>
              <p>Track all new hire completion status</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  type="text" placeholder="Search employees..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="form-input" style={{ paddingLeft: '36px', width: '250px' }}
                />
              </div>
              <span className="badge badge-in-progress">{hires.length} Total</span>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Tasks Done</th>
                  <th>Docs Verified</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '32px' }}>Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>No new hires found.</td></tr>
                ) : (
                  filtered.sort((a, b) => (a.completion_percentage || 0) - (b.completion_percentage || 0)).map((hire, i) => (
                    <tr key={i}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: `hsl(${(i * 60) % 360}, 60%, 50%)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '13px', fontWeight: '600', color: 'white'
                          }}>{hire.name?.charAt(0)?.toUpperCase()}</div>
                          <div>
                            <div style={{ fontWeight: '500' }}>{hire.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{hire.email}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="badge badge-in-progress">{hire.department || 'N/A'}</span></td>
                      <td>{hire.completed_tasks}/{hire.total_tasks}</td>
                      <td>{hire.verified_docs || 0}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="progress-bar-container" style={{ width: '120px' }}>
                            <div className={`progress-bar-fill ${hire.completion_percentage >= 80 ? 'green' : hire.completion_percentage >= 40 ? '' : 'orange'}`}
                              style={{ width: `${hire.completion_percentage || 0}%` }} />
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: '600', minWidth: '36px' }}>{hire.completion_percentage || 0}%</span>
                        </div>
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

export default OnboardingTracker;
