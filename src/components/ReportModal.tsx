import React, { useState } from "react";
import { submitReport, reportReasons, ReportReason, ReportData } from "../services/supabase";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "./ToastProvider";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: 'post' | 'comment';
  contentId: string;
  reportedUserId: string;
}

export default function ReportModal({
  isOpen,
  onClose,
  contentType,
  contentId,
  reportedUserId
}: ReportModalProps) {
  const user = useAuth();
  const { showToast } = useToast();
  const [selectedReason, setSelectedReason] = useState<ReportReason | ''>('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !user) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedReason) {
      showToast('الرجاء اختيار سبب البلاغ', 'error');
      return;
    }

    setIsSubmitting(true);

    const reportData: ReportData = {
      contentType,
      contentId,
      reportedUserId,
      reason: selectedReason as ReportReason,
      details: details.trim() || undefined
    };

    const result = await submitReport(reportData, user.id);

    setIsSubmitting(false);

    if (result.success) {
      showToast('✅ تم إرسال البلاغ بنجاح. سيتم مراجعته قريباً.', 'success');
      onClose();
      setSelectedReason('');
      setDetails('');
    } else {
      showToast(result.error || 'فشل إرسال البلاغ', 'error');
    }
  }

  function handleClose() {
    if (!isSubmitting) {
      onClose();
      setSelectedReason('');
      setDetails('');
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}
      >
        {/* Modal */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'var(--card)',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(139, 92, 246, 0.3)'
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h2 style={{ margin: 0, fontSize: '20px' }}>
              🚨 الإبلاغ عن محتوى
            </h2>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '24px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                color: '#aaa',
                padding: '0',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              ×
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Description */}
            <p style={{
              color: '#aaa',
              fontSize: '14px',
              marginBottom: '20px',
              lineHeight: '1.6'
            }}>
              إذا كنت تعتقد أن هذا {contentType === 'post' ? 'المنشور' : 'التعليق'} ينتهك قواعد المجتمع،
              يرجى إخبارنا بذلك. سيتم مراجعة بلاغك من قبل فريقنا.
            </p>

            {/* Reasons */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '12px',
                fontWeight: 600,
                color: 'white'
              }}>
                سبب البلاغ: <span style={{ color: '#ef4444' }}>*</span>
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(Object.keys(reportReasons) as ReportReason[]).map((reason) => (
                  <label
                    key={reason}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px',
                      background: selectedReason === reason
                        ? 'rgba(139, 92, 246, 0.2)'
                        : 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: selectedReason === reason
                        ? '2px solid var(--accent)'
                        : '2px solid transparent',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedReason !== reason) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedReason !== reason) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      }
                    }}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={(e) => setSelectedReason(e.target.value as ReportReason)}
                      disabled={isSubmitting}
                      style={{
                        marginLeft: '10px',
                        cursor: 'pointer',
                        accentColor: 'var(--accent)'
                      }}
                    />
                    <span style={{ fontSize: '14px' }}>
                      {reportReasons[reason]}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Details */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 600,
                color: 'white'
              }}>
                تفاصيل إضافية (اختياري):
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                disabled={isSubmitting}
                placeholder="أضف أي تفاصيل إضافية تساعدنا في فهم المشكلة..."
                maxLength={500}
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '12px',
                  background: 'var(--bg)',
                  color: 'white',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
              <div style={{
                textAlign: 'left',
                fontSize: '12px',
                color: '#888',
                marginTop: '4px'
              }}>
                {details.length}/500
              </div>
            </div>

            {/* Buttons */}
            <div style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end'
            }}>
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                style={{
                  padding: '10px 20px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  opacity: isSubmitting ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedReason}
                style={{
                  padding: '10px 24px',
                  background: isSubmitting || !selectedReason
                    ? '#666'
                    : '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isSubmitting || !selectedReason ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting && selectedReason) {
                    e.currentTarget.style.background = '#dc2626';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting && selectedReason) {
                    e.currentTarget.style.background = '#ef4444';
                  }
                }}
              >
                {isSubmitting ? '⏳ جاري الإرسال...' : '🚨 إرسال البلاغ'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
