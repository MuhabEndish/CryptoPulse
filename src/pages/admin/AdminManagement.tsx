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

  // Form states
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'moderator'>('moderator');
  const [customPermissions, setCustomPermissions] = useState(DEFAULT_PERMISSIONS.moderator);

  useEffect(() => {
    async function init() {
      const { isAdmin, adminData } = await checkAdminStatus();
      if (!isAdmin || adminData?.role !== 'super_admin') {
        alert('❌ هذه الصفحة متاحة فقط للمدير العام');
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
    if (!newAdminUsername.trim()) {
      alert('❌ الرجاء إدخال اسم المستخدم (username)');
      return;
    }

    const permissions = selectedRole === 'admin'
      ? DEFAULT_PERMISSIONS.admin
      : customPermissions;

    const result = await addAdmin(newAdminUsername, selectedRole, permissions);

    if (result.success) {
      alert('✅ تم إضافة المدير بنجاح');
      setShowAddModal(false);
      setNewAdminUsername('');
      setSelectedRole('moderator');
      setCustomPermissions(DEFAULT_PERMISSIONS.moderator);
      loadAdmins();
    } else {
      alert(`❌ ${result.error}`);
    }
  }

  async function handleUpdateAdmin(admin: Admin) {
    const result = await updateAdminPermissions(
      admin.user_id,
      admin.role,
      admin.permissions
    );

    if (result.success) {
      alert('✅ تم تحديث الصلاحيات بنجاح');
      setSelectedAdmin(null);
      loadAdmins();
    } else {
      alert(`❌ ${result.error}`);
    }
  }

  async function handleDeleteAdmin(adminUserId: string, username: string) {
    if (!confirm(`هل تريد حذف المدير "${username}"؟`)) return;

    const result = await deleteAdmin(adminUserId);

    if (result.success) {
      alert('✅ تم حذف المدير بنجاح');
      loadAdmins();
    } else {
      alert(`❌ ${result.error}`);
    }
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
      case 'super_admin': return 'مدير عام';
      case 'admin': return 'مدير';
      case 'moderator': return 'مشرف';
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
      {/* Header */}
      <header style={{
        background: 'var(--card)',
        borderBottom: '1px solid var(--border)',
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <button
            onClick={() => navigate('/admin/dashboard')}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              marginBottom: '10px'
            }}
          >
            ← العودة للوحة التحكم
          </button>
          <h1 style={{ fontSize: '28px', marginBottom: '5px' }}>👨‍💼 إدارة المديرين</h1>
          <p style={{ opacity: 0.7 }}>إضافة وتعديل وحذف المديرين والمشرفين</p>
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
          ➕ إضافة مدير جديد
        </button>
      </header>

      {/* Stats */}
      <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ background: 'var(--card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '14px', opacity: 0.7, marginBottom: '8px' }}>إجمالي المديرين</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--accent)' }}>
              {admins.length}
            </div>
          </div>
          <div style={{ background: 'var(--card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '14px', opacity: 0.7, marginBottom: '8px' }}>مديرون عامون</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>
              {admins.filter(a => a.role === 'super_admin').length}
            </div>
          </div>
          <div style={{ background: 'var(--card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '14px', opacity: 0.7, marginBottom: '8px' }}>مديرون</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' }}>
              {admins.filter(a => a.role === 'admin').length}
            </div>
          </div>
          <div style={{ background: 'var(--card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '14px', opacity: 0.7, marginBottom: '8px' }}>مشرفون</div>
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
                <th style={{ padding: '16px', textAlign: 'right' }}>المدير</th>
                <th style={{ padding: '16px', textAlign: 'right' }}>الدور</th>
                <th style={{ padding: '16px', textAlign: 'right' }}>الصلاحيات</th>
                <th style={{ padding: '16px', textAlign: 'right' }}>تاريخ الإضافة</th>
                <th style={{ padding: '16px', textAlign: 'center' }}>الإجراءات</th>
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
                      {admin.permissions.view_reports && <span style={{ background: '#374151', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>عرض البلاغات</span>}
                      {admin.permissions.manage_reports && <span style={{ background: '#374151', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>إدارة البلاغات</span>}
                      {admin.permissions.delete_posts && <span style={{ background: '#374151', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>حذف المنشورات</span>}
                      {admin.permissions.ban_users && <span style={{ background: '#374151', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>حظر المستخدمين</span>}
                      {admin.permissions.delete_users && <span style={{ background: '#374151', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>حذف المستخدمين</span>}
                      {admin.permissions.manage_admins && <span style={{ background: '#374151', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>إدارة المديرين</span>}
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', opacity: 0.7 }}>
                    {new Date(admin.created_at).toLocaleDateString('ar-SA')}
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
                        🗑️ حذف
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
            <h2 style={{ marginBottom: '20px' }}>➕ إضافة مدير جديد</h2>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                اسم المستخدم (Username)
              </label>
              <input
                type="text"
                value={newAdminUsername}
                onChange={(e) => setNewAdminUsername(e.target.value)}
                placeholder="اكتب اسم المستخدم هنا"
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
                💡 اكتب اسم المستخدم (username) وليس البريد الإلكتروني
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                الدور
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
                <option value="moderator">مشرف (Moderator)</option>
                <option value="admin">مدير (Admin)</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '12px', fontWeight: 'bold' }}>
                الصلاحيات
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
                إلغاء
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
                إضافة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
