import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, checkAdminStatus } from '../services/supabase';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const navigate = useNavigate();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Sign in
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Login failed');
      }

      // Verify admin permissions
      const { isAdmin, adminData } = await checkAdminStatus();

      if (!isAdmin) {
        // Not an admin - sign out
        await supabase.auth.signOut();
        setError('⛔ You do not have admin permissions to access this page');
        setLoading(false);
        return;
      }

      // Update last login
      await supabase
        .from('admins')
        .update({ last_login: new Date().toISOString() })
        .eq('user_id', authData.user.id);

      // Login successful - navigate to dashboard
      console.log('✅ Admin logged in:', adminData?.role);
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message === 'Invalid login credentials'
        ? 'Email or password is incorrect'
        : err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setResetMessage('');
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setResetMessage('✅ Password reset link has been sent to your email');
      setResetEmail('');
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetMessage('');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'An error occurred while sending the email');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'var(--card)',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        padding: '40px',
        maxWidth: '450px',
        width: '100%'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            fontSize: '60px',
            marginBottom: '10px'
          }}>
            🔐
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            marginBottom: '8px',
            color: 'var(--text)'
          }}>
            {showForgotPassword ? 'Password Recovery' : 'Admin Login'}
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '15px'
          }}>
            {showForgotPassword
              ? 'Enter your email to recover your password'
              : 'Admin Dashboard'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#fee',
            border: '1px solid #fcc',
            color: '#c33',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* Reset Success Message */}
        {resetMessage && (
          <div style={{
            background: '#efe',
            border: '1px solid #cfc',
            color: '#3c3',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {resetMessage}
          </div>
        )}

        {/* Login Form */}
        {!showForgotPassword ? (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: 'var(--text)',
                fontSize: '14px'
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@example.com"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid var(--border)',
                  borderRadius: '10px',
                  fontSize: '15px',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: 'var(--text)',
                fontSize: '14px'
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid var(--border)',
                  borderRadius: '10px',
                  fontSize: '15px',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent)',
                fontSize: '13px',
                cursor: 'pointer',
                marginBottom: '20px',
                padding: 0
              }}
            >
              Forgot password?
            </button>

            <button
              type="submit"
              disabled={loading || !email || !password}
              style={{
                width: '100%',
                padding: '14px',
                background: loading ? '#ccc' : 'var(--accent)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 5px 15px rgba(139, 92, 246, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {loading ? (
                <>
                  <LoadingSpinner />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>🔓</span>
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        ) : (
          // Forgot Password Form
          <form onSubmit={handleForgotPassword}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: 'var(--text)',
                fontSize: '14px'
              }}>
                Email
              </label>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                placeholder="admin@example.com"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid var(--border)',
                  borderRadius: '10px',
                  fontSize: '15px',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setError('');
                  setResetMessage('');
                }}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: 'var(--card)',
                  border: '2px solid var(--border)',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  color: 'var(--text)',
                  transition: 'all 0.2s'
                }}
              >
                Back
              </button>

              <button
                type="submit"
                disabled={loading || !resetEmail}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: loading ? '#ccc' : 'var(--accent)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {loading ? (
                  <>
                    <LoadingSpinner />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>📧</span>
                    <span>Send</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div style={{
          marginTop: '30px',
          paddingTop: '20px',
          borderTop: '1px solid var(--border)',
          textAlign: 'center'
        }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              margin: '0 auto'
            }}
          >
            <span>←</span>
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
}
