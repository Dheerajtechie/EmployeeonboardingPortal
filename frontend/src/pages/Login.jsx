import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Step 1: Get token from backend
      const res = await api.post('/auth/login', { email, password });
      const token = res.data.access_token;

      // Step 2: Store token and fetch user profile
      const userData = await login(token);

      // Step 3: Navigate based on role
      const role = userData?.role;
      if (role === 'hr_admin') navigate('/hr/dashboard');
      else if (role === 'it_admin') navigate('/it/assets');
      else if (role === 'buddy') navigate('/buddy/dashboard');
      else if (role === 'new_hire') navigate('/new-hire/dashboard');
      else navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--color-bg)'
    }}>
      {/* Left Panel - Brand */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '64px',
        background: 'linear-gradient(135deg, rgba(79,110,247,0.08) 0%, rgba(124,58,237,0.08) 100%)',
        borderRight: '1px solid var(--color-border)'
      }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '12px',
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: '700', fontSize: '20px', color: 'white', marginBottom: '32px'
        }}>W</div>
        <h1 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px', fontFamily: 'var(--font-heading)' }}>
          AI-Powered<br />Employee Onboarding
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', lineHeight: '1.8', maxWidth: '460px' }}>
          Welcome to Wipro's intelligent onboarding platform. Complete your joining process,
          track progress, and get AI-powered assistance — all in one place.
        </p>
        <div style={{ display: 'flex', gap: '32px', marginTop: '48px' }}>
          <div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--color-primary)' }}>500+</div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Employees Onboarded</div>
          </div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--color-success)' }}>98%</div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Completion Rate</div>
          </div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--color-secondary)' }}>24/7</div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>AI Support</div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div style={{
        width: '480px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '64px'
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Welcome back</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px' }}>
          Enter your credentials to access the portal
        </p>

        {error && (
          <div style={{
            padding: '12px 16px',
            background: 'var(--color-danger-bg)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '8px',
            color: 'var(--color-danger)',
            fontSize: '13px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                color: 'var(--color-text)',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  paddingRight: '44px',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  color: 'var(--color-text)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '13px'
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: loading ? 'var(--color-primary-hover)' : 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '500',
              cursor: loading ? 'wait' : 'pointer',
              marginTop: '8px'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
          Default HR admin: <strong style={{ color: 'var(--color-text-secondary)' }}>hr_admin@company.com / admin123</strong>
        </p>
      </div>
    </div>
  );
};

export default Login;
