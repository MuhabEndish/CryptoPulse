import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import {
  AiOutlineUser,
  AiOutlineSun,
  AiOutlineMoon,
  AiOutlineDashboard,
  AiOutlineHome,
  AiOutlineLogout
} from 'react-icons/ai';

interface AdminHeaderProps {
  title: string;
  adminRole?: string;
}

export default function AdminHeader({ title, adminRole }: AdminHeaderProps) {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : true;
  });

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/admin/login');
  }

  return (
    <header style={{
      background: 'var(--card)',
      borderBottom: '1px solid var(--border)',
      padding: '20px 40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '10px' }}>
          <img
            src="/images/CryptoPulseLogo.png"
            alt="CryptoPulse Logo"
            style={{ height: '32px', width: 'auto' }}
          />
          <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text)' }}>
            CryptoPulse
          </span>
        </div>
        <AiOutlineUser style={{ fontSize: '32px', color: 'var(--accent)' }} />
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>
            {title}
          </h1>
          {adminRole && (
            <p style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              margin: '4px 0 0 0'
            }}>
              Role: <span style={{
                color: 'var(--accent)',
                fontWeight: '600'
              }}>
                {adminRole === 'super_admin' ? 'Super Admin' :
                 adminRole === 'admin' ? 'Admin' : 'Moderator'}
              </span>
            </p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            padding: '10px 20px',
            background: 'var(--bg)',
            border: '2px solid var(--border)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '20px',
            transition: 'all 0.2s'
          }}
          title={darkMode ? "Light Mode" : "Dark Mode"}
        >
          {darkMode ? <AiOutlineSun style={{ fontSize: '20px' }} /> : <AiOutlineMoon style={{ fontSize: '20px' }} />}
        </button>
        <button
          onClick={() => navigate('/admin/dashboard')}
          style={{
            padding: '10px 20px',
            background: 'var(--bg)',
            border: '2px solid var(--border)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--text)',
            transition: 'all 0.2s'
          }}
        >
          <AiOutlineDashboard style={{ display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' }} /> Dashboard
        </button>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '10px 20px',
            background: 'var(--bg)',
            border: '2px solid var(--border)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--text)',
            transition: 'all 0.2s'
          }}
        >
          <AiOutlineHome style={{ display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' }} /> Home
        </button>
        <button
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            background: '#fee',
            border: '2px solid #fcc',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            color: '#c33',
            transition: 'all 0.2s'
          }}
        >
          <AiOutlineLogout style={{ display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' }} /> Logout
        </button>
      </div>
    </header>
  );
}
