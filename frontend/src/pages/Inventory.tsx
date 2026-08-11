import React, { useState, useEffect } from 'react';
import { stockService } from '../services/stock.service';
import { productService } from '../services/product.service';
import { StockMovement, Product, MovementType, PaginationMeta } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { StatusBadge } from '../components/StatusBadge';
import { Pagination } from '../components/Pagination';
import { Modal } from '../components/Modal';
import { Boxes, PlusCircle, MinusCircle, ArrowDownRight, ArrowUpRight, Warehouse, AlertCircle } from 'lucide-react';

export const Inventory: React.FC = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>();
  const [loading, setLoading] = useState(true);

  // Filters
  const [productFilter, setProductFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<MovementType | ''>('');
  const [page, setPage] = useState(1);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    quantityChanged: 1,
    movementType: 'IN' as MovementType,
    reason: '',
  });

  const { hasRole } = useAuth();
  const { showToast } = useToast();

  const canManageStock = hasRole('ADMIN', 'WAREHOUSE');

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchMovements();
  }, [page, productFilter, typeFilter]);

  const fetchProducts = async () => {
    try {
      const res = await productService.getProducts({ limit: 100 });
      setProducts(res.data || []);
    } catch (err) {
      console.error('Failed to load products dropdown', err);
    }
  };

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const res = await stockService.getStockMovements({
        page,
        limit: 8,
        productId: productFilter,
        movementType: typeFilter || undefined,
      });
      setMovements(res.data || []);
      setPagination(res.pagination);
    } catch (err: any) {
      showToast(err.message || 'Failed to load stock movements', 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = products.find((p) => p.id === formData.productId);

  const handleSaveMovement = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.productId) {
      showToast('Please select a product', 'error');
      return;
    }

    if (formData.movementType === 'OUT' && selectedProduct) {
      if (formData.quantityChanged > selectedProduct.currentStock) {
        showToast(
          `Insufficient stock! Available stock is ${selectedProduct.currentStock}, cannot reduce by ${formData.quantityChanged}.`,
          'error'
        );
        return;
      }
    }

    try {
      await stockService.createStockMovement(formData);
      showToast('Stock movement recorded successfully', 'success');
      setIsModalOpen(false);
      fetchMovements();
      fetchProducts(); // Refresh stock counts
    } catch (err: any) {
      showToast(err.message || 'Failed to record stock movement', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Inventory & Stock Movements
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Real-time stock IN/OUT transactions and audit logs
          </p>
        </div>
        {canManageStock && (
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <PlusCircle size={18} /> Record Stock Movement
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="glass-panel" style={{ padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <select
          className="glass-input"
          style={{ flex: 1, minWidth: '220px' }}
          value={productFilter}
          onChange={(e) => { setProductFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Products</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.productName} ({p.sku}) - Stock: {p.currentStock}
            </option>
          ))}
        </select>

        <select
          className="glass-input"
          style={{ width: '160px' }}
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value as MovementType | ''); setPage(1); }}
        >
          <option value="">All Types (IN/OUT)</option>
          <option value="IN">IN Movements</option>
          <option value="OUT">OUT Movements</option>
        </select>
      </div>

      {/* Movements Table */}
      <div className="glass-panel">
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Product / SKU</th>
                <th>Quantity Changed</th>
                <th>Current Stock</th>
                <th>Reason / Reference</th>
                <th>Recorded By</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    Loading stock movements...
                  </td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No stock movements recorded for selected filter.
                  </td>
                </tr>
              ) : (
                movements.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <span
                        className={`badge ${m.movementType === 'IN' ? 'badge-success' : 'badge-danger'}`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        {m.movementType === 'IN' ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                        {m.movementType}
                      </span>
                    </td>
                    <td>
                      <div>
                        <p style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{m.product?.productName}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)' }}><code>{m.product?.sku}</code></p>
                      </div>
                    </td>
                    <td style={{ fontWeight: 800, fontSize: '1rem', color: m.movementType === 'IN' ? 'var(--status-success)' : 'var(--status-danger)' }}>
                      {m.movementType === 'IN' ? '+' : '-'}{m.quantityChanged}
                    </td>
                    <td style={{ fontWeight: 600 }}>{m.product?.currentStock}</td>
                    <td style={{ fontSize: '0.875rem' }}>{m.reason}</td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {m.createdBy?.name || 'Warehouse Staff'}
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(m.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination meta={pagination} onPageChange={(p) => setPage(p)} />
      </div>

      {/* Add Stock Movement Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Stock IN / OUT Movement"
      >
        <form onSubmit={handleSaveMovement} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              Select Product *
            </label>
            <select
              className="glass-input"
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              required
            >
              <option value="">-- Choose Product --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.productName} ({p.sku}) | Available Stock: {p.currentStock}
                </option>
              ))}
            </select>
          </div>

          {selectedProduct && (
            <div
              style={{
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                fontSize: '0.8125rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>Current Stock on Hand:</span>
              <strong style={{ fontSize: '1rem', color: 'var(--accent-secondary)' }}>
                {selectedProduct.currentStock} units
              </strong>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                Movement Type *
              </label>
              <select
                className="glass-input"
                value={formData.movementType}
                onChange={(e) => setFormData({ ...formData, movementType: e.target.value as MovementType })}
              >
                <option value="IN">Stock IN (Receive / Intake)</option>
                <option value="OUT">Stock OUT (Despatch / Adjustment)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                Quantity *
              </label>
              <input
                type="number"
                min="1"
                className="glass-input"
                value={formData.quantityChanged}
                onChange={(e) => setFormData({ ...formData, quantityChanged: parseInt(e.target.value, 10) || 1 })}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              Reason / PO or Reference # *
            </label>
            <input
              type="text"
              className="glass-input"
              placeholder="e.g. Purchase order PO-2026-09 or Damaged stock write-off"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Record Movement
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
