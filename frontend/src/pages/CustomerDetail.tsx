import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { customerService } from '../services/customer.service';
import { Customer, CustomerFollowup } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { StatusBadge } from '../components/StatusBadge';
import { ArrowLeft, Building2, Phone, Mail, MapPin, Calendar, Clock, Plus, FileText } from 'lucide-react';

export const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  // Follow-up form state
  const [newNote, setNewNote] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  const { hasRole } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const canAddFollowup = hasRole('ADMIN', 'SALES');

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const data = await customerService.getCustomerById(id!);
      setCustomer(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load customer details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote || !nextFollowUpDate) {
      showToast('Please enter a note and next follow-up date', 'error');
      return;
    }

    try {
      setSubmittingNote(true);
      await customerService.createFollowup(id!, newNote, nextFollowUpDate);
      showToast('Follow-up recorded successfully', 'success');
      setNewNote('');
      setNextFollowUpDate('');
      fetchDetail();
    } catch (err: any) {
      showToast(err.message || 'Failed to record follow-up', 'error');
    } finally {
      setSubmittingNote(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading customer timeline...</div>;
  }

  if (!customer) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Back Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/customers')}>
          <ArrowLeft size={16} /> Back to Customers
        </button>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {customer.businessName}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Account Contact: {customer.customerName}
          </p>
        </div>
      </div>

      {/* Grid: Left Customer Card / Right Followups & Challans */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        {/* Left Column: Info Card */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <StatusBadge status={customer.customerType} />
            <StatusBadge status={customer.status} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', fontSize: '0.875rem' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Business / Firm</p>
              <p style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                <Building2 size={16} color="var(--accent-primary)" /> {customer.businessName}
              </p>
            </div>

            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Mobile Number</p>
              <p style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                <Phone size={16} color="var(--status-success)" /> {customer.mobileNumber}
              </p>
            </div>

            {customer.email && (
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Email Address</p>
                <p style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <Mail size={16} color="var(--accent-secondary)" /> {customer.email}
                </p>
              </div>
            )}

            {customer.gstNumber && (
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>GSTIN</p>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  <code>{customer.gstNumber}</code>
                </p>
              </div>
            )}

            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Address</p>
              <p style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginTop: '0.25rem' }}>
                <MapPin size={16} color="var(--status-danger)" style={{ marginTop: '2px', flexShrink: 0 }} /> {customer.address}
              </p>
            </div>

            {customer.followUpDate && (
              <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 700 }}>Scheduled Follow-up</p>
                <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Calendar size={15} /> {new Date(customer.followUpDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Followup CRM Timeline & Challan History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Add Followup Card */}
          {canAddFollowup && (
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={18} color="var(--accent-primary)" /> Record CRM Follow-up Note
              </h3>
              <form onSubmit={handleAddFollowup} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <textarea
                  className="glass-input"
                  rows={2}
                  placeholder="Enter details of conversation, requirements, or next steps..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  required
                />
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Next Follow-up Date:</label>
                    <input
                      type="date"
                      className="glass-input"
                      style={{ width: 'auto' }}
                      value={nextFollowUpDate}
                      onChange={(e) => setNextFollowUpDate(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={submittingNote}>
                    {submittingNote ? 'Saving...' : 'Post Follow-up Note'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Follow-up Timeline */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="var(--accent-secondary)" /> Follow-up History ({customer.followUps?.length || 0})
            </h3>
            {customer.followUps && customer.followUps.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {customer.followUps.map((f: CustomerFollowup) => (
                  <div
                    key={f.id}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(255,255,255,0.02)',
                      borderLeft: '3px solid var(--accent-secondary)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        Logged by {f.createdBy?.name || 'Sales Staff'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)', fontWeight: 600 }}>
                        Scheduled: {new Date(f.followUpDate).toLocaleDateString()}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>{f.note}</p>
                    <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                      Created at: {new Date(f.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No previous follow-up notes recorded.</p>
            )}
          </div>

          {/* Customer Sales Challans */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} color="var(--status-warning)" /> Associated Sales Challans ({customer.challans?.length || 0})
            </h3>
            {customer.challans && customer.challans.length > 0 ? (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Challan #</th>
                      <th>Total Quantity</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.challans.map((ch) => (
                      <tr key={ch.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/challans/${ch.id}`)}>
                        <td style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{ch.challanNumber}</td>
                        <td>{ch.totalQuantity} items</td>
                        <td><StatusBadge status={ch.status} /></td>
                        <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(ch.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No sales challans generated yet for this customer.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
