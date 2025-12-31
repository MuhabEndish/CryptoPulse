import { useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import { MdEdit } from 'react-icons/md';

interface InputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title?: string;
  message?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
  required?: boolean;
}

export default function InputModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Input Required',
  message,
  placeholder = 'Enter text...',
  defaultValue = '',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  required = false
}: InputModalProps) {
  const [value, setValue] = useState(defaultValue);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (required && !value.trim()) return;
    onConfirm(value);
    onClose();
    setValue('');
  };

  const handleClose = () => {
    onClose();
    setValue('');
  };

  return (
    <div
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
        zIndex: 9999,
        padding: '20px'
      }}
      onClick={handleClose}
    >
      <div
        style={{
          background: 'var(--card)',
          borderRadius: '15px',
          padding: '30px',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
          animation: 'slideIn 0.2s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <MdEdit style={{ fontSize: '32px', color: '#8b5cf6' }} />
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold' }}>
              {title}
            </h2>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text)',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '5px',
              display: 'flex',
              alignItems: 'center',
              opacity: 0.7,
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
          >
            <AiOutlineClose />
          </button>
        </div>

        {/* Message */}
        {message && (
          <p style={{
            margin: '0 0 20px 0',
            fontSize: '15px',
            opacity: 0.8,
            lineHeight: '1.6'
          }}>
            {message}
          </p>
        )}

        {/* Input Field */}
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleConfirm();
            if (e.key === 'Escape') handleClose();
          }}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: 'var(--bg)',
            border: '2px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '10px',
            color: 'var(--text)',
            fontSize: '15px',
            outline: 'none',
            transition: 'border-color 0.2s',
            marginBottom: '25px'
          }}
          onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
          onBlur={(e) => e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)'}
        />

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={handleClose}
            style={{
              padding: '12px 24px',
              background: 'transparent',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              color: 'var(--text)',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              opacity: 0.7
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0.7';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            {cancelText}
          </button>

          <button
            onClick={handleConfirm}
            disabled={required && !value.trim()}
            style={{
              padding: '12px 24px',
              background: (required && !value.trim()) ? 'rgba(139, 92, 246, 0.3)' : '#8b5cf6',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              fontSize: '15px',
              fontWeight: '600',
              cursor: (required && !value.trim()) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: (required && !value.trim()) ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (!(required && !value.trim())) {
                e.currentTarget.style.background = '#7c3aed';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!(required && !value.trim())) {
                e.currentTarget.style.background = '#8b5cf6';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
