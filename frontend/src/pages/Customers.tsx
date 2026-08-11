import React, { useState, useEffect } from 'react';
import { customerService } from '../services/customer.service';
import { Customer, CustomerType, CustomerStatus, PaginationMeta } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { StatusBadge } from '../components/StatusBadge';
import { Pagination } from '../components/Pagination';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Search, Plus, Eye, Edit2, Trash2, Calendar, Phone, Mail, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>();
  const [loading, setLoading] = useState(true);
  
  // Filters & Search
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    mobileNumber: '',
    email: '',
    businessName: '',
    gstNumber: '',
    customerType: 'RETAIL' as CustomerType,
    address: '',
    status: 'LEAD' as CustomerStatus,
    notes: '',
  });

  const { hasRole } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const canEdit = hasRole('ADMIN', 'SALES');
  const canDelete = hasRole('ADMIN');

  useEffect(() => {
    fetchCustomers();
  }, [page, search, typeFilter, statusFilter]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await customerService.getCustomers({
        page,
        limit: 8,
        search,
        type: typeFilter,
        status: statusFilter,
      });
      setCustomers(res.data || []);
      setPagination(res.pagination);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch customers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      customerName: '',
      mobileNumber: '',
      email: '',
      businessName: '',
      gstNumber: '',
      customerType: 'RETAIL',
      address: '',
      status: 'LEAD',
      notes: '',
    });
    setEditingCustomer(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setFormData({
      customerName: c.customerName,
      mobileNumber: c.mobileNumber,
      email: c.email || '',
      businessName: c.businessName,
      gstNumber: c.gstNumber || '',
      customerType: c.customerType,
      address: c.address,
      status: c.status,
      notes: c.notes || '',
    });
    setIsAddModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await customerService.updateCustomer(editingCustomer.id, formData);
        showToast('Customer updated successfully', 'success');
      } else {
        await customerService.createCustomer(formData);
        showToast('Customer added successfully', 'success');
      }
      setIsAddModalOpen(false);
      fetchCustomers();
    } catch (err: any) {
      showToast(err.message || 'Operation failed', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingCustomer) return;
    try {
      await customerService.deleteCustomer(deletingCustomer.id);
      showToast('Customer deleted successfully', 'success');
      setDeletingCustomer(null);
      fetchCustomers();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete customer', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Customer CRM Portal
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Manage client accounts, follow-ups, and lead statuses
          </p>
        </div>
        {canEdit && (
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={18} /> Add New Customer
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel" style={{ padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <input
            type="text"
            className="glass-input"
            placeholder="Search by name, mobile, business, or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{ paddingLeft: '2.5rem' }}
          />
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        <select
          className="glass-input"
          style={{ width: '160px' }}
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Types</option>
          <option value="RETAIL">Retail</option>
          <option value="WHOLESALE">Wholesale</option>
          <option value="DISTRIBUTOR">Distributor</option>
        </select>

        <select
          className="glass-input"
          style={{ width: '160px' }}
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Statuses</option>
          <option value="LEAD">Lead</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {/* Customers Table */}
      <div className="glass-panel">
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Customer / Business</th>
                <th>Contact</th>
                <th>Type</th>
                <th>Status</th>
                <th>Follow-up Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    Loading customers data...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No customers found matching filters.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div>
                        <p style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{c.businessName}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{c.customerName}</p>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8125rem' }}>
                        <p style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Phone size={13} color="var(--text-muted)" /> {c.mobileNumber}
                        </p>
                        {c.email && (
                          <p style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)' }}>
                            <Mail size={13} /> {c.email}
                          </p>
                        )}
                      </div>
                    </td>
                    <td><StatusBadge status={c.customerType} /></td>
                    <td><StatusBadge status={c.status} /></td>
                    <td>
                      {c.followUpDate ? (
                        <span style={{ fontSize: '0.8125rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent-secondary)' }}>
                          <Calendar size={14} /> {new Date(c.followUpDate).toLocaleDateString()}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Not set</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.375rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => navigate(`/customers/${c.id}`)}
                          title="View customer details & follow-ups"
                        >
                          <Eye size={15} />
                        </button>
                        {canEdit && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenEdit(c)}
                            title="Edit customer details"
                          >
                            <Edit2 size={15} color="var(--accent-primary)" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setDeletingCustomer(c)}
                            title="Delete customer"
                          >
                            <Trash2 size={15} color="var(--status-danger)" />
                          </button>
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

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Customer Name *</label>
              <input
                type="text"
                className="glass-input"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Business Name *</label>
              <input
                type="text"
                className="glass-input"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Mobile Number *</label>
              <input
                type="text"
                className="glass-input"
                value={formData.mobileNumber}
                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Email</label>
              <input
                type="email"
                className="glass-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Customer Type</label>
              <select
                className="glass-input"
                value={formData.customerType}
                onChange={(e) => setFormData({ ...formData, customerType: e.target.value as CustomerType })}
              >
                <option value="RETAIL">Retail</option>
                <option value="WHOLESALE">Wholesale</option>
                <option value="DISTRIBUTOR">Distributor</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Status</label>
              <select
                className="glass-input"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as CustomerStatus })}
              >
                <option value="LEAD">Lead</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>GST Number</label>
              <input
                type="text"
                className="glass-input"
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                placeholder="27AAAAA0000A1Z5"
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Address *</label>
            <textarea
              className="glass-input"
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Notes</label>
            <textarea
              className="glass-input"
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingCustomer ? 'Save Changes' : 'Create Customer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deletingCustomer}
        onClose={() => setDeletingCustomer(null)}
        onConfirm={handleDelete}
        title="Delete Customer"
        message={`Are you sure you want to delete customer '${deletingCustomer?.businessName}'? This action cannot be undone.`}
        confirmText="Delete Customer"
        type="danger"
      />
    </div>
  );
};
