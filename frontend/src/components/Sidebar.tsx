import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Package,
  Boxes,
  FileText,
  UserCheck,
  Building2,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  // Role permissions:
  // ADMIN: All
  // SALES: Customers, Sales Challans, View Products/Stock
  // WAREHOUSE: Products, Inventory, Stock movements, View customers
  // ACCOUNTS: View customers, View products, View challans

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, show: true },
    {
      label: 'Customers (CRM)',
      path: '/customers',
      icon: Users,
      show: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'].includes(role),
    },
    {
      label: 'Products',
      path: '/products',
      icon: Package,
      show: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'].includes(role),
    },
    {
      label: 'Inventory & Stock',
      path: '/inventory',
      icon: Boxes,
      show: ['ADMIN', 'WAREHOUSE', 'SALES', 'ACCOUNTS'].includes(role),
    },
    {
      label: 'Sales Challans',
      path: '/challans',
      icon: FileText,
      show: ['ADMIN', 'SALES', 'ACCOUNTS', 'WAREHOUSE'].includes(role),
    },
    { label: 'Profile', path: '/profile', icon: UserCheck, show: true },
  ];

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '1.5rem 1.25rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFF',
          }}
        >
          <Building2 size={20} />
        </div>
        <div>
          <h1 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
            Mini ERP + CRM
          </h1>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Operations Portal
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {navItems
          .filter((item) => item.show)
          .map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                  background: isActive ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0.05) 100%)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                })}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
      </nav>

      {/* Role Footer Card */}
      <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
        <div
          className="glass-panel"
          style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)' }}
        >
          <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Active Access Role
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent-secondary)' }}>
              {user.role}
            </span>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--status-success)' }} />
          </div>
        </div>
      </div>
    </aside>
  );
};
