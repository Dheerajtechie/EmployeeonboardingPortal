import { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { Download, BarChart3, FileText, Loader2 } from 'lucide-react';

const ReportsExport = () => {
  const [downloading, setDownloading] = useState(false);

  const handleExport = async () => {
    setDownloading(true);
    try {
      const res = await api.get('/admin/reports/export', { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `onboarding_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      alert('Export failed');
    } finally {
      setDownloading(false);
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
              <h1>Reports & Export</h1>
              <p>Generate and download onboarding reports</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {/* Onboarding Status Report */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: 'var(--color-primary-light)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center'
                }}>
                  <BarChart3 size={22} color="var(--color-primary)" />
                </div>
                <div>
                  <div style={{ fontWeight: '600' }}>Onboarding Status Report</div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>All new hires with completion %</div>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                Export a comprehensive CSV report of all new hire onboarding progress including task completion rates,
                document verification status, and department breakdowns.
              </p>
              <button onClick={handleExport} disabled={downloading} className="btn btn-primary" style={{ justifyContent: 'center' }}>
                {downloading ? <><Loader2 size={16} className="animate-spin" /> Generating...</> : <><Download size={16} /> Export CSV</>}
              </button>
            </div>

            {/* More report cards */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: 'var(--color-success-bg)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center'
                }}>
                  <FileText size={22} color="var(--color-success)" />
                </div>
                <div>
                  <div style={{ fontWeight: '600' }}>Document Verification Report</div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Document review status</div>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                Track document submission and verification progress across all new hires.
                Identify missing or rejected documents requiring attention.
              </p>
              <button className="btn btn-secondary" style={{ justifyContent: 'center' }}>
                <Download size={16} /> Export CSV
              </button>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: 'var(--color-warning-bg)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center'
                }}>
                  <BarChart3 size={22} color="var(--color-warning)" />
                </div>
                <div>
                  <div style={{ fontWeight: '600' }}>Training Compliance Report</div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Mandatory training completion</div>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                Monitor mandatory training completion rates, identify overdue assignments,
                and ensure compliance with organizational training requirements.
              </p>
              <button className="btn btn-secondary" style={{ justifyContent: 'center' }}>
                <Download size={16} /> Export CSV
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReportsExport;
