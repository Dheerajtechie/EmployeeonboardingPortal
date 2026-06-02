import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { Users, Mail, Phone, Calendar, MessageSquare, Video, CheckCircle, Send } from 'lucide-react';

const MyBuddy = () => {
  const [buddy, setBuddy] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSchedule, setShowSchedule] = useState(false);
  const [meetingDate, setMeetingDate] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [messageText, setMessageText] = useState("");

  useEffect(() => { fetchBuddy(); }, []);

  const fetchBuddy = async () => {
    try {
      const res = await api.get('/buddy/my');
      setBuddy(res.data);
      if (res.data?.buddy_id) {
        const cRes = await api.get(`/buddy/meetings/${res.data.buddy_id}`);
        setMeetings(cRes.data || []);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSchedule = async (e) => {
      e.preventDefault();
      try {
          await api.post('/buddy/meetings', {
              buddy_id: buddy.buddy_id,
              meeting_date: new Date(meetingDate).toISOString()
          });
          setShowSchedule(false);
          setMeetingDate("");
          fetchBuddy();
          alert("Meeting scheduled successfully");
      } catch (err) {
          alert("Failed to schedule meeting");
      }
  };

  const handleSendMessage = async (e) => {
      e.preventDefault();
      try {
          await api.post('/buddy/message', {
              recipient_id: buddy.buddy_user_id,
              message: messageText
          });
          setShowMessage(false);
          setMessageText("");
          alert("Message sent to your buddy successfully!");
      } catch (err) {
          alert("Failed to send message");
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
              <h1>My Buddy</h1>
              <p>Your assigned mentor to guide you through onboarding</p>
            </div>
          </div>

          {loading ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px' }}>Loading...</div>
          ) : !buddy ? (
            <div className="card empty-state">
              <Users size={48} />
              <h3>No Buddy Assigned Yet</h3>
              <p>HR will assign an experienced colleague to guide you. Check back soon!</p>
            </div>
          ) : (
            <div className="grid-2" style={{ gap: '24px' }}>
              {/* Buddy Profile Card */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10b981, #34d399)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '24px', fontWeight: '700', color: 'white'
                  }}>
                    {buddy.buddy_name?.charAt(0)?.toUpperCase() || 'B'}
                  </div>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: '600' }}>{buddy.buddy_name}</div>
                    <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Senior Consultant</div>
                  </div>
                </div>

                {/* Contact Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                    <Mail size={16} color="var(--color-text-muted)" />
                    <span>{buddy.buddy_email}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                    <Calendar size={16} color="var(--color-text-muted)" />
                    <span>Assigned: {buddy.assigned_date ? new Date(buddy.assigned_date).toLocaleDateString() : 'Recently'}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setShowMessage(true)} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                    <MessageSquare size={16} /> Message
                  </button>
                  <button onClick={() => setShowSchedule(!showSchedule)} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                    <Video size={16} /> Schedule Meeting
                  </button>
                </div>
                
                {showSchedule && (
                    <form onSubmit={handleSchedule} style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                        <input type="datetime-local" className="form-input" value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} required />
                        <button type="submit" className="btn btn-primary">Confirm</button>
                    </form>
                )}

                {showMessage && (
                  <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000
                  }}>
                    <div className="card animate-slide-up" style={{ width: '450px' }}>
                      <h3 style={{ marginBottom: '16px' }}>Send Message to {buddy.buddy_name}</h3>
                      <textarea
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        className="form-input"
                        rows={4}
                        placeholder="Type your message here..."
                      />
                      <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'flex-end' }}>
                        <button onClick={() => { setShowMessage(false); setMessageText(''); }} className="btn btn-secondary">Cancel</button>
                        <button onClick={handleSendMessage} className="btn btn-primary">
                          <Send size={14} /> Send Message
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Check-in History */}
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Meeting History</span>
                </div>
                {meetings.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                    <Calendar size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
                    <p>No meetings scheduled yet.</p>
                  </div>
                ) : (
                  <div className="timeline">
                    {meetings.map((c, i) => (
                      <div key={i} className={`timeline-item ${c.status === 'Completed' ? 'completed' : 'pending'}`}>
                        <div className="timeline-title">
                            {c.status === 'Completed' ? 'Completed Meeting' : 'Upcoming Meeting'}
                            <span className={`badge ${c.status==='Completed'?'badge-completed':'badge-pending'}`} style={{marginLeft:'8px'}}>{c.status}</span>
                        </div>
                        <div className="timeline-date">{new Date(c.meeting_date).toLocaleString()}</div>
                        {c.meeting_notes && <div style={{ fontSize: '13px', marginTop: '8px', fontStyle: 'italic' }}>"{c.meeting_notes}"</div>}
                        {c.effectiveness_score && <div style={{ fontSize: '12px', marginTop: '4px', color: 'var(--color-primary)' }}>Rating: {c.effectiveness_score}/10</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Why a Buddy? */}
              <div className="card" style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg, rgba(16,185,129,0.05), rgba(52,211,153,0.05))', borderColor: 'rgba(16,185,129,0.15)' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={18} color="var(--color-success)" /> Why a Buddy?
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.7' }}>
                  Your buddy is an experienced colleague assigned to help you settle in during your first 90 days. They will check in with you weekly,
                  answer questions about the company culture, introduce you to key people, and help you navigate the onboarding process smoothly.
                  Don't hesitate to reach out to them anytime!
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MyBuddy;
