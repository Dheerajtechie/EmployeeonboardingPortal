import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { Users, MessageSquare, Calendar, Send, CheckCircle } from 'lucide-react';

const BuddyDashboard = () => {
  const { user } = useContext(AuthContext);
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCheckin, setShowCheckin] = useState(null);
  const [checkinNotes, setCheckinNotes] = useState('');
  const [checkins, setCheckins] = useState([]);

  useEffect(() => { fetchMentees(); }, []);

  const fetchMentees = async () => {
    try {
      // Get all new hires to check who is assigned
      const res = await api.get('/admin/onboarding-status');
      setMentees(res.data);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const handleCheckin = async (buddyId) => {
    try {
      await api.post('/buddy/checkin', {
        buddy_id: buddyId,
        notes: checkinNotes,
        checkin_date: new Date().toISOString().split('T')[0]
      });
      setShowCheckin(null);
      setCheckinNotes('');
      alert('Check-in logged successfully!');
    } catch (err) { alert('Failed to log check-in'); }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Navbar />
        <main className="main-content animate-fade-in">
          <div className="page-header">
            <div>
              <h1>My Mentees</h1>
              <p>Your assigned new hires and their progress</p>
            </div>
          </div>

          {loading ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px' }}>Loading...</div>
          ) : mentees.length === 0 ? (
            <div className="card empty-state">
              <Users size={48} />
              <h3>No mentees assigned</h3>
              <p>HR will assign new hires to you as their buddy.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
              {mentees.map((mentee, i) => (
                <div key={i} className="card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '50%',
                      background: `hsl(${(i * 80) % 360}, 60%, 50%)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '18px', fontWeight: '600', color: 'white'
                    }}>{mentee.name?.charAt(0)?.toUpperCase()}</div>
                    <div>
                      <div style={{ fontWeight: '600' }}>{mentee.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{mentee.email}</div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Onboarding Progress</span>
                      <span style={{ fontSize: '13px', fontWeight: '600' }}>{mentee.completion_percentage || 0}%</span>
                    </div>
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: `${mentee.completion_percentage || 0}%` }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setShowCheckin(mentee)} className="btn btn-sm btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                      <MessageSquare size={14} /> Log Check-in
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Check-in Modal */}
          {showCheckin && (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1000
            }}>
              <div className="card animate-slide-up" style={{ width: '450px' }}>
                <h3 style={{ marginBottom: '4px' }}>Log Check-in</h3>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '16px', fontSize: '14px' }}>
                  Check-in notes for {showCheckin.name}
                </p>
                <textarea
                  value={checkinNotes}
                  onChange={(e) => setCheckinNotes(e.target.value)}
                  className="form-input"
                  rows={4}
                  placeholder="How was your session? Any concerns or progress to note..."
                />
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'flex-end' }}>
                  <button onClick={() => { setShowCheckin(null); setCheckinNotes(''); }} className="btn btn-secondary">Cancel</button>
                  <button onClick={() => handleCheckin(1)} className="btn btn-primary">
                    <Send size={14} /> Submit
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default BuddyDashboard;
