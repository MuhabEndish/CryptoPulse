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
import AdminHeader from '../../components/AdminHeader';
import {
  AiOutlineEye,
  AiOutlineCheck,
  AiOutlineClose,
  AiOutlineDelete,
  AiOutlineFileText,
  AiOutlineArrowLeft,
  AiOutlineWarning,
  AiOutlineLogout
} from 'react-icons/ai';

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
    if (!confirm('Do you want to mark this report as "Resolved"?')) return;

    const result = await updateReportStatus(reportId, 'resolved');
    if (result.success) {
      alert('[Success] Report status updated');
      loadReports();
    } else {
      alert('[Error] An error occurred');
    }
  }

  async function handleDismiss(reportId: string) {
    if (!confirm('Do you want to dismiss this report?')) return;

    const result = await updateReportStatus(reportId, 'dismissed');
    if (result.success) {
      alert('[Success] Report dismissed');
      loadReports();
    } else {
      alert('[Error] An error occurred');
    }
  }

  async function handleDeleteContent(report: Report) {
    const reason = prompt('Reason for deletion (optional):') || 'Reported content';

    if (!confirm(`Do you want to delete this ${report.content_type === 'post' ? 'post' : 'comment'}?`)) return;

    let result;
    if (report.content_type === 'post') {
      result = await adminDeletePost(report.content_id, reason);
    } else {
      result = await adminDeleteComment(report.content_id, reason);
    }

    if (result.success) {
      await updateReportStatus(report.id, 'resolved');
      alert('[Success] Content deleted successfully');
      loadReports();
    } else {
      alert('[Error] An error occurred during deletion');
    }
  }

  async function handleBanUser(report: Report) {
    const reason = prompt('Reason for ban:');
    if (!reason) return;

    const isPermanent = confirm('Permanent ban? (Press Cancel for temporary ban)');

    let bannedUntil: string | undefined;
    if (!isPermanent) {
      const days = prompt('Number of days for ban:', '7');
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
      alert('[Success] User banned successfully');
      loadReports();
    } else {
      alert('[Error] ' + (result.error || 'An error occurred'));
    }
  }

  const getReasonText = (reason: string) => {
    const reasons: Record<string, string> = {
      spam: 'Spam',
      harassment: 'Harassment',
      hate_speech: 'Hate Speech',
      violence: 'Violence',
      inappropriate_content: 'Inappropriate Content',
      false_information: 'False Information',
      other: 'Other'
    };
    return reasons[reason] || reason;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, any> = {
      pending: { bg: '#fef3c7', color: '#92400e', text: 'Pending' },
      reviewed: { bg: '#dbeafe', color: '#1e40af', text: 'Reviewed' },
      resolved: { bg: '#d1fae5', color: '#065f46', text: 'Resolved' },
      dismissed: { bg: '#fee2e2', color: '#991b1b', text: 'Dismissed' }
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
                cursor: 'pointer',
                color: 'var(--text)'
              }}
            >
              <AiOutlineArrowLeft />
            </button>
            <AiOutlineWarning style={{ fontSize: '32px', color: 'var(--accent)' }} />
            <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>
              Reports Management
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
              {f === 'all' ? 'All' :
               f === 'pending' ? 'Pending' :
               f === 'reviewed' ? 'Reviewed' :
               f === 'resolved' ? 'Resolved' :
               'Dismissed'}
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
            <AiOutlineFileText style={{ fontSize: '64px', marginBottom: '20px', opacity: 0.5 }} />
            <h3 style={{ fontSize: '20px', color: 'var(--text)' }}>
              No reports in this category
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
                      {new Date(report.created_at).toLocaleString('en-US')}
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
                        Reporter
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
                          {report.reporter?.username || 'Deleted User'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div style={{
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        marginBottom: '4px'
                      }}>
                        Reported User
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
                          {report.reported_user?.username || 'Deleted User'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div style={{
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        marginBottom: '4px'
                      }}>
                        Content Type
                      </div>
                      <span style={{ fontWeight: '600' }}>
                        {report.content_type === 'post' ? 'Post' : 'Comment'}
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
                        Details
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
                      <AiOutlineDelete style={{ display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' }} /> Delete Content
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
                      <AiOutlineClose style={{ display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' }} /> Ban User
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
                      <AiOutlineCheck style={{ display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' }} /> Resolved
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
                      <AiOutlineClose style={{ display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' }} /> Dismiss Report
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
