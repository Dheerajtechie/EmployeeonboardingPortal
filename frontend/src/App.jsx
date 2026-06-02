import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext, Component } from 'react';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import HRDashboard from './pages/HRDashboard';
import Employee360 from './pages/Employee360';
import RiskMonitoring from './pages/RiskMonitoring';
import SLATracking from './pages/SLATracking';
import ApprovalCenter from './pages/ApprovalCenter';
import AICopilot from './pages/AICopilot';
import OnboardingTracker from './pages/OnboardingTracker';
import DocumentReview from './pages/DocumentReview';
import BuddyManagement from './pages/BuddyManagement';
import ITAssetPanel from './pages/ITAssetPanel';
import BuddyDashboard from './pages/BuddyDashboard';
import SetPassword from './pages/SetPassword';
import BulkTaskAssignment from './pages/BulkTaskAssignment';
import ReportsExport from './pages/ReportsExport';
import DepartmentManagement from './pages/DepartmentManagement';
import ChatPage from './pages/ChatPage';
import NewHireDashboard from './pages/NewHireDashboard';
import MyChecklist from './pages/MyChecklist';
import MyDocuments from './pages/MyDocuments';
import MyAssets from './pages/MyAssets';
import MyTrainings from './pages/MyTrainings';
import MyBuddy from './pages/MyBuddy';
import ChatWidget from './components/ChatWidget';

// Error Boundary to catch crashes and show message instead of blank screen
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', color: '#ef4444', background: '#0f1117', minHeight: '100vh' }}>
          <h2>Something went wrong</h2>
          <pre style={{ marginTop: '16px', color: '#94a3b8', fontSize: '13px', whiteSpace: 'pre-wrap' }}>
            {this.state.error?.message}
          </pre>
          <button onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}
            style={{ marginTop: '20px', padding: '10px 20px', background: '#4f6ef7', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            Back to Login
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'white', background: '#0f1117' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>Loading...</div>
          <div style={{ fontSize: '13px', color: '#64748b' }}>Please wait</div>
        </div>
      </div>
    );
  }

  if (!user || !user.role) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const DashboardRedirect = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'white', background: '#0f1117' }}>
        Loading...
      </div>
    );
  }

  if (!user || !user.role) {
    return <Navigate to="/login" replace />;
  }
  
  switch(user.role) {
    case 'hr_admin': return <Navigate to="/hr/dashboard" replace />;
    case 'it_admin': return <Navigate to="/it/assets" replace />;
    case 'buddy': return <Navigate to="/buddy/dashboard" replace />;
    case 'new_hire': return <Navigate to="/new-hire/dashboard" replace />;
    default: return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<DashboardRedirect />} />
        
        {/* HR Admin Routes */}
        <Route path="/hr/dashboard" element={<PrivateRoute roles={['hr_admin']}><HRDashboard /></PrivateRoute>} />
        <Route path="/hr/employee-360/:id" element={<PrivateRoute roles={['hr_admin']}><Employee360 /></PrivateRoute>} />
        <Route path="/hr/risk" element={<PrivateRoute roles={['hr_admin']}><RiskMonitoring /></PrivateRoute>} />
        <Route path="/hr/sla" element={<PrivateRoute roles={['hr_admin']}><SLATracking /></PrivateRoute>} />
        <Route path="/hr/approvals" element={<PrivateRoute roles={['hr_admin']}><ApprovalCenter /></PrivateRoute>} />
        <Route path="/hr/copilot" element={<PrivateRoute roles={['hr_admin']}><AICopilot /></PrivateRoute>} />
        <Route path="/hr/tracker" element={<PrivateRoute roles={['hr_admin']}><OnboardingTracker /></PrivateRoute>} />
        <Route path="/hr/documents" element={<PrivateRoute roles={['hr_admin']}><DocumentReview /></PrivateRoute>} />
        <Route path="/hr/buddies" element={<PrivateRoute roles={['hr_admin']}><BuddyManagement /></PrivateRoute>} />
        <Route path="/hr/bulk-assign" element={<PrivateRoute roles={['hr_admin']}><BulkTaskAssignment /></PrivateRoute>} />
        <Route path="/hr/reports" element={<PrivateRoute roles={['hr_admin']}><ReportsExport /></PrivateRoute>} />
        <Route path="/hr/departments" element={<PrivateRoute roles={['hr_admin']}><DepartmentManagement /></PrivateRoute>} />
        
        {/* New Hire Routes */}
        <Route path="/set-password" element={<PrivateRoute roles={['new_hire', 'hr_admin', 'it_admin', 'buddy']}><SetPassword /></PrivateRoute>} />
        <Route path="/new-hire/dashboard" element={<PrivateRoute roles={['new_hire']}><NewHireDashboard /></PrivateRoute>} />
        <Route path="/new-hire/checklist" element={<PrivateRoute roles={['new_hire']}><MyChecklist /></PrivateRoute>} />
        <Route path="/new-hire/documents" element={<PrivateRoute roles={['new_hire']}><MyDocuments /></PrivateRoute>} />
        <Route path="/new-hire/assets" element={<PrivateRoute roles={['new_hire']}><MyAssets /></PrivateRoute>} />
        <Route path="/new-hire/trainings" element={<PrivateRoute roles={['new_hire']}><MyTrainings /></PrivateRoute>} />
        <Route path="/new-hire/buddy" element={<PrivateRoute roles={['new_hire']}><MyBuddy /></PrivateRoute>} />
        
        {/* IT Admin Routes */}
        <Route path="/it/assets" element={<PrivateRoute roles={['it_admin']}><ITAssetPanel /></PrivateRoute>} />
        
        {/* Buddy Routes */}
        <Route path="/buddy/dashboard" element={<PrivateRoute roles={['buddy']}><BuddyDashboard /></PrivateRoute>} />
        
        {/* Shared Routes */}
        <Route path="/chat" element={<PrivateRoute roles={['new_hire', 'hr_admin', 'it_admin', 'buddy']}><ChatPage /></PrivateRoute>} />
      </Routes>
      <ChatWidget />
    </ErrorBoundary>
  );
}

export default App;
