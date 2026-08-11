import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { challanService } from '../services/challan.service';
import { Challan, ChallanStatus, PaginationMeta } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { StatusBadge } from '../components/StatusBadge';
import { Pagination } from '../components/Pagination';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Search, Plus, Eye, CheckCircle2, XCircle, FileText, Calendar } from 'lucide-react';

export const Challans: React.FC = () => {
  const [challans, setChallans] = useState<Challan[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>();
  const [loading, setLoading] = useState(true);

  // Filter State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ChallanStatus | ''>('');
  const [page, setPage] = useState(1);

  // Confirm / Cancel Dialog State
  const [confirmingChallan, setConfirmingChallan] = useState<Challan | null>(null);
  const [cancellingChallan, setCancellingChallan] = useState<Challan | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { hasRole } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const canCreate = hasRole('ADMIN', 'SALES');

  useEffect(() => {
    fetchChallans();
  }, [page, search, statusFilter]);

  const fetchChallans = async () => {
    try {
      setLoading(true);
      const res = await challanService.getChallans({
        page,
        limit: 8,
        search,
        status: statusFilter || undefined,
      });
      setChallans(res.data || []);
      setPagination(res.pagination);
    } catch (err: any) {
      showToast(err.message || 'Failed to load sales challans', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSubmit = async () => {
    if (!confirmingChallan) return;
    try {
      setActionLoading(true);
      await challanService.confirmChallan(confirmingChallan.id);
      showToast(`Sales Challan ${confirmingChallan.challanNumber} confirmed & stock deducted successfully!`, 'success');
      setConfirmingChallan(null);
      fetchChallans();
    } catch (err: any) {
      showToast(err.message || 'Confirmation failed due to stock constraints', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSubmit = async () => {
    if (!cancellingChallan) return;
    try {
      setActionLoading(true);
      await challanService.cancelChallan(cancellingChallan.id);
      showToast(`Sales Challan ${cancellingChallan.challanNumber} cancelled`, 'info');
      setCancellingChallan(null);
      fetchChallans();
    } catch (err: any) {
      showToast(err.message || 'Cancellation failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Sales Delivery Challans
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Generate, confirm & fulfill wholesale delivery challans
          </p>
        </div>
        {canCreate && (
          <button className="btn btn-primary" onClick={() => navigate('/challans/new')}>
            <Plus size={18} /> Create Sales Challan
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="glass-panel" style={{ padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <input
            type="text"
            className="glass-input"
            placeholder="Search by challan number or customer business..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ paddingLeft: '2.5rem' }}
          />
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        <select
          className="glass-input"
          style={{ width: '180px' }}
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as ChallanStatus | ''); setPage(1); }}
        >
          <option value="">All Challan Statuses</option>
          <option value="DRAFT">DRAFT</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-panel">
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Challan Number</th>
                <th>Customer / Business</th>
                <th>Total Items Qty</th>
                <th>Status</th>
                <th>Created By</th>
                <th>Date Created</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    Loading sales challans...
                  </td>
                </tr>
              ) : challans.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No delivery challans found.
                  </td>
                </tr>
              ) : (
                challans.map((ch) => (
                  <tr key={ch.id}>
                    <td>
                      <span style={{ fontWeight: 800, color: 'var(--accent-primary)', fontSize: '0.9375rem' }}>
                        {ch.challanNumber}
                      </span>
                    </td>
                    <td>
                      <div>
                        <p style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{ch.customer?.businessName}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ch.customer?.customerName}</p>
                      </div>
                    </td>
                    <td style={{ fontWeight: 700 }}>{ch.totalQuantity} units</td>
                    <td><StatusBadge status={ch.status} /></td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {ch.createdBy?.name || 'Sales Rep'}
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(ch.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.375rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => navigate(`/challans/${ch.id}`)}
                          title="View challan items & snapshot details"
                        >
                          <Eye size={15} />
                        </button>
                        {canCreate && ch.status === 'DRAFT' && (
                          <>
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => setConfirmingChallan(ch)}
                              title="Confirm Challan & Reduce Inventory"
                            >
                              <CheckCircle2 size={15} /> Confirm
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => setCancellingChallan(ch)}
                              title="Cancel draft challan"
                            >
                              <XCircle size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination meta={pagination} onPageChange={(p) => setPage(p)} />
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!confirmingChallan}
        onClose={() => setConfirmingChallan(null)}
        onConfirm={handleConfirmSubmit}
        title="Confirm Sales Delivery Challan"
        message={`Confirming challan ${confirmingChallan?.challanNumber} will automatically deduct stock for all items in the inventory. Are you sure you want to proceed?`}
        confirmText="Confirm & Deduct Stock"
        loading={actionLoading}
        type="warning"
      />

      {/* Cancel Dialog */}
      <ConfirmDialog
        isOpen={!!cancellingChallan}
        onClose={() => setCancellingChallan(null)}
        onConfirm={handleCancelSubmit}
        title="Cancel Draft Challan"
        message={`Are you sure you want to cancel draft challan ${cancellingChallan?.challanNumber}?`}
        confirmText="Cancel Challan"
        loading={actionLoading}
        type="danger"
      />
    </div>
  );
};
