import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import TrainingCard from '../components/TrainingCard';
import api from '../services/api';
import { GraduationCap } from 'lucide-react';

const MyTrainings = () => {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchTrainings(); }, []);

  const fetchTrainings = async () => {
    try {
      const res = await api.get('/trainings/my');
      setTrainings(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleComplete = async (taId) => {
    try {
      await api.put(`/trainings/${taId}/complete`);
      fetchTrainings();
    } catch (err) { console.error(err); }
  };

  const completedCount = trainings.filter(t => t.status === 'Completed').length;
  const inProgressCount = trainings.filter(t => t.status === 'In-Progress').length;
  const pendingCount = trainings.filter(t => t.status === 'Pending').length;

  return (
    <div className="app-layout">
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Navbar />
        <main className="main-content animate-fade-in">
          <div className="page-header">
            <div>
              <h1>My Trainings</h1>
              <p>Track your learning progress</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '13px' }}>
              <span className="badge badge-in-progress">In Progress ({inProgressCount})</span>
              <span className="badge badge-completed">Completed ({completedCount})</span>
              <span className="badge badge-pending">Pending ({pendingCount})</span>
            </div>
          </div>

          {/* Training Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {loading ? (
              <div className="card" style={{ textAlign: 'center', padding: '48px' }}>Loading trainings...</div>
            ) : trainings.length === 0 ? (
              <div className="card empty-state">
                <GraduationCap size={40} />
                <h3>No trainings assigned yet</h3>
                <p>Your trainings will appear here once assigned by HR.</p>
              </div>
            ) : (
              trainings.map((t, i) => (
                <TrainingCard 
                  key={i} 
                  assignment={t} 
                  onComplete={handleComplete} 
                />
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MyTrainings;
