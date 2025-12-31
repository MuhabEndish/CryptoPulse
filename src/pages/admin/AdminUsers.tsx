import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  checkAdminStatus,
  getAllUsers,
  banUser,
  unbanUser,
  deleteUser,
  supabase
} from '../../services/supabase';
import LoadingSpinner from '../../components/LoadingSpinner';
import AdminHeader from '../../components/AdminHeader';
import { useToast } from '../../components/ToastProvider';
import ConfirmModal from '../../components/ConfirmModal';
import InputModal from '../../components/InputModal';
import {
  AiOutlineArrowLeft,
  AiOutlineTeam,
  AiOutlineSearch,
  AiOutlineCheck,
  AiOutlineClose,
  AiOutlineDelete,
  AiOutlineLogout,
  AiOutlineStop
} from 'react-icons/ai';

interface User {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  banned?: Array<{
    id: string;
    reason: string;
    ban_type: 'temporary' | 'permanent';
    banned_until?: string;
    created_at: string;
  }>;
  posts?: Array<{ count: number }>;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'banned' | 'active'>('all');
  const [adminData, setAdminData] = useState<any>(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Modal states
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const [inputModal, setInputModal] = useState<{
    isOpen: boolean;
    title: string;
    message?: string;
    placeholder?: string;
    defaultValue?: string;
    onConfirm: (value: string) => void;
    required?: boolean;
  }>({ isOpen: false, title: '', onConfirm: () => {} });

  useEffect(() => {
    async function init() {
      const { isAdmin, adminData: admin } = await checkAdminStatus();
      if (!isAdmin) {
        navigate('/admin/login');
        return;
      }
      setAdminData(admin);
      await loadUsers();
    }
    init();
  }, [navigate]);

  async function loadUsers() {
    setLoading(true);
    const result = await getAllUsers(100);
    if (result.success) {
      setUsers(result.data || []);
    }
    setLoading(false);
  }

  async function handleBanUser(userId: string, username: string) {
    setInputModal({
      isOpen: true,
      title: `Ban ${username}`,
      message: 'Enter reason for banning this user:',
      placeholder: 'Reason for ban...',
      required: true,
      onConfirm: async (reason) => {
        // Store data for ban type selection
        (window as any).__banUserId = userId;
        (window as any).__banReason = reason;

        setConfirmModal({
          isOpen: true,
          title: 'Select Ban Type',
          message: 'Choose Permanent Ban or Cancel to select temporary ban with custom duration.',
          type: 'danger',
          onConfirm: async () => {
            // Permanent ban
            const result = await banUser(userId, reason, 'permanent', undefined);

            if (result.success) {
              showToast('User permanently banned successfully', 'success');
              loadUsers();
            } else {
              showToast(result.error || 'An error occurred during the ban', 'error');
            }

            // Clean up
            delete (window as any).__banUserId;
            delete (window as any).__banReason;
          }
        });
      }
    });
  }

  // Helper function for temporary ban
  const handleTemporaryBan = () => {
    const userId = (window as any).__banUserId;
    const reason = (window as any).__banReason;

    if (!userId || !reason) return;

    setInputModal({
      isOpen: true,
      title: 'Temporary Ban Duration',
      message: 'Enter number of days for the ban:',
      placeholder: 'Enter days...',
      defaultValue: '7',
      required: true,
      onConfirm: async (days) => {
        const daysNum = parseInt(days);
        if (isNaN(daysNum) || daysNum <= 0) {
          showToast('Please enter a valid number of days', 'error');
          return;
        }

        const date = new Date();
        date.setDate(date.getDate() + daysNum);
        const bannedUntil = date.toISOString();

        const result = await banUser(userId, reason, 'temporary', bannedUntil);

        if (result.success) {
          showToast(`User temporarily banned for ${days} days`, 'success');
          loadUsers();
        } else {
          showToast(result.error || 'An error occurred during the ban', 'error');
        }

        // Clean up
        delete (window as any).__banUserId;
        delete (window as any).__banReason;
      }
    });
  };

  async function handleUnbanUser(userId: string, username: string) {
    setConfirmModal({
      isOpen: true,
      title: 'Unban User',
      message: `Are you sure you want to unban ${username}?`,
      type: 'info',
      onConfirm: async () => {
        const result = await unbanUser(userId);
        if (result.success) {
          showToast('User unbanned successfully', 'success');
          loadUsers();
        } else {
          showToast('An error occurred while unbanning user', 'error');
        }
      }
    });
  }

  async function handleDeleteUser(userId: string, username: string) {
    if (!adminData?.permissions?.delete_users) {
      showToast('You do not have permission to delete users (Super Admin only)', 'error');
      return;
    }

    setInputModal({
      isOpen: true,
      title: '⚠️ Delete User Permanently',
      message: `WARNING: This will permanently delete:\n• User account\n• All their posts\n• All their comments\n• All their likes\n\nTo confirm deletion, type the username: ${username}`,
      placeholder: `Type "${username}" to confirm`,
      required: true,
      onConfirm: async (confirmation) => {
        if (confirmation !== username) {
          showToast('Username does not match. Operation cancelled', 'error');
          return;
        }

        const result = await deleteUser(userId);
        if (result.success) {
          showToast('User deleted permanently', 'success');
          loadUsers();
        } else {
          showToast('An error occurred during deletion', 'error');
        }
      }
    });
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const isBanned = user.banned && user.banned.length > 0;

    if (filterType === 'banned') return matchesSearch && isBanned;
    if (filterType === 'active') return matchesSearch && !isBanned;
    return matchesSearch;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <header style={{
        background: 'var(--card)',
        borderBottom: '1px solid var(--border)',
        padding: '20px 40px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button
              onClick={() => navigate('/admin/dashboard')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer'
              }}
            >
              <AiOutlineArrowLeft />
            </button>
            <AiOutlineTeam style={{ fontSize: '32px' }} />
            <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>
              User Management
            </h1>
          </div>
          <button
            onClick={() => supabase.auth.signOut().then(() => navigate('/admin/login'))}
            style={{
              padding: '10px 20px',
              background: '#fee',
              border: '2px solid #fcc',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              color: '#c33'
            }}
          >
            <AiOutlineLogout style={{ display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' }} /> Logout
          </button>
        </div>
      </header>

      <main style={{ padding: '40px', maxWidth: '1600px', margin: '0 auto' }}>
        {/* Search & Filters */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{
            display: 'flex',
            gap: '15px',
            marginBottom: '20px',
            flexWrap: 'wrap'
          }}>
            <input
              type="text"
              placeholder="Search user (name or email)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                minWidth: '300px',
                padding: '12px 20px',
                border: '2px solid var(--border)',
                borderRadius: '10px',
                fontSize: '15px',
                background: 'var(--card)',
                color: 'var(--text)'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {['all', 'active', 'banned'].map(f => (
              <button
                key={f}
                onClick={() => setFilterType(f as any)}
                style={{
                  padding: '10px 20px',
                  background: filterType === f ? 'var(--accent)' : 'var(--card)',
                  color: filterType === f ? 'white' : 'var(--text)',
                  border: filterType === f ? 'none' : '2px solid var(--border)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
              >
                {f === 'all' ? 'All' : f === 'active' ? 'Active' : 'Banned'}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          marginBottom: '30px'
        }}>
          <div style={{
            background: 'var(--card)',
            padding: '20px',
            borderRadius: '12px',
            border: '2px solid var(--border)'
          }}>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Total Users
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--accent)' }}>
              {users.length}
            </div>
          </div>
          <div style={{
            background: 'var(--card)',
            padding: '20px',
            borderRadius: '12px',
            border: '2px solid var(--border)'
          }}>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Banned Users
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#ef4444' }}>
              {users.filter(u => u.banned && u.banned.length > 0).length}
            </div>
          </div>
          <div style={{
            background: 'var(--card)',
            padding: '20px',
            borderRadius: '12px',
            border: '2px solid var(--border)'
          }}>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Active Users
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981' }}>
              {users.filter(u => !u.banned || u.banned.length === 0).length}
            </div>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <LoadingSpinner />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px',
            background: 'var(--card)',
            borderRadius: '12px'
          }}>
            <AiOutlineSearch style={{ fontSize: '64px', marginBottom: '20px' }} />
            <h3 style={{ fontSize: '20px', color: 'var(--text)' }}>
              No users found
            </h3>
          </div>
        ) : (
          <div style={{
            background: 'var(--card)',
            borderRadius: '12px',
            border: '2px solid var(--border)',
            overflow: 'hidden'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px'
              }}>
                <thead>
                  <tr style={{
                    background: 'var(--bg)',
                    borderBottom: '2px solid var(--border)'
                  }}>
                    <th style={{ padding: '16px', textAlign: 'right', fontWeight: '700' }}>
                      User
                    </th>
                    <th style={{ padding: '16px', textAlign: 'right', fontWeight: '700' }}>
                      Email
                    </th>
                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700' }}>
                      Posts
                    </th>
                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700' }}>
                      Registration Date
                    </th>
                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700' }}>
                      Status
                    </th>
                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => {
                    const isBanned = user.banned && user.banned.length > 0;
                    const banInfo = isBanned ? user.banned[0] : null;

                    return (
                      <tr
                        key={user.id}
                        style={{
                          borderBottom: index < filteredUsers.length - 1 ? '1px solid var(--border)' : 'none',
                          background: isBanned ? '#fef2f2' : 'transparent'
                        }}
                      >
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {user.avatar_url ? (
                              <img
                                src={user.avatar_url}
                                alt=""
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '50%',
                                  objectFit: 'cover'
                                }}
                              />
                            ) : (
                              <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'var(--accent)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '18px',
                                color: 'white',
                                fontWeight: '700'
                              }}>
                                {user.username[0].toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div style={{ fontWeight: '600', marginBottom: '2px' }}>
                                {user.username}
                              </div>
                              {user.bio && (
                                <div style={{
                                  fontSize: '12px',
                                  color: 'var(--text-secondary)',
                                  maxWidth: '200px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {user.bio}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                          {user.email || '-'}
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center', fontWeight: '600' }}>
                          {user.posts?.[0]?.count || 0}
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                          {new Date(user.created_at).toLocaleDateString('en-US')}
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          {isBanned ? (
                            <div>
                              <span style={{
                                background: '#fee2e2',
                                color: '#991b1b',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: '600',
                                display: 'inline-block',
                                marginBottom: '4px'
                              }}>
                                <AiOutlineClose style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }} /> Banned {banInfo?.ban_type === 'permanent' ? 'Permanently' : 'Temporarily'}
                              </span>
                              {banInfo && (
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                  {banInfo.reason}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span style={{
                              background: '#d1fae5',
                              color: '#065f46',
                              padding: '4px 12px',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}>
                              <AiOutlineCheck style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }} /> Active
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{
                            display: 'flex',
                            gap: '8px',
                            justifyContent: 'center',
                            flexWrap: 'wrap'
                          }}>
                            {isBanned ? (
                              <button
                                onClick={() => handleUnbanUser(user.id, user.username)}
                                style={{
                                  padding: '8px 16px',
                                  background: '#10b981',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                <AiOutlineCheck style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }} /> Unban
                              </button>
                            ) : (
                              <button
                                onClick={() => handleBanUser(user.id, user.username)}
                                style={{
                                  padding: '8px 16px',
                                  background: '#f59e0b',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                <AiOutlineStop style={{ display: 'inline-block', marginRight: '6px' }} /> Ban
                              </button>
                            )}

                            {adminData?.role === 'super_admin' && (
                              <button
                                onClick={() => handleDeleteUser(user.id, user.username)}
                                style={{
                                  padding: '8px 16px',
                                  background: '#ef4444',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                <AiOutlineDelete style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }} /> Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => {
          setConfirmModal({ ...confirmModal, isOpen: false });
          // Check if this is the ban type modal and offer temporary ban option
          if (confirmModal.title === 'Select Ban Type') {
            handleTemporaryBan();
          }
        }}
        onConfirm={() => {
          confirmModal.onConfirm();
          setConfirmModal({ ...confirmModal, isOpen: false });
        }}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />

      <InputModal
        isOpen={inputModal.isOpen}
        onClose={() => setInputModal({ ...inputModal, isOpen: false })}
        onConfirm={(value) => {
          inputModal.onConfirm(value);
          setInputModal({ ...inputModal, isOpen: false });
        }}
        title={inputModal.title}
        message={inputModal.message}
        placeholder={inputModal.placeholder}
        defaultValue={inputModal.defaultValue}
        required={inputModal.required}
      />
    </div>
  );
}
