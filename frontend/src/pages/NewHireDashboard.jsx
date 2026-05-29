import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import TaskCard from '../components/TaskCard';
import ProgressBar from '../components/ProgressBar';
import api from '../services/api';
import {
  CheckCircle, Circle, Clock, FileText, Monitor,
  GraduationCap, Users, ArrowRight, Sparkles,
  AlertCircle, ChevronRight
} from 'lucide-react';

const NewHireDashboard = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/tasks/my');
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const totalTasks = tasks.length;
  const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const pendingTasks = tasks.filter(t => t.status === 'Pending');
  const upcomingTasks = pendingTasks.slice(0, 3);

  const handleComplete = async (taskId) => {
    try {
      await api.put(`/tasks/${taskId}/complete`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Simulated journey steps based on task categories
  const journeySteps = [
    { title: 'Account Created', status: 'completed', date: user?.joining_date || 'Day 1' },
    { title: 'Personal Information', status: completedTasks > 0 ? 'completed' : 'in-progress', date: '' },
    { title: 'Document Upload', status: completedTasks >= 2 ? 'completed' : completedTasks >= 1 ? 'in-progress' : 'pending', date: '' },
    { title: 'Document Verification', status: completedTasks >= 3 ? 'completed' : 'pending', date: '' },
    { title: 'Asset Allocation', status: completedTasks >= 4 ? 'completed' : 'pending', date: '' },
    { title: 'Training & Compliance', status: completedTasks >= 5 ? 'completed' : 'pending', date: '' },
    { title: 'Buddy Introduction', status: 'pending', date: '' },
    { title: 'Onboarding Completion', status: completionPct === 100 ? 'completed' : 'pending', date: '' },
  ];

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar />
        <div style={{ flex: 1 }}>
          <Navbar />
          <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="animate-pulse" style={{ color: 'var(--color-text-muted)' }}>Loading dashboard...</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Navbar />
        <main className="main-content animate-fade-in">
          {/* Welcome Header */}
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '700' }}>
              Welcome back, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Let's complete your onboarding journey. You're doing great!
            </p>
          </div>

          {/* Onboarding Progress Banner */}
          <div className="card" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 32px' }}>
            <div>
              <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Onboarding Progress</div>
              <div style={{ fontSize: '48px', fontWeight: '700', fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>
                {completionPct}%
              </div>
            </div>
            <ProgressBar 
              completionPct={completionPct} 
              totalTasks={totalTasks} 
              completedTasks={completedTasks} 
            />
          </div>

          {/* Stat Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue"><CheckCircle size={22} /></div>
              <div>
                <div className="stat-value">{completedTasks} <span style={{ fontSize: '16px', color: 'var(--color-text-muted)', fontWeight: '400' }}>/ {totalTasks}</span></div>
                <div className="stat-label">Tasks Completed</div>
                <Link to="/new-hire/checklist" className="stat-link">View Checklist <ChevronRight size={14} /></Link>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green"><FileText size={22} /></div>
              <div>
                <div className="stat-value">0 <span style={{ fontSize: '16px', color: 'var(--color-text-muted)', fontWeight: '400' }}>/ 6</span></div>
                <div className="stat-label">Documents Verified</div>
                <Link to="/new-hire/documents" className="stat-link">View Documents <ChevronRight size={14} /></Link>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon orange"><Monitor size={22} /></div>
              <div>
                <div className="stat-value">0 <span style={{ fontSize: '16px', color: 'var(--color-text-muted)', fontWeight: '400' }}>/ 3</span></div>
                <div className="stat-label">Assets Assigned</div>
                <Link to="/new-hire/assets" className="stat-link">View Assets <ChevronRight size={14} /></Link>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon cyan"><GraduationCap size={22} /></div>
              <div>
                <div className="stat-value">0 <span style={{ fontSize: '16px', color: 'var(--color-text-muted)', fontWeight: '400' }}>/ 2</span></div>
                <div className="stat-label">Trainings Completed</div>
                <Link to="/new-hire/trainings" className="stat-link">View Trainings <ChevronRight size={14} /></Link>
              </div>
            </div>
          </div>

          {/* Three Column Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            {/* Onboarding Journey */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Onboarding Journey</span>
              </div>
              <div className="timeline">
                {journeySteps.map((step, i) => (
                  <div key={i} className={`timeline-item ${step.status}`}>
                    <div className="timeline-title">{step.title}</div>
                    <div className="timeline-date">
                      {step.status === 'completed' ? '✅ Completed' : step.status === 'in-progress' ? '🔄 In Progress' : 'Pending'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Tasks */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Upcoming Tasks</span>
                <Link to="/new-hire/checklist" style={{ fontSize: '13px', color: 'var(--color-primary)' }}>View All</Link>
              </div>
              {upcomingTasks.length === 0 ? (
                <div className="empty-state">
                  <CheckCircle size={32} />
                  <h3>All caught up!</h3>
                  <p>No pending tasks right now.</p>
                </div>
              ) : (
                upcomingTasks.map((task, i) => (
                  <TaskCard 
                    key={task.task_id} 
                    task={task} 
                    isLast={i === upcomingTasks.length - 1} 
                    onComplete={handleComplete} 
                  />
                ))
              )}
            </div>

            {/* Your Buddy + AI Recommendation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Buddy Card */}
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Your Buddy</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10b981, #34d399)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: '600',
                    color: 'white'
                  }}>B</div>
                  <div>
                    <div style={{ fontWeight: '500' }}>Buddy Not Assigned</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Check back soon</div>
                  </div>
                </div>
                <Link to="/new-hire/buddy" className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                  View Buddy Details
                </Link>
              </div>

              {/* AI Recommendation */}
              <div className="card" style={{ background: 'linear-gradient(135deg, rgba(79,110,247,0.08), rgba(124,58,237,0.08))', borderColor: 'rgba(79,110,247,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Sparkles size={18} color="var(--color-primary)" />
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>AI Recommendation</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: '12px' }}>
                  {pendingTasks.length > 0
                    ? `You're on track! Complete "${pendingTasks[0]?.title}" to unlock the next milestone.`
                    : "Great job! You've completed all assigned tasks. Check your trainings next."
                  }
                </p>
                <Link to="/chat" style={{ fontSize: '13px', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Ask AI Assistant <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Activity + Notifications */}
          <div className="grid-2">
            <div className="card">
              <div className="card-header">
                <span className="card-title">Recent Activity</span>
                <span style={{ fontSize: '13px', color: 'var(--color-primary)', cursor: 'pointer' }}>View All</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {tasks.filter(t => t.status === 'Completed').slice(0, 3).map((task, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0' }}>
                    <CheckCircle size={16} color="var(--color-success)" />
                    <span style={{ fontSize: '13px', flex: 1 }}>Completed: {task.title}</span>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Recently</span>
                  </div>
                ))}
                {tasks.filter(t => t.status === 'Completed').length === 0 && (
                  <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', padding: '12px 0' }}>No recent activity yet. Start completing your tasks!</div>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <span className="card-title">Notifications</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0' }}>
                  <AlertCircle size={16} color="var(--color-warning)" />
                  <span style={{ fontSize: '13px', flex: 1 }}>Welcome to Wipro! Complete your onboarding checklist.</span>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Today</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0' }}>
                  <FileText size={16} color="var(--color-info)" />
                  <span style={{ fontSize: '13px', flex: 1 }}>Please upload your identity documents.</span>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Today</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0' }}>
                  <GraduationCap size={16} color="var(--color-accent)" />
                  <span style={{ fontSize: '13px', flex: 1 }}>Security training has been assigned to you.</span>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Yesterday</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NewHireDashboard;
