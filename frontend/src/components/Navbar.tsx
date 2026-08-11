import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <header
      style={{
        height: '64px',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'rgba(11, 15, 25, 0.8)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Wholesale & Distribution Portal
        </h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(99, 102, 241, 0.2)',
              border: '1px solid var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)',
            }}
          >
            <UserIcon size={18} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {user.name}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</p>
          </div>
        </div>

        <button
          className="btn btn-secondary btn-sm"
          onClick={logout}
          title="Log out of system"
          style={{ gap: '0.375rem' }}
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </header>
  );
};
