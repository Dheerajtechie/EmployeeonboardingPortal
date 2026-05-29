import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import TaskCard from '../components/TaskCard';
import ProgressBar from '../components/ProgressBar';
import api from '../services/api';
import { CheckCircle } from 'lucide-react';

const MyChecklist = () => {
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

  const handleComplete = async (taskId) => {
    try {
      await api.put(`/tasks/${taskId}/complete`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar />
        <div style={{ flex: 1 }}>
          <Navbar />
          <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="animate-pulse" style={{ color: 'var(--color-text-muted)' }}>Loading checklist...</div>
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
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '700' }}>My Checklist</h1>
            <p style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Complete these tasks to finish your onboarding.
            </p>
          </div>

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

          <div className="card">
            <div className="card-header">
              <span className="card-title">All Tasks</span>
            </div>
            
            {tasks.length === 0 ? (
              <div className="empty-state">
                <CheckCircle size={32} />
                <h3>No tasks assigned</h3>
                <p>You have no onboarding tasks at the moment.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {tasks.map((task, i) => (
                  <TaskCard 
                    key={task.task_id} 
                    task={task} 
                    isLast={i === tasks.length - 1} 
                    onComplete={handleComplete} 
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MyChecklist;
