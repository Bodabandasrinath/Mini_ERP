import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../services/product.service';
import { Product, StockMovement } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { useToast } from '../components/Toast';
import { ArrowLeft, Package, Warehouse, Tag, DollarSign, Boxes, AlertTriangle, Clock } from 'lucide-react';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<(Product & { stockMovements?: StockMovement[] }) | null>(null);
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const data = await productService.getProductById(id!);
      setProduct(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load product details', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading product details...</div>;
  }

  if (!product) return null;

  const isLowStock = product.currentStock <= product.minimumStockAlertQuantity;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Back Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/products')}>
          <ArrowLeft size={16} /> Back to Catalog
        </button>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {product.productName}
          </h1>
          <p style={{ color: 'var(--accent-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>
            <code>{product.sku}</code>
          </p>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        {/* Left Column: Product Summary */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{product.category}</span>
            {isLowStock ? (
              <span className="badge badge-danger"><AlertTriangle size={12} /> LOW STOCK</span>
            ) : (
              <span className="badge badge-success">IN STOCK</span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Current Stock Count</p>
              <p style={{ fontSize: '2rem', fontWeight: 800, color: isLowStock ? 'var(--status-danger)' : 'var(--status-success)', marginTop: '0.25rem' }}>
                {product.currentStock} <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>units</span>
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                Minimum alert threshold: {product.minimumStockAlertQuantity} units
              </p>
            </div>

            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Unit Price</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                ₹{product.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Warehouse Location</p>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Warehouse size={16} color="var(--accent-primary)" /> {product.warehouseLocation}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Stock Movement History */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Boxes size={18} color="var(--accent-secondary)" /> Stock Movement History ({product.stockMovements?.length || 0})
          </h3>

          {product.stockMovements && product.stockMovements.length > 0 ? (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Qty Changed</th>
                    <th>Reason / Reference</th>
                    <th>Recorded By</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {product.stockMovements.map((mov) => (
                    <tr key={mov.id}>
                      <td><StatusBadge status={mov.movementType} /></td>
                      <td style={{ fontWeight: 800, color: mov.movementType === 'IN' ? 'var(--status-success)' : 'var(--status-danger)' }}>
                        {mov.movementType === 'IN' ? '+' : '-'}{mov.quantityChanged}
                      </td>
                      <td style={{ fontSize: '0.875rem' }}>{mov.reason}</td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        {mov.createdBy?.name || 'Staff'}
                      </td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(mov.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No stock movements recorded yet for this product.</p>
          )}
        </div>
      </div>
    </div>
  );
};
