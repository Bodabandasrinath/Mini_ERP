import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        gap: '1rem',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.15)',
          color: 'var(--status-danger)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ShieldAlert size={36} />
      </div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
        403 - Access Forbidden
      </h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', fontSize: '0.875rem' }}>
        Your user account role does not have administrative permission to view or modify this resource.
      </p>
      <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
        <ArrowLeft size={16} /> Return to Dashboard
      </button>
    </div>
  );
};
