import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Search, Bell, HelpCircle, Check, Clock } from 'lucide-react';
import api from '../services/api';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch notifications");
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.notif_id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

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
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
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
            {unreadCount > 0 && (
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
              }}>{unreadCount}</span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div style={{
              position: 'absolute',
              top: '48px',
              right: 0,
              width: '320px',
              background: 'rgba(26, 29, 39, 0.95)',
              backdropFilter: 'blur(16px)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden',
              zIndex: 1000
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600' }}>Notifications</h3>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{unreadCount} unread</span>
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                    No new notifications
                  </div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.notif_id}
                      onClick={() => markAsRead(n.notif_id)}
                      style={{ 
                        padding: '12px 16px', 
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        background: n.is_read ? 'transparent' : 'rgba(79, 110, 247, 0.05)',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{ color: n.type === 'SLA_BREACH' ? 'var(--color-danger)' : 'var(--color-primary)', marginTop: '2px' }}>
                          {n.type === 'SLA_BREACH' ? <Clock size={16} /> : <Bell size={16} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', color: n.is_read ? 'var(--color-text-secondary)' : 'var(--color-text)', fontWeight: n.is_read ? '400' : '500' }}>
                            {n.message}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                            {new Date(n.created_at).toLocaleString()}
                          </div>
                        </div>
                        {!n.is_read && (
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)', marginTop: '6px' }} />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

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
