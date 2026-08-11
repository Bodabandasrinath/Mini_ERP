import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { challanService } from '../services/challan.service';
import { Challan } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ArrowLeft, CheckCircle2, XCircle, Building2, User, Phone, MapPin, Printer } from 'lucide-react';

export const ChallanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [challan, setChallan] = useState<Challan | null>(null);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { hasRole } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const canManage = hasRole('ADMIN', 'SALES');

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const data = await challanService.getChallanById(id!);
      setChallan(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load sales challan details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      await challanService.confirmChallan(id!);
      showToast(`Challan ${challan?.challanNumber} confirmed & stock deducted!`, 'success');
      setIsConfirmModalOpen(false);
      fetchDetail();
    } catch (err: any) {
      showToast(err.message || 'Confirmation failed due to stock availability', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    try {
      setSubmitting(true);
      await challanService.cancelChallan(id!);
      showToast(`Challan ${challan?.challanNumber} cancelled`, 'info');
      setIsCancelModalOpen(false);
      fetchDetail();
    } catch (err: any) {
      showToast(err.message || 'Cancellation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading sales challan details...</div>;
  }

  if (!challan) return null;

  const grandTotal = challan.items.reduce((acc, curr) => acc + curr.totalPrice, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/challans')}>
            <ArrowLeft size={16} /> Back to Challans
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                {challan.challanNumber}
              </h1>
              <StatusBadge status={challan.status} />
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.125rem' }}>
              Created on {new Date(challan.createdAt).toLocaleString()} by {challan.createdBy?.name || 'Staff'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
            <Printer size={16} /> Print Challan
          </button>
          {canManage && challan.status === 'DRAFT' && (
            <>
              <button className="btn btn-success btn-sm" onClick={() => setIsConfirmModalOpen(true)}>
                <CheckCircle2 size={16} /> Confirm & Deduct Stock
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => setIsCancelModalOpen(true)}>
                <XCircle size={16} /> Cancel Challan
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Printable / Formal Document Card */}
      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Document Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              DELIVERY CHALLAN
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Wholesale & Distribution Operations</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{challan.challanNumber}</p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Status: <strong style={{ color: 'var(--text-primary)' }}>{challan.status}</strong>
            </p>
          </div>
        </div>

        {/* Customer Information Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Delivered To (Customer / Firm)
            </p>
            <p style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={18} color="var(--accent-primary)" /> {challan.customer?.businessName}
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <User size={15} color="var(--text-muted)" /> Attn: {challan.customer?.customerName}
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Phone size={15} color="var(--status-success)" /> Phone: {challan.customer?.mobileNumber}
            </p>
          </div>

          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Delivery Destination Address
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <MapPin size={18} color="var(--status-danger)" style={{ marginTop: '2px', flexShrink: 0 }} /> {challan.customer?.address}
            </p>
            {challan.customer?.gstNumber && (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                GSTIN: <code>{challan.customer.gstNumber}</code>
              </p>
            )}
          </div>
        </div>

        {/* Challan Items Table (Displaying Snapshots) */}
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            Snapshot Items Breakdown
          </h3>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product Name (Snapshot)</th>
                  <th>SKU (Snapshot)</th>
                  <th>Unit Price (Snapshot)</th>
                  <th>Quantity</th>
                  <th style={{ textAlign: 'right' }}>Line Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                {challan.items.map((item, index) => (
                  <tr key={item.id || index}>
                    <td>{index + 1}</td>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.productNameSnapshot}</td>
                    <td><code style={{ color: 'var(--accent-secondary)' }}>{item.skuSnapshot}</code></td>
                    <td>₹{item.unitPriceSnapshot.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td style={{ fontWeight: 700 }}>{item.quantity} units</td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--text-primary)' }}>
                      ₹{item.totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Summary */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
          <div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Total Items Quantity:</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {challan.totalQuantity} units
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Total Valuation Sum:</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-secondary)' }}>
              ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirm}
        title="Confirm Challan & Reduce Inventory"
        message="Confirming this sales delivery challan will reduce stock levels. Continue?"
        confirmText="Confirm & Deduct Stock"
        loading={submitting}
        type="warning"
      />

      {/* Cancel Dialog */}
      <ConfirmDialog
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancel}
        title="Cancel Challan"
        message="Are you sure you want to cancel this draft challan?"
        confirmText="Cancel Challan"
        loading={submitting}
        type="danger"
      />
    </div>
  );
};
