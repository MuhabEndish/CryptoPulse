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
    const reason = prompt(`سبب حظر ${username}:`);
    if (!reason) return;

    const isPermanent = confirm('حظر دائم؟\n\nاضغط OK للحظر الدائم\nاضغط Cancel للحظر المؤقت');

    let bannedUntil: string | undefined;
    if (!isPermanent) {
      const days = prompt('عدد أيام الحظر:', '7');
      if (!days || isNaN(Number(days))) return;
      const date = new Date();
      date.setDate(date.getDate() + parseInt(days));
      bannedUntil = date.toISOString();
    }

    const result = await banUser(
      userId,
      reason,
      isPermanent ? 'permanent' : 'temporary',
      bannedUntil
    );

    if (result.success) {
      alert('✅ تم حظر المستخدم بنجاح');
      loadUsers();
    } else {
      alert('❌ ' + (result.error || 'حدث خطأ في الحظر'));
    }
  }

  async function handleUnbanUser(userId: string, username: string) {
    if (!confirm(`هل تريد إلغاء حظر ${username}؟`)) return;

    const result = await unbanUser(userId);
    if (result.success) {
      alert('✅ تم إلغاء الحظر بنجاح');
      loadUsers();
    } else {
      alert('❌ حدث خطأ');
    }
  }

  async function handleDeleteUser(userId: string, username: string) {
    if (!adminData?.permissions?.delete_users) {
      alert('❌ ليس لديك صلاحية حذف المستخدمين (Super Admin فقط)');
      return;
    }

    const confirmation = prompt(
      `⚠️ تحذير: حذف المستخدم نهائياً!\n\nسيتم حذف:\n- حساب المستخدم\n- جميع منشوراته\n- جميع تعليقاته\n- جميع إعجاباته\n\nلتأكيد الحذف، اكتب اسم المستخدم: ${username}`
    );

    if (confirmation !== username) {
      alert('❌ تم إلغاء العملية');
      return;
    }

    const result = await deleteUser(userId);
    if (result.success) {
      alert('✅ تم حذف المستخدم نهائياً');
      loadUsers();
    } else {
      alert('❌ حدث خطأ في الحذف');
    }
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
              ←
            </button>
            <span style={{ fontSize: '32px' }}>👥</span>
            <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>
              إدارة المستخدمين
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
            🚪 تسجيل الخروج
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
              placeholder="🔍 البحث عن مستخدم (الاسم أو البريد)..."
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
                {f === 'all' ? '👥 الكل' : f === 'active' ? '✅ النشطون' : '🚫 المحظورون'}
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
              إجمالي المستخدمين
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
              المحظورون
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
              النشطون
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
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔍</div>
            <h3 style={{ fontSize: '20px', color: 'var(--text)' }}>
              لم يتم العثور على مستخدمين
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
                      المستخدم
                    </th>
                    <th style={{ padding: '16px', textAlign: 'right', fontWeight: '700' }}>
                      البريد الإلكتروني
                    </th>
                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700' }}>
                      المنشورات
                    </th>
                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700' }}>
                      تاريخ التسجيل
                    </th>
                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700' }}>
                      الحالة
                    </th>
                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700' }}>
                      الإجراءات
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
                          {new Date(user.created_at).toLocaleDateString('ar-SA')}
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
                                🚫 محظور {banInfo?.ban_type === 'permanent' ? 'دائماً' : 'مؤقتاً'}
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
                              ✅ نشط
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
                                ✅ إلغاء الحظر
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
                                🚫 حظر
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
                                🗑️ حذف
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
    </div>
  );
}
