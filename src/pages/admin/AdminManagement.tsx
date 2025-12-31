import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  checkAdminStatus,
  getAllAdmins,
  addAdmin,
  updateAdminPermissions,
  deleteAdmin
} from '../../services/supabase';
import LoadingSpinner from '../../components/LoadingSpinner';
import AdminHeader from '../../components/AdminHeader';
import { useToast } from '../../components/ToastProvider';
import ConfirmModal from '../../components/ConfirmModal';
import {
  AiOutlinePlus,
  AiOutlineDelete,
  AiOutlineBulb,
  AiOutlineArrowLeft,
  AiOutlineTeam,
  AiOutlineLogout
} from 'react-icons/ai';

interface Admin {
  id: string;
  user_id: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: {
    view_reports: boolean;
    manage_reports: boolean;
    delete_posts: boolean;
    delete_comments: boolean;
    ban_users: boolean;
    delete_users: boolean;
    manage_admins: boolean;
  };
  created_at: string;
  profile: {
    username: string;
    email: string;
  };
}

const DEFAULT_PERMISSIONS = {
  super_admin: {
    view_reports: true,
    manage_reports: true,
    delete_posts: true,
    delete_comments: true,
    ban_users: true,
    delete_users: true,
    manage_admins: true
  },
  admin: {
    view_reports: true,
    manage_reports: true,
    delete_posts: true,
    delete_comments: true,
    ban_users: true,
    delete_users: false,
    manage_admins: false
  },
  moderator: {
    view_reports: true,
    manage_reports: true,
    delete_posts: true,
    delete_comments: true,
    ban_users: false,
    delete_users: false,
    manage_admins: false
  }
};

export default function AdminManagement() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  // Form states
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'moderator'>('moderator');
  const [customPermissions, setCustomPermissions] = useState(DEFAULT_PERMISSIONS.moderator);

  useEffect(() => {
    async function init() {
      const { isAdmin, adminData } = await checkAdminStatus();
      if (!isAdmin || adminData?.role !== 'super_admin') {
        showToast('This page is only available to Super Admins', 'error');
        navigate('/admin/dashboard');
        return;
      }
      setIsSuperAdmin(true);
      await loadAdmins();
    }
    init();
  }, [navigate]);

  async function loadAdmins() {
    setLoading(true);
    const result = await getAllAdmins();
    if (result.success) {
      setAdmins(result.data || []);
    }
    setLoading(false);
  }

  async function handleAddAdmin() {
    if (!newAdminEmail.trim()) {
      showToast('Please enter the email address', 'error');
      return;
    }

    const permissions = selectedRole === 'admin'
      ? DEFAULT_PERMISSIONS.admin
      : customPermissions;

    const result = await addAdmin(newAdminEmail, selectedRole, permissions);

    if (result.success) {
      showToast('Admin added successfully', 'success');
      setShowAddModal(false);
      setNewAdminEmail('');
      setSelectedRole('moderator');
      setCustomPermissions(DEFAULT_PERMISSIONS.moderator);
      loadAdmins();
    } else {
      showToast(result.error || 'Failed to add admin', 'error');
    }
  }

  async function handleUpdateAdmin(admin: Admin) {
    const result = await updateAdminPermissions(
      admin.user_id,
      admin.role,
      admin.permissions
    );

    if (result.success) {
      showToast('Permissions updated successfully', 'success');
      setSelectedAdmin(null);
      loadAdmins();
    } else {
      showToast(result.error || 'Failed to update permissions', 'error');
    }
  }

  async function handleDeleteAdmin(adminUserId: string, username: string) {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Admin',
      message: `Are you sure you want to delete admin "${username}"? This action cannot be undone.`,
      type: 'danger',
      onConfirm: async () => {
        const result = await deleteAdmin(adminUserId);

        if (result.success) {
          showToast('Admin deleted successfully', 'success');
          loadAdmins();
        } else {
          showToast(result.error || 'Failed to delete admin', 'error');
        }
      }
    });
  }

  function getRoleBadgeColor(role: string) {
    switch(role) {
      case 'super_admin': return '#10b981';
      case 'admin': return '#3b82f6';
      case 'moderator': return '#f59e0b';
      default: return '#6b7280';
    }
  }

  function getRoleText(role: string) {
    switch(role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Admin';
      case 'moderator': return 'Moderator';
      default: return role;
    }
  }

  if (!isSuperAdmin) {
    return null;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'var(--card)',
          borderBottom: '1px solid var(--border)',
          padding: '15px 30px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button
              onClick={() => navigate('/admin/dashboard')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text)',
                fontSize: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '5px'
              }}
              title="Back to Dashboard"
            >
              <AiOutlineArrowLeft />
            </button>
            <AiOutlineTeam style={{ fontSize: '32px', color: 'var(--accent)' }} />
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>Admin Management</h1>
          </div>
          <button
            onClick={() => {
              supabase.auth.signOut().then(() => navigate('/admin/login'));
            }}
            style={{
              padding: '10px 20px',
              background: 'var(--danger)',
              borderRadius: '8px',
              color: 'white',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <AiOutlineLogout /> Logout
          </button>
        </div>
      </header>

      <main style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <p style={{ opacity: 0.7, margin: 0 }}>Add, edit, and delete admins and moderators</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              padding: '12px 24px',
              background: 'var(--accent)',
              borderRadius: '10px',
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer',
              border: 'none'
            }}
          >
            <AiOutlinePlus style={{ display: 'inline-block', marginRight: '6px' }} /> Add New Admin
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ background: 'var(--card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '14px', opacity: 0.7, marginBottom: '8px' }}>Total Admins</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--accent)' }}>
              {admins.length}
            </div>
          </div>
          <div style={{ background: 'var(--card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '14px', opacity: 0.7, marginBottom: '8px' }}>Super Admins</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>
              {admins.filter(a => a.role === 'super_admin').length}
            </div>
          </div>
          <div style={{ background: 'var(--card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '14px', opacity: 0.7, marginBottom: '8px' }}>Admins</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' }}>
              {admins.filter(a => a.role === 'admin').length}
            </div>
          </div>
          <div style={{ background: 'var(--card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '14px', opacity: 0.7, marginBottom: '8px' }}>Moderators</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>
              {admins.filter(a => a.role === 'moderator').length}
            </div>
          </div>
        </div>

        {/* Admins Table */}
        <div style={{ background: 'var(--card)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(139, 92, 246, 0.1)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '16px', textAlign: 'right' }}>Admin</th>
                <th style={{ padding: '16px', textAlign: 'right' }}>Role</th>
                <th style={{ padding: '16px', textAlign: 'right' }}>Permissions</th>
                <th style={{ padding: '16px', textAlign: 'right' }}>Date Added</th>
                <th style={{ padding: '16px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map(admin => (
                <tr key={admin.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 'bold' }}>{admin.profile.username}</div>
                    <div style={{ fontSize: '14px', opacity: 0.6 }}>{admin.profile.email}</div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      background: getRoleBadgeColor(admin.role) + '20',
                      color: getRoleBadgeColor(admin.role),
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}>
                      {getRoleText(admin.role)}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontSize: '14px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {admin.permissions.view_reports && <span style={{ background: '#374151', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>View Reports</span>}
                      {admin.permissions.manage_reports && <span style={{ background: '#374151', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>Manage Reports</span>}
                      {admin.permissions.delete_posts && <span style={{ background: '#374151', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>Delete Posts</span>}
                      {admin.permissions.ban_users && <span style={{ background: '#374151', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>Ban Users</span>}
                      {admin.permissions.delete_users && <span style={{ background: '#374151', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>Delete Users</span>}
                      {admin.permissions.manage_admins && <span style={{ background: '#374151', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>Manage Admins</span>}
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', opacity: 0.7 }}>
                    {new Date(admin.created_at).toLocaleDateString('en-US')}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    {admin.role !== 'super_admin' && (
                      <button
                        onClick={() => handleDeleteAdmin(admin.user_id, admin.profile.username)}
                        style={{
                          padding: '8px 16px',
                          background: '#ef4444',
                          borderRadius: '6px',
                          color: 'white',
                          cursor: 'pointer',
                          border: 'none',
                          fontSize: '14px'
                        }}
                      >
                        <AiOutlineDelete style={{ display: 'inline-block', marginRight: '6px' }} /> Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--card)',
            padding: '30px',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ marginBottom: '20px' }}><AiOutlinePlus style={{ display: 'inline-block', marginRight: '6px' }} /> Add New Admin</h2>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Email Address
              </label>
              <input
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="example@email.com"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
              <div style={{ fontSize: '12px', opacity: 0.6, marginTop: '6px' }}>
                <AiOutlineBulb style={{ display: 'inline-block', marginRight: '4px' }} /> Enter the email address of the user you want to add as admin
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => {
                  const role = e.target.value as 'admin' | 'moderator';
                  setSelectedRole(role);
                  setCustomPermissions(DEFAULT_PERMISSIONS[role]);
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'white'
                }}
              >
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '12px', fontWeight: 'bold' }}>
                Permissions
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.entries(customPermissions).map(([key, value]) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setCustomPermissions({
                        ...customPermissions,
                        [key]: e.target.checked
                      })}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <span>{key.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  padding: '12px 24px',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddAdmin}
                style={{
                  padding: '12px 24px',
                  background: 'var(--accent)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={() => {
          confirmModal.onConfirm();
          setConfirmModal({ ...confirmModal, isOpen: false });
        }}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />
    </div>
  );
}
