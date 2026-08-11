import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  loading?: boolean;
  type?: 'danger' | 'warning' | 'primary';
}

export const ConfirmDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  loading = false,
  type = 'warning',
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <div
            style={{
              padding: '0.5rem',
              borderRadius: '8px',
              background: type === 'danger' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
              color: type === 'danger' ? '#EF4444' : '#F59E0B',
            }}
          >
            <AlertTriangle size={24} />
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.5' }}>
            {message}
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className={`btn ${type === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};
