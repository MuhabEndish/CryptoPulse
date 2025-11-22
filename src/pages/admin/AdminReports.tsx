import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  checkAdminStatus,
  getAllReports,
  updateReportStatus,
  adminDeletePost,
  adminDeleteComment,
  banUser,
  supabase
} from '../../services/supabase';
import LoadingSpinner from '../../components/LoadingSpinner';

interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  content_type: 'post' | 'comment';
  content_id: string;
  reason: string;
  details: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  created_at: string;
  reporter?: {
    username: string;
    avatar_url?: string;
  };
  reported_user?: {
    username: string;
    avatar_url?: string;
  };
}

export default function AdminReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('pending');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function init() {
      const { isAdmin } = await checkAdminStatus();
      if (!isAdmin) {
        navigate('/admin/login');
        return;
      }
      await loadReports();
    }
    init();
  }, [navigate]);

  useEffect(() => {
    loadReports();
  }, [filter]);

  async function loadReports() {
    setLoading(true);
    const result = await getAllReports(filter === 'all' ? undefined : filter);
    if (result.success) {
      setReports(result.data || []);
    }
    setLoading(false);
  }

  async function handleResolve(reportId: string) {
    if (!confirm('هل تريد تحديد هذا البلاغ كـ "تم الحل"؟')) return;

    const result = await updateReportStatus(reportId, 'resolved');
    if (result.success) {
      alert('✅ تم تحديث حالة البلاغ');
      loadReports();
    } else {
      alert('❌ حدث خطأ');
    }
  }

  async function handleDismiss(reportId: string) {
    if (!confirm('هل تريد رفض هذا البلاغ؟')) return;

    const result = await updateReportStatus(reportId, 'dismissed');
    if (result.success) {
      alert('✅ تم رفض البلاغ');
      loadReports();
    } else {
      alert('❌ حدث خطأ');
    }
  }

  async function handleDeleteContent(report: Report) {
    const reason = prompt('سبب الحذف (اختياري):') || 'محتوى مبلغ عنه';

    if (!confirm(`هل تريد حذف ${report.content_type === 'post' ? 'المنشور' : 'التعليق'}؟`)) return;

    let result;
    if (report.content_type === 'post') {
      result = await adminDeletePost(report.content_id, reason);
    } else {
      result = await adminDeleteComment(report.content_id, reason);
    }

    if (result.success) {
      await updateReportStatus(report.id, 'resolved');
      alert('✅ تم حذف المحتوى بنجاح');
      loadReports();
    } else {
      alert('❌ حدث خطأ في الحذف');
    }
  }

  async function handleBanUser(report: Report) {
    const reason = prompt('سبب الحظر:');
    if (!reason) return;

    const isPermanent = confirm('حظر دائم؟ (اضغط Cancel للحظر المؤقت)');

    let bannedUntil: string | undefined;
    if (!isPermanent) {
      const days = prompt('عدد أيام الحظر:', '7');
      if (!days) return;
      const date = new Date();
      date.setDate(date.getDate() + parseInt(days));
      bannedUntil = date.toISOString();
    }

    const result = await banUser(
      report.reported_user_id,
      reason,
      isPermanent ? 'permanent' : 'temporary',
      bannedUntil
    );

    if (result.success) {
      await updateReportStatus(report.id, 'resolved');
      alert('✅ تم حظر المستخدم بنجاح');
      loadReports();
    } else {
      alert('❌ ' + (result.error || 'حدث خطأ'));
    }
  }

  const getReasonText = (reason: string) => {
    const reasons: Record<string, string> = {
      spam: '🚫 رسائل مزعجة',
      harassment: '😡 تحرش',
      hate_speech: '💢 خطاب كراهية',
      violence: '⚠️ عنف',
      inappropriate_content: '🔞 محتوى غير لائق',
      false_information: '❌ معلومات خاطئة',
      other: '📝 أخرى'
    };
    return reasons[reason] || reason;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, any> = {
      pending: { bg: '#fef3c7', color: '#92400e', text: '⏳ معلق' },
      reviewed: { bg: '#dbeafe', color: '#1e40af', text: '👀 تمت المراجعة' },
      resolved: { bg: '#d1fae5', color: '#065f46', text: '✅ تم الحل' },
      dismissed: { bg: '#fee2e2', color: '#991b1b', text: '🚫 مرفوض' }
    };
    const style = styles[status] || styles.pending;

    return (
      <span style={{
        background: style.bg,
        color: style.color,
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600'
      }}>
        {style.text}
      </span>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <header style={{
        background: 'var(--card)',
        borderBottom: '1px solid var(--border)',
        padding: '20px 40px',
        position: 'sticky',
        top: 0,
        zIndex: 100
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
            <span style={{ fontSize: '32px' }}>🚨</span>
            <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>
              إدارة البلاغات
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

      <main style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Filters */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '30px',
          flexWrap: 'wrap'
        }}>
          {['all', 'pending', 'reviewed', 'resolved', 'dismissed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '10px 20px',
                background: filter === f ? 'var(--accent)' : 'var(--card)',
                color: filter === f ? 'white' : 'var(--text)',
                border: filter === f ? 'none' : '2px solid var(--border)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              {f === 'all' ? '📋 الكل' :
               f === 'pending' ? '⏳ المعلقة' :
               f === 'reviewed' ? '👀 المراجعة' :
               f === 'resolved' ? '✅ المحلولة' :
               '🚫 المرفوضة'}
            </button>
          ))}
        </div>

        {/* Reports List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <LoadingSpinner />
          </div>
        ) : reports.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px',
            background: 'var(--card)',
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📭</div>
            <h3 style={{ fontSize: '20px', color: 'var(--text)' }}>
              لا توجد بلاغات في هذه الفئة
            </h3>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {reports.map(report => (
              <div
                key={report.id}
                style={{
                  background: 'var(--card)',
                  border: '2px solid var(--border)',
                  borderRadius: '12px',
                  padding: '24px',
                  transition: 'all 0.2s'
                }}
              >
                {/* Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '16px'
                }}>
                  <div>
                    <div style={{
                      fontSize: '24px',
                      marginBottom: '8px'
                    }}>
                      {getReasonText(report.reason)}
                    </div>
                    <div style={{
                      fontSize: '13px',
                      color: 'var(--text-secondary)',
                      marginBottom: '8px'
                    }}>
                      {new Date(report.created_at).toLocaleString('ar-SA')}
                    </div>
                  </div>
                  {getStatusBadge(report.status)}
                </div>

                {/* Content Info */}
                <div style={{
                  background: 'var(--bg)',
                  padding: '16px',
                  borderRadius: '8px',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px'
                  }}>
                    <div>
                      <div style={{
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        marginBottom: '4px'
                      }}>
                        المُبلّغ
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        {report.reporter?.avatar_url && (
                          <img
                            src={report.reporter.avatar_url}
                            alt=""
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              objectFit: 'cover'
                            }}
                          />
                        )}
                        <span style={{ fontWeight: '600' }}>
                          {report.reporter?.username || 'مستخدم محذوف'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div style={{
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        marginBottom: '4px'
                      }}>
                        المستخدم المُبلّغ عنه
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        {report.reported_user?.avatar_url && (
                          <img
                            src={report.reported_user.avatar_url}
                            alt=""
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              objectFit: 'cover'
                            }}
                          />
                        )}
                        <span style={{ fontWeight: '600', color: '#ef4444' }}>
                          {report.reported_user?.username || 'مستخدم محذوف'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div style={{
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        marginBottom: '4px'
                      }}>
                        نوع المحتوى
                      </div>
                      <span style={{ fontWeight: '600' }}>
                        {report.content_type === 'post' ? '📝 منشور' : '💬 تعليق'}
                      </span>
                    </div>
                  </div>

                  {report.details && (
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                      <div style={{
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        marginBottom: '4px'
                      }}>
                        التفاصيل
                      </div>
                      <p style={{
                        margin: 0,
                        fontSize: '14px',
                        color: 'var(--text)',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {report.details}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {report.status === 'pending' && (
                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    flexWrap: 'wrap'
                  }}>
                    <button
                      onClick={() => handleDeleteContent(report)}
                      style={{
                        flex: 1,
                        minWidth: '150px',
                        padding: '12px 20px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
                    >
                      🗑️ حذف المحتوى
                    </button>

                    <button
                      onClick={() => handleBanUser(report)}
                      style={{
                        flex: 1,
                        minWidth: '150px',
                        padding: '12px 20px',
                        background: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#d97706'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#f59e0b'}
                    >
                      🚫 حظر المستخدم
                    </button>

                    <button
                      onClick={() => handleResolve(report.id)}
                      style={{
                        flex: 1,
                        minWidth: '150px',
                        padding: '12px 20px',
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#10b981'}
                    >
                      ✅ تم الحل
                    </button>

                    <button
                      onClick={() => handleDismiss(report.id)}
                      style={{
                        flex: 1,
                        minWidth: '150px',
                        padding: '12px 20px',
                        background: 'var(--card)',
                        color: 'var(--text)',
                        border: '2px solid var(--border)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        transition: 'all 0.2s'
                      }}
                    >
                      🚫 رفض البلاغ
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
