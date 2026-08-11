import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { ShieldCheck, Lock, Mail, Building2, KeyRound } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill in both email and password', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      showToast('Login successful! Welcome to Mini ERP + CRM', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const setTestUser = (testEmail: string, testPass: string) => {
    setEmail(testEmail);
    setPassword(testPass);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-main)',
        padding: '1.5rem',
        backgroundImage: 'radial-gradient(circle at 50% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 60%)',
      }}
    >
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem 2rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              marginBottom: '1rem',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
            }}
          >
            <Building2 size={28} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Mini ERP + CRM Portal
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Sign in to access your operations dashboard
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="glass-input"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="glass-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }} disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign In to Portal'}
          </button>
        </form>

        {/* Quick Test Credentials Switcher */}
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', textAlign: 'center', letterSpacing: '0.05em' }}>
            ⚡ Quick Test Login Credentials
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setTestUser('admin@example.com', 'Admin@123')}
              style={{ fontSize: '0.75rem', justifyContent: 'flex-start' }}
            >
              <ShieldCheck size={14} color="#6366F1" /> Admin
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setTestUser('sales@example.com', 'Sales@123')}
              style={{ fontSize: '0.75rem', justifyContent: 'flex-start' }}
            >
              <KeyRound size={14} color="#10B981" /> Sales
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setTestUser('warehouse@example.com', 'Warehouse@123')}
              style={{ fontSize: '0.75rem', justifyContent: 'flex-start' }}
            >
              <KeyRound size={14} color="#F59E0B" /> Warehouse
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setTestUser('accounts@example.com', 'Accounts@123')}
              style={{ fontSize: '0.75rem', justifyContent: 'flex-start' }}
            >
              <KeyRound size={14} color="#06B6D4" /> Accounts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
