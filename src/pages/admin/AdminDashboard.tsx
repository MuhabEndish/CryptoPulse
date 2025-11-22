import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAdminStatus, getDashboardStats, supabase } from '../../services/supabase';
import LoadingSpinner from '../../components/LoadingSpinner';

interface DashboardStats {
  total_posts: number;
  total_comments: number;
  total_users: number;
  pending_reports: number;
  banned_users: number;
  posts_last_24h: number;
  new_users_24h: number;
}

interface AdminData {
  role: string;
  permissions: any;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function init() {
      // التحقق من الصلاحيات
      const { isAdmin, adminData: admin } = await checkAdminStatus();

      if (!isAdmin) {
        navigate('/admin/login');
        return;
      }

      setAdminData(admin as AdminData);

      // جلب الإحصائيات
      const result = await getDashboardStats();
      if (result.success) {
        setStats(result.data);
      }

      setLoading(false);
    }
    init();
  }, [navigate]);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/admin/login');
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)'
      }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      padding: '0'
    }}>
      {/* Header */}
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
          <span style={{ fontSize: '32px' }}>👨‍💼</span>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>
              لوحة التحكم الإدارية
            </h1>
            <p style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              margin: '4px 0 0 0'
            }}>
              الدور: <span style={{
                color: 'var(--accent)',
                fontWeight: '600'
              }}>
                {adminData?.role === 'super_admin' ? 'مدير عام' :
                 adminData?.role === 'admin' ? 'مدير' : 'مشرف'}
              </span>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
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
            🏠 الصفحة الرئيسية
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
            🚪 تسجيل الخروج
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Statistics Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          <StatCard
            icon="👥"
            title="إجمالي المستخدمين"
            value={stats?.total_users || 0}
            color="#667eea"
            subtitle={`${stats?.new_users_24h || 0} جديد خلال 24 ساعة`}
          />
          <StatCard
            icon="📝"
            title="إجمالي المنشورات"
            value={stats?.total_posts || 0}
            color="#06b6d4"
            subtitle={`${stats?.posts_last_24h || 0} جديد خلال 24 ساعة`}
          />
          <StatCard
            icon="💬"
            title="إجمالي التعليقات"
            value={stats?.total_comments || 0}
            color="#10b981"
          />
          <StatCard
            icon="🚨"
            title="البلاغات المعلقة"
            value={stats?.pending_reports || 0}
            color="#f59e0b"
            alert={stats?.pending_reports ? stats.pending_reports > 0 : false}
          />
          <StatCard
            icon="🚫"
            title="المستخدمون المحظورون"
            value={stats?.banned_users || 0}
            color="#ef4444"
          />
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{
            fontSize: '22px',
            fontWeight: '700',
            marginBottom: '20px',
            color: 'var(--text)'
          }}>
            الإجراءات السريعة
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            <ActionCard
              icon="🚨"
              title="إدارة البلاغات"
              description="عرض والرد على البلاغات المقدمة من المستخدمين"
              onClick={() => navigate('/admin/reports')}
              badge={stats?.pending_reports}
            />
            <ActionCard
              icon="📝"
              title="إدارة المنشورات"
              description="عرض وحذف المنشورات غير اللائقة"
              onClick={() => navigate('/admin/posts')}
            />
            <ActionCard
              icon="👥"
              title="إدارة المستخدمين"
              description="حظر، إلغاء الحظر، أو حذف المستخدمين"
              onClick={() => navigate('/admin/users')}
            />
            {adminData?.role === 'super_admin' && (
              <ActionCard
                icon="�‍💼"
                title="إدارة المديرين"
                description="إضافة وتعديل وحذف المديرين والمشرفين"
                onClick={() => navigate('/admin/management')}
              />
            )}
          </div>
        </div>

        {/* Info Box */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          padding: '30px',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>🎉</div>
          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '10px' }}>
            مرحباً في لوحة التحكم!
          </h3>
          <p style={{ fontSize: '15px', opacity: 0.9 }}>
            يمكنك إدارة جميع جوانب المنصة من هنا. ابدأ باختيار إحدى الإجراءات أعلاه.
          </p>
        </div>
      </main>
    </div>
  );
}

interface StatCardProps {
  icon: string;
  title: string;
  value: number;
  color: string;
  subtitle?: string;
  alert?: boolean;
}

function StatCard({ icon, title, value, color, subtitle, alert }: StatCardProps) {
  return (
    <div style={{
      background: 'var(--card)',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      border: alert ? `2px solid ${color}` : '1px solid var(--border)',
      position: 'relative',
      overflow: 'hidden',
      transition: 'transform 0.2s, box-shadow 0.2s'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
    }}>
      {/* Background Icon */}
      <div style={{
        position: 'absolute',
        top: '-20px',
        right: '-20px',
        fontSize: '120px',
        opacity: 0.05
      }}>
        {icon}
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: '40px', marginBottom: '10px' }}>{icon}</div>
        <h3 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: color,
          margin: '0 0 8px 0'
        }}>
          {value.toLocaleString('ar')}
        </h3>
        <p style={{
          fontSize: '14px',
          color: 'var(--text-secondary)',
          margin: 0,
          fontWeight: '600'
        }}>
          {title}
        </p>
        {subtitle && (
          <p style={{
            fontSize: '12px',
            color: 'var(--text-secondary)',
            margin: '8px 0 0 0',
            opacity: 0.7
          }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

interface ActionCardProps {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
  badge?: number;
}

function ActionCard({ icon, title, description, onClick, badge }: ActionCardProps) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'var(--card)',
        border: '2px solid var(--border)',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'right',
        cursor: 'pointer',
        transition: 'all 0.2s',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = 'var(--accent)';
        e.currentTarget.style.boxShadow = '0 8px 20px rgba(139, 92, 246, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {badge !== undefined && badge > 0 && (
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          background: '#ef4444',
          color: 'white',
          borderRadius: '20px',
          padding: '4px 12px',
          fontSize: '12px',
          fontWeight: '700'
        }}>
          {badge}
        </div>
      )}

      <div style={{ fontSize: '40px', marginBottom: '12px' }}>{icon}</div>
      <h3 style={{
        fontSize: '18px',
        fontWeight: '700',
        color: 'var(--text)',
        margin: '0 0 8px 0'
      }}>
        {title}
      </h3>
      <p style={{
        fontSize: '14px',
        color: 'var(--text-secondary)',
        margin: 0,
        lineHeight: '1.5'
      }}>
        {description}
      </p>
    </button>
  );
}
