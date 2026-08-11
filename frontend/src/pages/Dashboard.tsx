import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboard.service';
import { DashboardStats } from '../types';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { Users, Package, AlertTriangle, FileText, TrendingUp, Clock, Boxes } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading dashboard metrics...
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Operations Control Center
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Real-time view of stock movements, active customers, low-stock warnings & sales challans
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <StatCard
          title="Total Customers"
          value={stats.kpi.totalCustomers}
          subtitle={`${stats.kpi.activeCustomers} Active`}
          icon={<Users size={22} />}
          color="primary"
        />
        <StatCard
          title="Product Catalog"
          value={stats.kpi.totalProducts}
          subtitle="Active SKUs"
          icon={<Package size={22} />}
          color="info"
        />
        <StatCard
          title="Low Stock Alerts"
          value={stats.kpi.lowStockProductsCount}
          subtitle="Action required"
          icon={<AlertTriangle size={22} />}
          color={stats.kpi.lowStockProductsCount > 0 ? 'danger' : 'success'}
        />
        <StatCard
          title="Sales Challans"
          value={stats.kpi.totalChallans}
          subtitle={`${stats.kpi.confirmedChallans} Confirmed / ${stats.kpi.draftChallans} Draft`}
          icon={<FileText size={22} />}
          color="warning"
        />
      </div>

      {/* Low Stock Alert Table / Section */}
      {stats.lowStockAlerts.length > 0 && (
        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--status-danger)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={20} color="var(--status-danger)" />
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Low Stock Threshold Warnings ({stats.lowStockAlerts.length})
              </h2>
            </div>
            <Link to="/products?lowStock=true" className="btn btn-secondary btn-sm">
              View All Low Stock
            </Link>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Warehouse Location</th>
                  <th>Current Stock</th>
                  <th>Min Alert Qty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.lowStockAlerts.map((prod) => (
                  <tr key={prod.id}>
                    <td style={{ fontWeight: 600 }}>{prod.productName}</td>
                    <td><code style={{ color: 'var(--accent-secondary)' }}>{prod.sku}</code></td>
                    <td>{prod.warehouseLocation}</td>
                    <td style={{ color: 'var(--status-danger)', fontWeight: 700 }}>{prod.currentStock}</td>
                    <td>{prod.minimumStockAlertQuantity}</td>
                    <td>
                      <span className="badge badge-danger">LOW STOCK</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Activity Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* Recent Customers */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} color="var(--accent-primary)" /> Recent Customers
            </h3>
            <Link to="/customers" style={{ color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>
              View All
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stats.recentActivity.customers.map((cust) => (
              <div
                key={cust.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.625rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255,255,255,0.02)',
                }}
              >
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{cust.businessName}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Contact: {cust.customerName}</p>
                </div>
                <StatusBadge status={cust.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Stock Movements */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Boxes size={18} color="var(--accent-secondary)" /> Recent Stock Movements
            </h3>
            <Link to="/inventory" style={{ color: 'var(--accent-secondary)', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>
              View All
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stats.recentActivity.movements.map((mov) => (
              <div
                key={mov.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.625rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255,255,255,0.02)',
                }}
              >
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {mov.product?.productName}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reason: {mov.reason}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <StatusBadge status={mov.movementType} />
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, marginTop: '0.25rem' }}>
                    {mov.movementType === 'IN' ? '+' : '-'}{mov.quantityChanged}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sales Challans */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} color="var(--status-warning)" /> Recent Sales Challans
            </h3>
            <Link to="/challans" style={{ color: 'var(--status-warning)', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>
              View All
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stats.recentActivity.challans.map((ch) => (
              <div
                key={ch.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.625rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255,255,255,0.02)',
                }}
              >
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {ch.challanNumber}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ch.customer?.businessName}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <StatusBadge status={ch.status} />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    Qty: {ch.totalQuantity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
