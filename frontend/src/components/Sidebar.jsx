import { useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  LayoutDashboard, CheckSquare, FileText, Monitor,
  GraduationCap, Users, MessageSquare, BarChart3,
  Settings, ChevronRight
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const role = user?.role;

  const linkStyle = (path) => {
    const isActive = location.pathname === path;
    return {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '10px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: isActive ? '500' : '400',
      color: isActive ? 'white' : 'var(--color-text-secondary)',
      background: isActive ? 'var(--color-primary)' : 'transparent',
      textDecoration: 'none',
      transition: 'all 0.15s ease',
      marginBottom: '2px'
    };
  };

  const sectionTitle = (text) => (
    <div style={{
      fontSize: '11px',
      fontWeight: '600',
      color: 'var(--color-text-muted)',
      textTransform: 'uppercase',
      letterSpacing: '0.8px',
      padding: '16px 16px 8px',
    }}>{text}</div>
  );

  return (
    <aside style={{
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      width: 'var(--sidebar-width)',
      background: 'var(--color-sidebar)',
      borderRight: '1px solid var(--color-border)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 200,
      overflowY: 'auto'
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            fontSize: '16px',
            color: 'white'
          }}>W</div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-text)' }}>wipro</div>
            <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', letterSpacing: '0.5px' }}>AI-Powered Onboarding</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '8px 12px', overflowY: 'auto' }}>
        {/* New Hire Navigation */}
        {role === 'new_hire' && (
          <>
            {sectionTitle('Main')}
            <NavLink to="/new-hire/dashboard" style={() => linkStyle('/new-hire/dashboard')}>
              <LayoutDashboard size={18} /> Dashboard
            </NavLink>
            <NavLink to="/new-hire/checklist" style={() => linkStyle('/new-hire/checklist')}>
              <CheckSquare size={18} /> My Checklist
            </NavLink>
            <NavLink to="/new-hire/documents" style={() => linkStyle('/new-hire/documents')}>
              <FileText size={18} /> Documents
            </NavLink>
            <NavLink to="/new-hire/assets" style={() => linkStyle('/new-hire/assets')}>
              <Monitor size={18} /> Assets
            </NavLink>
            <NavLink to="/new-hire/trainings" style={() => linkStyle('/new-hire/trainings')}>
              <GraduationCap size={18} /> Trainings
            </NavLink>
            <NavLink to="/new-hire/buddy" style={() => linkStyle('/new-hire/buddy')}>
              <Users size={18} /> Buddy
            </NavLink>
            {sectionTitle('Support')}
            <NavLink to="/chat" style={() => linkStyle('/chat')}>
              <MessageSquare size={18} /> AI Assistant
            </NavLink>
          </>
        )}

        {/* HR Admin Navigation */}
        {role === 'hr_admin' && (
          <>
            {sectionTitle('Overview')}
            <NavLink to="/hr/dashboard" style={() => linkStyle('/hr/dashboard')}>
              <LayoutDashboard size={18} /> Dashboard
            </NavLink>
            <NavLink to="/hr/tracker" style={() => linkStyle('/hr/tracker')}>
              <CheckSquare size={18} /> Onboarding Tracker
            </NavLink>
            {sectionTitle('Manage')}
            <NavLink to="/hr/documents" style={() => linkStyle('/hr/documents')}>
              <FileText size={18} /> Documents
            </NavLink>
            <NavLink to="/hr/buddies" style={() => linkStyle('/hr/buddies')}>
              <Users size={18} /> Buddy Management
            </NavLink>
            <NavLink to="/hr/bulk-assign" style={() => linkStyle('/hr/bulk-assign')}>
              <CheckSquare size={18} /> Bulk Assign
            </NavLink>
            <NavLink to="/hr/departments" style={() => linkStyle('/hr/departments')}>
              <BarChart3 size={18} /> Departments
            </NavLink>
            {sectionTitle('Reports')}
            <NavLink to="/hr/reports" style={() => linkStyle('/hr/reports')}>
              <BarChart3 size={18} /> Reports & Export
            </NavLink>
            {sectionTitle('Support')}
            <NavLink to="/chat" style={() => linkStyle('/chat')}>
              <MessageSquare size={18} /> AI Assistant
            </NavLink>
          </>
        )}

        {/* IT Admin Navigation */}
        {role === 'it_admin' && (
          <>
            {sectionTitle('Main')}
            <NavLink to="/it/assets" style={() => linkStyle('/it/assets')}>
              <Monitor size={18} /> Asset Management
            </NavLink>
            {sectionTitle('Support')}
            <NavLink to="/chat" style={() => linkStyle('/chat')}>
              <MessageSquare size={18} /> AI Assistant
            </NavLink>
          </>
        )}

        {/* Buddy Navigation */}
        {role === 'buddy' && (
          <>
            {sectionTitle('Main')}
            <NavLink to="/buddy/dashboard" style={() => linkStyle('/buddy/dashboard')}>
              <LayoutDashboard size={18} /> My Mentees
            </NavLink>
            {sectionTitle('Support')}
            <NavLink to="/chat" style={() => linkStyle('/chat')}>
              <MessageSquare size={18} /> AI Assistant
            </NavLink>
          </>
        )}
      </nav>

      {/* User Card at Bottom */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: '600',
          color: 'white',
          flexShrink: 0
        }}>
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.name || 'User'}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
            {user?.role?.replace('_', ' ') || 'Employee'}
          </div>
        </div>
        <button 
          onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }}
          title="Logout"
          style={{
            background: 'transparent', border: 'none', color: 'var(--color-text-muted)', 
            cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
