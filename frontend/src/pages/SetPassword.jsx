import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Lock, KeyRound, CheckCircle, Loader2 } from 'lucide-react';

const SetPassword = () => {
  const { user } = useContext(AuthContext);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/set-password', {
        user_id: user?.user_id,
        new_password: newPassword
      });
      alert('Password set successfully! Please log in with your new password.');
      navigate('/login');
    } catch (err) {
      setError('Failed to set password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--color-bg)'
    }}>
      <div className="card animate-slide-up" style={{ width: '420px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'var(--color-primary-light)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <KeyRound size={28} color="var(--color-primary)" />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '700' }}>Set Your Password</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Create a secure password for your account
          </p>
        </div>

        {error && (
          <div style={{
            padding: '12px', background: 'var(--color-danger-bg)',
            border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px',
            color: 'var(--color-danger)', fontSize: '13px', marginBottom: '16px'
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                className="form-input" placeholder="Enter new password" style={{ paddingLeft: '40px' }} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input" placeholder="Confirm password" style={{ paddingLeft: '40px' }} required />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '15px', marginTop: '8px' }}>
            {loading ? <><Loader2 size={18} className="animate-spin" /> Setting...</> : <><CheckCircle size={18} /> Set Password</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetPassword;
