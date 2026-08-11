export type Role = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
}

export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
export type CustomerStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE';

export interface Customer {
  id: string;
  customerName: string;
  mobileNumber: string;
  email?: string | null;
  businessName: string;
  gstNumber?: string | null;
  customerType: CustomerType;
  address: string;
  status: CustomerStatus;
  followUpDate?: string | null;
  notes?: string | null;
  createdById?: string;
  createdBy?: { id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
  _count?: { followUps: number; challans: number };
  followUps?: CustomerFollowup[];
  challans?: { id: string; challanNumber: string; totalQuantity: number; status: ChallanStatus; createdAt: string }[];
}

export interface CustomerFollowup {
  id: string;
  customerId: string;
  note: string;
  followUpDate: string;
  createdById: string;
  createdBy?: { id: string; name: string; email?: string };
  createdAt: string;
}

export interface Product {
  id: string;
  productName: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minimumStockAlertQuantity: number;
  warehouseLocation: string;
  createdAt: string;
  updatedAt: string;
}

export type MovementType = 'IN' | 'OUT';

export interface StockMovement {
  id: string;
  productId: string;
  product?: { id: string; productName: string; sku: string; currentStock: number };
  quantityChanged: number;
  movementType: MovementType;
  reason: string;
  createdById: string;
  createdBy?: { id: string; name: string; email?: string };
  createdAt: string;
}

export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export interface ChallanItem {
  id?: string;
  challanId?: string;
  productId: string;
  productNameSnapshot: string;
  skuSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  totalPrice: number;
  product?: { id: string; currentStock: number; warehouseLocation?: string };
}

export interface Challan {
  id: string;
  challanNumber: string;
  customerId: string;
  customer?: Customer;
  totalQuantity: number;
  status: ChallanStatus;
  createdById: string;
  createdBy?: { id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
  items: ChallanItem[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
  pagination?: PaginationMeta;
}

export interface DashboardStats {
  kpi: {
    totalCustomers: number;
    activeCustomers: number;
    totalProducts: number;
    lowStockProductsCount: number;
    totalChallans: number;
    confirmedChallans: number;
    draftChallans: number;
  };
  lowStockAlerts: Product[];
  recentActivity: {
    customers: { id: string; customerName: string; businessName: string; status: CustomerStatus; createdAt: string }[];
    movements: StockMovement[];
    challans: { id: string; challanNumber: string; customer: { customerName: string; businessName: string }; totalQuantity: number; status: ChallanStatus; createdAt: string }[];
  };
}
