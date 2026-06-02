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
  const [meetings, setMeetings] = useState([]);
  const [showCheckin, setShowCheckin] = useState(null); // stores meeting object
  const [checkinNotes, setCheckinNotes] = useState('');
  const [effectivenessScore, setEffectivenessScore] = useState(10);
  const [showMessage, setShowMessage] = useState(null); // stores mentee object
  const [messageText, setMessageText] = useState("");


  useEffect(() => { fetchMenteesAndMeetings(); }, []);

  const fetchMenteesAndMeetings = async () => {
    try {
      const res = await api.get('/buddy/assigned');
      setMentees(res.data);
      const mRes = await api.get('/buddy/meetings/assigned');
      setMeetings(mRes.data);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const handleFeedback = async (meetingId) => {
    try {
      await api.put(`/buddy/meetings/${meetingId}/feedback`, {
        meeting_notes: checkinNotes,
        effectiveness_score: effectivenessScore
      });
      setShowCheckin(null);
      setCheckinNotes('');
      setEffectivenessScore(10);
      fetchMenteesAndMeetings();
      alert('Feedback logged successfully!');
    } catch (err) { alert('Failed to log feedback'); }
  };

  const handleSendMessage = async (menteeId) => {
    try {
      await api.post('/buddy/message', {
        recipient_id: menteeId,
        message: messageText
      });
      setShowMessage(null);
      setMessageText("");
      alert("Message sent to mentee successfully!");
    } catch (err) { alert("Failed to send message"); }
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

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <button onClick={() => setShowMessage(mentee)} className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                      <MessageSquare size={14} /> Message
                    </button>
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
                  <div style={{ marginTop: '16px' }}>
                    <h4 style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Upcoming Meetings</h4>
                    {meetings.filter(m => m.new_hire_id === mentee.user_id && m.status === 'Scheduled').length === 0 ? (
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No upcoming meetings</div>
                    ) : (
                        meetings.filter(m => m.new_hire_id === mentee.user_id && m.status === 'Scheduled').map((m, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-surface-hover)', padding: '8px', borderRadius: '4px', marginBottom: '4px' }}>
                                <span style={{ fontSize: '13px' }}>{new Date(m.meeting_date).toLocaleDateString()}</span>
                                <button onClick={() => setShowCheckin(m)} className="btn btn-sm btn-primary" style={{ padding: '4px 8px', fontSize: '11px' }}>Log Feedback</button>
                            </div>
                        ))
                    )}
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
                <h3 style={{ marginBottom: '4px' }}>Submit Meeting Feedback</h3>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '16px', fontSize: '14px' }}>
                  Feedback for meeting on {new Date(showCheckin.meeting_date).toLocaleDateString()}
                </p>
                <div style={{ marginBottom: '12px' }}>
                    <label className="form-label">Effectiveness Score (1-10)</label>
                    <input type="number" min="1" max="10" className="form-input" value={effectivenessScore} onChange={(e) => setEffectivenessScore(parseInt(e.target.value))} />
                </div>
                <textarea
                  value={checkinNotes}
                  onChange={(e) => setCheckinNotes(e.target.value)}
                  className="form-input"
                  rows={4}
                  placeholder="How was the session? Any concerns or progress to note..."
                />
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'flex-end' }}>
                  <button onClick={() => { setShowCheckin(null); setCheckinNotes(''); setEffectivenessScore(10); }} className="btn btn-secondary">Cancel</button>
                  <button onClick={() => handleFeedback(showCheckin.meeting_id)} className="btn btn-primary">
                    <Send size={14} /> Submit
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Message Modal */}
          {showMessage && (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1000
            }}>
              <div className="card animate-slide-up" style={{ width: '450px' }}>
                <h3 style={{ marginBottom: '16px' }}>Send Message to {showMessage.name}</h3>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="form-input"
                  rows={4}
                  placeholder="Type your message here..."
                />
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'flex-end' }}>
                  <button onClick={() => { setShowMessage(null); setMessageText(''); }} className="btn btn-secondary">Cancel</button>
                  <button onClick={() => handleSendMessage(showMessage.user_id)} className="btn btn-primary">
                    <Send size={14} /> Send Message
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
