import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service';
import { useToast } from '../components/Toast';
import { Role } from '../types';
import {
  ShieldCheck,
  Lock,
  Mail,
  Building2,
  KeyRound,
  User,
  Phone,
  CheckCircle2,
  UserPlus,
  LogIn,
  AlertCircle,
} from 'lucide-react';

export const Login: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Inline Error Banner
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sign In Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  // Sign Up / Registration Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regRole, setRegRole] = useState<Role>('SALES');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regSubmitting, setRegSubmitting] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Handle Sign In Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!loginIdentifier || !loginPassword) {
      setErrorMessage('Please enter your username/email and password');
      return;
    }

    setLoginSubmitting(true);
    try {
      await login(loginIdentifier, loginPassword);
      showToast('Login successful! Welcome to Operations Portal', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.message || 'Invalid username or password';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setLoginSubmitting(false);
    }
  };

  // Handle Account Registration Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regName || !regEmail || !regPassword || !regConfirmPassword) {
      setErrorMessage('Please fill in all required fields');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match! Please verify your password confirmation.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return;
    }

    setRegSubmitting(true);
    try {
      await authService.register({
        name: regName,
        email: regEmail,
        mobileNumber: regMobile,
        role: regRole,
        password: regPassword,
        confirmPassword: regConfirmPassword,
      });

      showToast('Account created successfully! Please sign in with your username/email and password.', 'success');
      
      // Pre-fill Sign In with newly registered email or name
      setLoginIdentifier(regEmail);
      setLoginPassword('');
      setErrorMessage(null);
      
      // Reset Sign Up form
      setRegName('');
      setRegEmail('');
      setRegMobile('');
      setRegPassword('');
      setRegConfirmPassword('');

      // Switch back to Sign In view
      setActiveTab('login');
    } catch (err: any) {
      const msg = err.message || 'Registration failed';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setRegSubmitting(false);
    }
  };

  const setTestUser = (testEmail: string, testPass: string) => {
    setErrorMessage(null);
    setActiveTab('login');
    setLoginIdentifier(testEmail);
    setLoginPassword(testPass);
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
      <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '2.25rem 2rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              marginBottom: '0.75rem',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
            }}
          >
            <Building2 size={26} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Operations Portal
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {activeTab === 'login' ? 'Sign in to manage your ERP & CRM tasks' : 'Create a new operations user account'}
          </p>
        </div>

        {/* Inline Red Alert Banner */}
        {errorMessage && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#F87171',
              fontSize: '0.875rem',
              fontWeight: 500,
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Navigation Tabs (Sign In / Sign Up) */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            border: '1px solid var(--border-color)',
          }}
        >
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setErrorMessage(null); }}
            style={{
              flex: 1,
              padding: '0.625rem',
              fontSize: '0.875rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
              color: activeTab === 'login' ? '#FFF' : 'var(--text-secondary)',
              background: activeTab === 'login' ? 'var(--accent-primary)' : 'transparent',
              boxShadow: activeTab === 'login' ? '0 2px 8px rgba(99, 102, 241, 0.3)' : 'none',
            }}
          >
            <LogIn size={16} /> Sign In
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setErrorMessage(null); }}
            style={{
              flex: 1,
              padding: '0.625rem',
              fontSize: '0.875rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
              color: activeTab === 'register' ? '#FFF' : 'var(--text-secondary)',
              background: activeTab === 'register' ? 'var(--accent-primary)' : 'transparent',
              boxShadow: activeTab === 'register' ? '0 2px 8px rgba(99, 102, 241, 0.3)' : 'none',
            }}
          >
            <UserPlus size={16} /> Register
          </button>
        </div>

        {/* TAB 1: SIGN IN FORM */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                Username / Email
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="glass-input"
                  placeholder="Enter username or email address"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
                <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
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
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
                <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }} disabled={loginSubmitting}>
              {loginSubmitting ? 'Signing in...' : 'Sign In'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => { setActiveTab('register'); setErrorMessage(null); }}
                style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Register here
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: REGISTRATION FORM */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                Full Name / Username *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="glass-input"
                  placeholder="srinath"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
                <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Email Address *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    className="glass-input"
                    placeholder="srinath@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                  <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Phone Number
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="+919876543210"
                    value={regMobile}
                    onChange={(e) => setRegMobile(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                  />
                  <Phone size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                Account Role
              </label>
              <select
                className="glass-input"
                value={regRole}
                onChange={(e) => setRegRole(e.target.value as Role)}
              >
                <option value="SALES">Sales Manager (CRM & Challans)</option>
                <option value="WAREHOUSE">Warehouse Supervisor (Products & Stock)</option>
                <option value="ACCOUNTS">Accounts Specialist (Financial Views)</option>
                <option value="ADMIN">System Administrator (Full Control)</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    className="glass-input"
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                  <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Confirm Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    className="glass-input"
                    placeholder="••••••••"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                  <CheckCircle2 size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }} disabled={regSubmitting}>
              {regSubmitting ? 'Creating Account...' : 'Create Account & Proceed to Sign In'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setErrorMessage(null); }}
                style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Sign in here
              </button>
            </div>
          </form>
        )}

        {/* Quick Pre-seeded Accounts Switcher */}
        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', textAlign: 'center', letterSpacing: '0.05em' }}>
            ⚡ Quick Test Pre-seeded Accounts
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
