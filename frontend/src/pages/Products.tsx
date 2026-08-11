import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { productService } from '../services/product.service';
import { Product, PaginationMeta } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Pagination } from '../components/Pagination';
import { Modal } from '../components/Modal';
import { Search, Plus, Eye, Edit2, AlertTriangle, Package, DollarSign, Warehouse } from 'lucide-react';

export const Products: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialLowStock = searchParams.get('lowStock') === 'true';

  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>();
  const [loading, setLoading] = useState(true);

  // Filter & Search State
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(initialLowStock);
  const [page, setPage] = useState(1);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    productName: '',
    sku: '',
    category: '',
    unitPrice: 0,
    currentStock: 0,
    minimumStockAlertQuantity: 5,
    warehouseLocation: '',
  });

  const { hasRole } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const canEdit = hasRole('ADMIN', 'WAREHOUSE');

  useEffect(() => {
    fetchProducts();
  }, [page, search, categoryFilter, lowStockOnly]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productService.getProducts({
        page,
        limit: 8,
        search,
        category: categoryFilter,
        lowStock: lowStockOnly,
      });
      setProducts(res.data || []);
      setPagination(res.pagination);
    } catch (err: any) {
      showToast(err.message || 'Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      productName: '',
      sku: '',
      category: '',
      unitPrice: 0,
      currentStock: 0,
      minimumStockAlertQuantity: 5,
      warehouseLocation: '',
    });
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      productName: p.productName,
      sku: p.sku,
      category: p.category,
      unitPrice: p.unitPrice,
      currentStock: p.currentStock,
      minimumStockAlertQuantity: p.minimumStockAlertQuantity,
      warehouseLocation: p.warehouseLocation,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, formData);
        showToast('Product updated successfully', 'success');
      } else {
        await productService.createProduct(formData);
        showToast('Product added to catalog successfully', 'success');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      showToast(err.message || 'Operation failed', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Product Catalog & Inventory
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            SKU management, unit pricing, warehouse locations & alert thresholds
          </p>
        </div>
        {canEdit && (
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={18} /> Add New Product
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel" style={{ padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <input
            type="text"
            className="glass-input"
            placeholder="Search by product name, SKU, or category..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ paddingLeft: '2.5rem' }}
          />
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        <button
          className={`btn ${lowStockOnly ? 'btn-danger' : 'btn-secondary'}`}
          onClick={() => { setLowStockOnly(!lowStockOnly); setPage(1); }}
          style={{ gap: '0.5rem' }}
        >
          <AlertTriangle size={16} /> {lowStockOnly ? 'Showing Low Stock Only' : 'Filter Low Stock'}
        </button>
      </div>

      {/* Products Table */}
      <div className="glass-panel">
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Product / SKU</th>
                <th>Category</th>
                <th>Unit Price (₹)</th>
                <th>Current Stock</th>
                <th>Min Alert Qty</th>
                <th>Warehouse Location</th>
                <th>Stock Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    Loading product catalog...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No products found matching filters.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const isLow = p.currentStock <= p.minimumStockAlertQuantity;
                  return (
                    <tr
                      key={p.id}
                      style={{
                        background: isLow ? 'rgba(239, 68, 68, 0.05)' : undefined,
                      }}
                    >
                      <td>
                        <div>
                          <p style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{p.productName}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)', fontWeight: 600 }}>
                            <code>{p.sku}</code>
                          </p>
                        </div>
                      </td>
                      <td>{p.category}</td>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        ₹{p.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ fontWeight: 800, fontSize: '1rem', color: isLow ? 'var(--status-danger)' : 'var(--text-primary)' }}>
                        {p.currentStock}
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{p.minimumStockAlertQuantity}</td>
                      <td>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Warehouse size={14} color="var(--accent-primary)" /> {p.warehouseLocation}
                        </span>
                      </td>
                      <td>
                        {isLow ? (
                          <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <AlertTriangle size={12} /> LOW STOCK
                          </span>
                        ) : (
                          <span className="badge badge-success">IN STOCK</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.375rem' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => navigate(`/products/${p.id}`)}
                            title="View product stock movement history"
                          >
                            <Eye size={15} />
                          </button>
                          {canEdit && (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleOpenEdit(p)}
                              title="Edit product details"
                            >
                              <Edit2 size={15} color="var(--accent-primary)" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination meta={pagination} onPageChange={(pg) => setPage(pg)} />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Product Name *</label>
              <input
                type="text"
                className="glass-input"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>SKU Code *</label>
              <input
                type="text"
                className="glass-input"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="PRD-ITEM-001"
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Category *</label>
              <input
                type="text"
                className="glass-input"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. Hardware & Fasteners"
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Unit Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="glass-input"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Current Stock</label>
              <input
                type="number"
                min="0"
                className="glass-input"
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value, 10) || 0 })}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Min Alert Threshold</label>
              <input
                type="number"
                min="0"
                className="glass-input"
                value={formData.minimumStockAlertQuantity}
                onChange={(e) => setFormData({ ...formData, minimumStockAlertQuantity: parseInt(e.target.value, 10) || 0 })}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Warehouse Bay *</label>
              <input
                type="text"
                className="glass-input"
                value={formData.warehouseLocation}
                onChange={(e) => setFormData({ ...formData, warehouseLocation: e.target.value })}
                placeholder="Bay A-01"
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingProduct ? 'Save Changes' : 'Add to Catalog'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
