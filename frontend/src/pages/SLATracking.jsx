import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Target, Activity } from 'lucide-react';

const SLATracking = () => {
  return (
    <div className="app-layout">
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Navbar />
        <main className="main-content animate-fade-in">
          <div className="page-header">
            <div>
              <h1>SLA Tracking</h1>
              <p>Monitor Onboarding Service Level Agreements (SLAs) across departments</p>
            </div>
          </div>

          <div className="grid-2">
            <div className="card">
              <div className="card-header">
                <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Target size={20} color="var(--color-primary)" /> Target vs Actual Time-to-Onboard
                </span>
              </div>
              <div style={{ padding: '20px 0' }}>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '500' }}>IT Asset Allocation</span>
                    <span style={{ color: 'var(--color-error)', fontWeight: '500' }}>Actual: 3.2 days (Target: 2 days)</span>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar-fill red" style={{ width: '100%' }} />
                    <div style={{ position: 'absolute', top: 0, bottom: 0, left: '60%', borderLeft: '2px dashed var(--color-text)', zIndex: 10 }}></div>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '500' }}>HR Document Verification</span>
                    <span style={{ color: 'var(--color-success)', fontWeight: '500' }}>Actual: 1.5 days (Target: 3 days)</span>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar-fill green" style={{ width: '50%' }} />
                    <div style={{ position: 'absolute', top: 0, bottom: 0, left: '100%', borderLeft: '2px dashed var(--color-text)', zIndex: 10 }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={20} color="var(--color-primary)" /> Department Performance
                </span>
              </div>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '16px' }}>SLA adherence rate by department over the last 30 days.</p>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Adherence Rate</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Engineering</td>
                    <td>94%</td>
                    <td><span className="badge badge-completed">On Target</span></td>
                  </tr>
                  <tr>
                    <td>Finance</td>
                    <td>88%</td>
                    <td><span className="badge badge-pending">Warning</span></td>
                  </tr>
                  <tr>
                    <td>IT</td>
                    <td>72%</td>
                    <td><span className="badge badge-rejected">Breached</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SLATracking;
