import React, { ReactNode } from 'react';

interface Props {
  title: string;
  value: string | number;
  icon: ReactNode;
  subtitle?: string;
  color?: 'primary' | 'success' | 'warning' | 'info' | 'danger';
}

export const StatCard: React.FC<Props> = ({ title, value, icon, subtitle, color = 'primary' }) => {
  const getColorStyles = () => {
    switch (color) {
      case 'success':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#34D399' };
      case 'warning':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#FBBF24' };
      case 'danger':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: '#F87171' };
      case 'info':
        return { bg: 'rgba(59, 130, 246, 0.15)', text: '#60A5FA' };
      default:
        return { bg: 'rgba(99, 102, 241, 0.15)', text: '#818CF8' };
    }
  };

  const style = getColorStyles();

  return (
    <div className="glass-panel" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.25rem' }}>
            {title}
          </p>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
            {value}
          </h3>
          {subtitle && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              {subtitle}
            </p>
          )}
        </div>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: style.bg,
            color: style.text,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};
