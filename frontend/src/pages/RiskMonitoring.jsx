import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { AlertTriangle, ShieldAlert, ArrowRight } from 'lucide-react';

const RiskMonitoring = () => {
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRisks = async () => {
      try {
        const res = await api.get('/enterprise/risk-monitoring');
        setRisks(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRisks();
  }, []);

  return (
    <div className="app-layout">
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Navbar />
        <main className="main-content animate-fade-in">
          <div className="page-header">
            <div>
              <h1>Risk Monitoring</h1>
              <p>Identify and mitigate onboarding bottlenecks and compliance risks</p>
            </div>
          </div>

          <div className="card" style={{ borderTop: '4px solid var(--color-error)' }}>
            <div className="card-header">
              <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={20} color="var(--color-error)" /> At-Risk Employees
              </span>
            </div>
            <div className="table-container" style={{ border: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Email</th>
                    <th>Pipeline Status</th>
                    <th>Risk Level</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '32px' }}>Loading...</td></tr>
                  ) : risks.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '48px', color: 'var(--color-success)' }}>
                      <AlertTriangle size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                      No active risks detected. Pipeline is healthy!
                    </td></tr>
                  ) : (
                    risks.map((r, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: '500' }}>{r.name}</td>
                        <td>{r.email}</td>
                        <td>
                          <span className={`badge ${r.status === 'Blocked' ? 'badge-rejected' : 'badge-pending'}`}>
                            {r.status}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${r.risk === 'High' ? 'badge-rejected' : 'badge-pending'}`} style={{ fontSize: '13px', fontWeight: 'bold' }}>
                            {r.risk} Risk
                          </span>
                        </td>
                        <td>
                          <Link to={`/hr/employee-360/${r.user_id}`} className="btn btn-sm btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            Investigate <ArrowRight size={14} />
                          </Link>
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

export default RiskMonitoring;
