import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCheck, ShieldCheck, Mail, Calendar, Key, CheckCircle, Lock } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  const rolePermissions = {
    ADMIN: ['Full System Administration', 'Manage Users & Roles', 'Customer CRM Management', 'Product Catalog & Pricing', 'Stock Movements & Inventory Control', 'Sales Challan Creation & Confirmation', 'System Activity Logs'],
    SALES: ['Customer CRM & Follow-up Notes', 'View Products & Current Stock', 'Create & Edit Draft Sales Challans', 'Confirm Delivery Challans'],
    WAREHOUSE: ['Product Management & SKUs', 'Stock IN / OUT Movements', 'View Customers & Orders', 'Inventory Low Stock Monitoring'],
    ACCOUNTS: ['View Customer Profiles', 'View Product Catalog & Unit Prices', 'View Sales Challan Summaries', 'View Financial & Audit History'],
  };

  const currentPermissions = rolePermissions[user.role] || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          User Profile & Security
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Role-based access level details & active session permissions
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              fontWeight: 800,
              fontSize: '1.25rem',
            }}
          >
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{user.name}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Mail size={14} /> {user.email}
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Assigned Role</p>
            <p style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--accent-secondary)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <ShieldCheck size={18} /> {user.role}
            </p>
          </div>

          <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Authentication Method</p>
            <p style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--status-success)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Lock size={18} /> JWT Bearer + bcrypt
            </p>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            Granted Role Permissions:
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {currentPermissions.map((perm, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                <CheckCircle size={16} color="var(--status-success)" /> {perm}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
