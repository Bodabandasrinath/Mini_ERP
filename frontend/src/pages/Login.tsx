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
} from 'lucide-react';

export const Login: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Sign In Form State
  const [loginEmail, setLoginEmail] = useState('');
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
    if (!loginEmail || !loginPassword) {
      showToast('Please fill in both email address and password', 'error');
      return;
    }

    setLoginSubmitting(true);
    try {
      await login(loginEmail, loginPassword);
      showToast('Login successful! Welcome to Mini ERP + CRM', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      showToast(err.message || 'Login failed. Please check your credentials.', 'error');
    } finally {
      setLoginSubmitting(false);
    }
  };

  // Handle Account Registration Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword || !regConfirmPassword) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      showToast('Passwords do not match! Please check and confirm.', 'error');
      return;
    }

    if (regPassword.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
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

      showToast('Account created successfully! Please sign in with your email and password.', 'success');
      
      // Pre-fill Sign In email with newly created account
      setLoginEmail(regEmail);
      setLoginPassword('');
      
      // Reset Sign Up form
      setRegName('');
      setRegEmail('');
      setRegMobile('');
      setRegPassword('');
      setRegConfirmPassword('');

      // Switch back to Sign In tab automatically
      setActiveTab('login');
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setRegSubmitting(false);
    }
  };

  const setTestUser = (testEmail: string, testPass: string) => {
    setActiveTab('login');
    setLoginEmail(testEmail);
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
          <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Mini ERP + CRM Portal
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginTop: '0.125rem' }}>
            Wholesale & Distribution Operations Management
          </p>
        </div>

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
            onClick={() => setActiveTab('login')}
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
            onClick={() => setActiveTab('register')}
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
            <UserPlus size={16} /> Create Account
          </button>
        </div>

        {/* TAB 1: SIGN IN FORM */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="glass-input"
                  placeholder="name@company.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
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
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
                <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }} disabled={loginSubmitting}>
              {loginSubmitting ? 'Signing in...' : 'Sign In to Portal'}
            </button>
          </form>
        )}

        {/* TAB 2: REGISTRATION FORM */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                Full Name *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="glass-input"
                  placeholder="John Doe"
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
                    placeholder="john@company.com"
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
                <option value="WAREHOUSE">Warehouse Supervisor (Products & Inventory)</option>
                <option value="ACCOUNTS">Accounts Specialist (Financial Reports)</option>
                <option value="ADMIN">System Administrator (Full Access)</option>
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
          </form>
        )}

        {/* Quick Pre-seeded Test Credentials Switcher */}
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
