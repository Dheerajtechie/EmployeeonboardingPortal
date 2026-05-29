import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Search, Bell, HelpCircle } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 'var(--sidebar-width)',
      right: 0,
      height: 'var(--navbar-height)',
      background: 'var(--color-navbar)',
      borderBottom: '1px solid var(--color-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      zIndex: 100,
      backdropFilter: 'blur(12px)'
    }}>
      {/* Search */}
      <div style={{ position: 'relative', width: '320px' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
        <input
          type="text"
          placeholder="Search anything..."
          style={{
            width: '100%',
            padding: '8px 12px 8px 36px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            color: 'var(--color-text)',
            fontSize: '13px',
            outline: 'none'
          }}
        />
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Notifications */}
        <button style={{
          position: 'relative',
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-secondary)',
          cursor: 'pointer'
        }}>
          <Bell size={18} />
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: 'var(--color-danger)',
            fontSize: '10px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>3</span>
        </button>

        {/* Help */}
        <button style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-secondary)',
          cursor: 'pointer'
        }}>
          <HelpCircle size={18} />
        </button>

        {/* Divider */}
        <div style={{ width: '1px', height: '32px', background: 'var(--color-border)' }} />

        {/* User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
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
            color: 'white'
          }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '500' }}>{user?.name || 'User'}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
              {user?.role?.replace('_', ' ') || 'Employee'}
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            background: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--color-danger)',
            fontSize: '13px',
            fontWeight: '500',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
