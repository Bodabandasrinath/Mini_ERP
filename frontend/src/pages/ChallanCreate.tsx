import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { challanService } from '../services/challan.service';
import { customerService } from '../services/customer.service';
import { productService } from '../services/product.service';
import { Customer, Product } from '../types';
import { useToast } from '../components/Toast';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ArrowLeft, Plus, Trash2, CheckCircle2, Save, ShoppingCart, User, AlertCircle } from 'lucide-react';

interface SelectedItem {
  productId: string;
  quantity: number;
}

export const ChallanCreate: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [items, setItems] = useState<SelectedItem[]>([{ productId: '', quantity: 1 }]);
  
  const [submitting, setSubmitting] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const [custRes, prodRes] = await Promise.all([
        customerService.getCustomers({ limit: 100 }),
        productService.getProducts({ limit: 100 }),
      ]);
      setCustomers(custRes.data || []);
      setProducts(prodRes.data || []);
    } catch (err) {
      showToast('Failed to load customers and products list', 'error');
    }
  };

  const productMap = new Map(products.map((p) => [p.id, p]));

  const handleAddItem = () => {
    setItems([...items, { productId: '', quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof SelectedItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  // Grand Total Calculations
  const calculatedItems = items.map((item) => {
    const prod = productMap.get(item.productId);
    const unitPrice = prod ? prod.unitPrice : 0;
    const totalPrice = unitPrice * (item.quantity || 0);
    return { ...item, prod, unitPrice, totalPrice };
  });

  const grandTotalQuantity = calculatedItems.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
  const grandTotalPrice = calculatedItems.reduce((acc, curr) => acc + curr.totalPrice, 0);

  const handleSaveDraft = async () => {
    if (!selectedCustomerId) {
      showToast('Please select a customer for the challan', 'error');
      return;
    }

    const validItems = items.filter((i) => i.productId && i.quantity > 0);
    if (validItems.length === 0) {
      showToast('Please select at least one valid product', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const created = await challanService.createChallan({
        customerId: selectedCustomerId,
        items: validItems,
      });
      showToast(`Challan ${created.challanNumber} created as DRAFT`, 'success');
      navigate('/challans');
    } catch (err: any) {
      showToast(err.message || 'Failed to create draft challan', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmAndDeduct = async () => {
    if (!selectedCustomerId) {
      showToast('Please select a customer for the challan', 'error');
      return;
    }

    const validItems = items.filter((i) => i.productId && i.quantity > 0);
    if (validItems.length === 0) {
      showToast('Please select at least one valid product', 'error');
      return;
    }

    // Front-end stock check
    for (const item of validItems) {
      const prod = productMap.get(item.productId);
      if (prod && item.quantity > prod.currentStock) {
        showToast(
          `Insufficient stock for ${prod.productName}. Available: ${prod.currentStock}, Requested: ${item.quantity}`,
          'error'
        );
        setIsConfirmModalOpen(false);
        return;
      }
    }

    try {
      setSubmitting(true);
      const created = await challanService.createChallan({
        customerId: selectedCustomerId,
        items: validItems,
      });
      
      // Confirm the newly created challan inside transaction
      await challanService.confirmChallan(created.id);
      showToast(`Challan ${created.challanNumber} confirmed & stock deducted!`, 'success');
      setIsConfirmModalOpen(false);
      navigate('/challans');
    } catch (err: any) {
      showToast(err.message || 'Failed to confirm challan', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Back Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/challans')}>
          <ArrowLeft size={16} /> Back to Challans
        </button>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Create Sales Delivery Challan
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Select customer, add line items with product snapshots & calculate totals
          </p>
        </div>
      </div>

      {/* Main Grid Form */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Left Column: Form Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Step 1: Select Customer */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} color="var(--accent-primary)" /> Step 1: Select Customer / Business
            </h3>
            <select
              className="glass-input"
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              required
            >
              <option value="">-- Choose Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.businessName} ({c.customerName}) - [{c.customerType}]
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Add Products */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShoppingCart size={18} color="var(--accent-secondary)" /> Step 2: Add Products & Quantities
              </h3>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddItem}>
                <Plus size={16} /> Add Product Line
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {items.map((item, idx) => {
                const prod = productMap.get(item.productId);
                const isInsufficient = prod && item.quantity > prod.currentStock;

                return (
                  <div
                    key={idx}
                    style={{
                      padding: '0.875rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(255,255,255,0.02)',
                      border: isInsufficient ? '1px solid var(--status-danger)' : '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ flex: 2 }}>
                      <label style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Product</label>
                      <select
                        className="glass-input"
                        value={item.productId}
                        onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                        required
                      >
                        <option value="">-- Select Product --</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.productName} ({p.sku}) | Stock: {p.currentStock} | Price: ₹{p.unitPrice}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Quantity</label>
                      <input
                        type="number"
                        min="1"
                        className="glass-input"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value, 10) || 1)}
                        required
                      />
                    </div>

                    <div style={{ flex: 1, textAlign: 'right' }}>
                      <label style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Unit Price</label>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem', paddingTop: '0.375rem' }}>
                        ₹{prod ? prod.unitPrice.toLocaleString('en-IN') : '0'}
                      </p>
                    </div>

                    <div style={{ flex: 1, textAlign: 'right' }}>
                      <label style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Total Price</label>
                      <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--accent-secondary)', paddingTop: '0.375rem' }}>
                        ₹{((prod?.unitPrice || 0) * (item.quantity || 0)).toLocaleString('en-IN')}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleRemoveItem(idx)}
                      disabled={items.length === 1}
                      style={{ marginTop: '1.25rem' }}
                    >
                      <Trash2 size={16} color="var(--status-danger)" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              Challan Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total Product Lines:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{items.length}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total Quantity:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{grandTotalQuantity} units</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Grand Total Valuation:</span>
                <strong style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-secondary)' }}>
                  ₹{grandTotalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </strong>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                className="btn btn-secondary"
                onClick={handleSaveDraft}
                disabled={submitting}
                style={{ width: '100%' }}
              >
                <Save size={18} /> Save as DRAFT
              </button>

              <button
                className="btn btn-success"
                onClick={() => setIsConfirmModalOpen(true)}
                disabled={submitting}
                style={{ width: '100%' }}
              >
                <CheckCircle2 size={18} /> Confirm & Deduct Stock
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmAndDeduct}
        title="Confirm Challan & Deduct Inventory"
        message="Confirming this sales challan will reduce product stock for all line items. Continue?"
        confirmText="Confirm & Deduct Stock"
        loading={submitting}
        type="warning"
      />
    </div>
  );
};
