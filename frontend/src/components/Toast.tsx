import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          zIndex: 9999,
          maxWidth: '380px',
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="glass-panel"
            style={{
              padding: '0.875rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              borderLeft: `4px solid ${
                toast.type === 'success'
                  ? 'var(--status-success)'
                  : toast.type === 'error'
                  ? 'var(--status-danger)'
                  : 'var(--status-info)'
              }`,
              animation: 'slideUp 0.2s ease',
            }}
          >
            {toast.type === 'success' && <CheckCircle2 size={18} color="var(--status-success)" />}
            {toast.type === 'error' && <AlertCircle size={18} color="var(--status-danger)" />}
            {toast.type === 'info' && <Info size={18} color="var(--status-info)" />}
            <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', flex: 1 }}>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
