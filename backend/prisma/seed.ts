import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const Role = {
  ADMIN: 'ADMIN',
  SALES: 'SALES',
  WAREHOUSE: 'WAREHOUSE',
  ACCOUNTS: 'ACCOUNTS',
};

const CustomerType = {
  RETAIL: 'RETAIL',
  WHOLESALE: 'WHOLESALE',
  DISTRIBUTOR: 'DISTRIBUTOR',
};

const CustomerStatus = {
  LEAD: 'LEAD',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};

const MovementType = {
  IN: 'IN',
  OUT: 'OUT',
};

const ChallanStatus = {
  DRAFT: 'DRAFT',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
};

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Clean existing data
  await prisma.challanItem.deleteMany();
  await prisma.challan.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.customerFollowup.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned up existing database tables.');

  // 2. Create Users
  const salt = await bcrypt.genSalt(10);
  
  const adminPassword = await bcrypt.hash('Admin@123', salt);
  const salesPassword = await bcrypt.hash('Sales@123', salt);
  const warehousePassword = await bcrypt.hash('Warehouse@123', salt);
  const accountsPassword = await bcrypt.hash('Accounts@123', salt);

  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@example.com',
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
  });

  const salesUser = await prisma.user.create({
    data: {
      name: 'John Sales Manager',
      email: 'sales@example.com',
      passwordHash: salesPassword,
      role: Role.SALES,
    },
  });

  const warehouseUser = await prisma.user.create({
    data: {
      name: 'Dave Warehouse Supervisor',
      email: 'warehouse@example.com',
      passwordHash: warehousePassword,
      role: Role.WAREHOUSE,
    },
  });

  const accountsUser = await prisma.user.create({
    data: {
      name: 'Sarah Accounts Specialist',
      email: 'accounts@example.com',
      passwordHash: accountsPassword,
      role: Role.ACCOUNTS,
    },
  });

  console.log('👤 Created default system users (Admin, Sales, Warehouse, Accounts).');

  // 3. Create Sample Customers
  const customer1 = await prisma.customer.create({
    data: {
      customerName: 'Rajesh Kumar',
      mobileNumber: '+919876543210',
      email: 'rajesh@apexindustrial.com',
      businessName: 'Apex Industrial Supplies',
      gstNumber: '27AAAAA0000A1Z5',
      customerType: CustomerType.DISTRIBUTOR,
      address: 'Plot 42, MIDC Industrial Area, Pune, MH 411026',
      status: CustomerStatus.ACTIVE,
      followUpDate: new Date(Date.now() + 86400000 * 3), // 3 days later
      notes: 'Key distributor for West region. Prefers bulk shipments.',
      createdById: salesUser.id,
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      customerName: 'Anita Sharma',
      mobileNumber: '+919812345678',
      email: 'anita@metrotools.co.in',
      businessName: 'Metro Hardware & Tools',
      gstNumber: '27BBBBB1111B2Z8',
      customerType: CustomerType.WHOLESALE,
      address: '104 Trade Center, MG Road, Mumbai, MH 400001',
      status: CustomerStatus.ACTIVE,
      followUpDate: new Date(Date.now() + 86400000 * 5),
      notes: 'Interested in annual supply contract for fast-moving items.',
      createdById: salesUser.id,
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      customerName: 'Vikas Patel',
      mobileNumber: '+919700011122',
      email: 'vikas@starretailers.com',
      businessName: 'Star Local Mart',
      gstNumber: '24CCCCC2222C3Z1',
      customerType: CustomerType.RETAIL,
      address: 'Shop 12, Sunrise Complex, Ahmedabad, GJ 380015',
      status: CustomerStatus.LEAD,
      followUpDate: new Date(Date.now() + 86400000 * 1), // tomorrow
      notes: 'Requested product catalog and bulk discount quote.',
      createdById: salesUser.id,
    },
  });

  console.log('🏢 Created sample customers.');

  // 4. Create Follow-up Records
  await prisma.customerFollowup.createMany({
    data: [
      {
        customerId: customer1.id,
        note: 'Discussed Q3 inventory requirement. Customer requested price quote for 500 bolts.',
        followUpDate: new Date(Date.now() - 86400000 * 2),
        createdById: salesUser.id,
      },
      {
        customerId: customer1.id,
        note: 'Sent formal quotation via email. Waiting for purchase order confirmation.',
        followUpDate: new Date(Date.now() - 86400000 * 1),
        createdById: salesUser.id,
      },
      {
        customerId: customer2.id,
        note: 'Initial phone discussion. Scheduled meeting for next week.',
        followUpDate: new Date(Date.now() - 86400000 * 4),
        createdById: salesUser.id,
      },
    ],
  });

  console.log('📝 Created sample customer follow-up notes.');

  // 5. Create Products & Initial Stock
  const p1 = await prisma.product.create({
    data: {
      productName: 'Heavy Duty Stainless Steel Bolt M12',
      sku: 'PRD-BOLT-M12',
      category: 'Hardware & Fasteners',
      unitPrice: 45.0,
      currentStock: 500,
      minimumStockAlertQuantity: 50,
      warehouseLocation: 'Bay A-12',
    },
  });

  const p2 = await prisma.product.create({
    data: {
      productName: 'Industrial Grade Roller Bearing 6204',
      sku: 'PRD-BRG-6204',
      category: 'Bearings & Power Transmission',
      unitPrice: 320.0,
      currentStock: 120,
      minimumStockAlertQuantity: 20,
      warehouseLocation: 'Bay B-04',
    },
  });

  const p3 = await prisma.product.create({
    data: {
      productName: 'High Pressure Hydraulic Hose 1/2 Inch',
      sku: 'PRD-HYD-H12',
      category: 'Hydraulics & Fluid Power',
      unitPrice: 850.0,
      currentStock: 8, // Low stock!
      minimumStockAlertQuantity: 15,
      warehouseLocation: 'Bay C-09',
    },
  });

  const p4 = await prisma.product.create({
    data: {
      productName: 'Synthetic Industrial Lubricant Oil 5L',
      sku: 'PRD-LUB-5L',
      category: 'Chemicals & Lubricants',
      unitPrice: 1450.0,
      currentStock: 60,
      minimumStockAlertQuantity: 10,
      warehouseLocation: 'Rack D-01',
    },
  });

  const p5 = await prisma.product.create({
    data: {
      productName: 'Pneumatic Control Valve 5/2 Way',
      sku: 'PRD-PNEU-V52',
      category: 'Pneumatics',
      unitPrice: 1200.0,
      currentStock: 4, // Low stock!
      minimumStockAlertQuantity: 10,
      warehouseLocation: 'Rack E-03',
    },
  });

  console.log('📦 Created sample product catalog.');

  // 6. Record Initial Stock Movement Records (IN)
  await prisma.stockMovement.createMany({
    data: [
      {
        productId: p1.id,
        quantityChanged: 500,
        movementType: MovementType.IN,
        reason: 'Initial warehouse shipment intake (PO-2026-001)',
        createdById: warehouseUser.id,
      },
      {
        productId: p2.id,
        quantityChanged: 120,
        movementType: MovementType.IN,
        reason: 'Initial warehouse shipment intake (PO-2026-002)',
        createdById: warehouseUser.id,
      },
      {
        productId: p3.id,
        quantityChanged: 8,
        movementType: MovementType.IN,
        reason: 'Initial warehouse shipment intake (PO-2026-003)',
        createdById: warehouseUser.id,
      },
      {
        productId: p4.id,
        quantityChanged: 60,
        movementType: MovementType.IN,
        reason: 'Initial warehouse shipment intake (PO-2026-004)',
        createdById: warehouseUser.id,
      },
      {
        productId: p5.id,
        quantityChanged: 4,
        movementType: MovementType.IN,
        reason: 'Initial warehouse shipment intake (PO-2026-005)',
        createdById: warehouseUser.id,
      },
    ],
  });

  console.log('🚚 Created initial Stock Movement history records.');

  // 7. Create Sample Sales Challans
  const challan1 = await prisma.challan.create({
    data: {
      challanNumber: 'CH-2026-000001',
      customerId: customer1.id,
      totalQuantity: 20,
      status: ChallanStatus.CONFIRMED,
      createdById: salesUser.id,
      items: {
        create: [
          {
            productId: p1.id,
            productNameSnapshot: p1.productName,
            skuSnapshot: p1.sku,
            unitPriceSnapshot: p1.unitPrice,
            quantity: 15,
            totalPrice: 15 * p1.unitPrice,
          },
          {
            productId: p2.id,
            productNameSnapshot: p2.productName,
            skuSnapshot: p2.sku,
            unitPriceSnapshot: p2.unitPrice,
            quantity: 5,
            totalPrice: 5 * p2.unitPrice,
          },
        ],
      },
    },
  });

  await prisma.stockMovement.createMany({
    data: [
      {
        productId: p1.id,
        quantityChanged: 15,
        movementType: MovementType.OUT,
        reason: `Sales Challan Fulfillment #${challan1.challanNumber}`,
        createdById: salesUser.id,
      },
      {
        productId: p2.id,
        quantityChanged: 5,
        movementType: MovementType.OUT,
        reason: `Sales Challan Fulfillment #${challan1.challanNumber}`,
        createdById: salesUser.id,
      },
    ],
  });

  await prisma.challan.create({
    data: {
      challanNumber: 'CH-2026-000002',
      customerId: customer2.id,
      totalQuantity: 10,
      status: ChallanStatus.DRAFT,
      createdById: salesUser.id,
      items: {
        create: [
          {
            productId: p4.id,
            productNameSnapshot: p4.productName,
            skuSnapshot: p4.sku,
            unitPriceSnapshot: p4.unitPrice,
            quantity: 10,
            totalPrice: 10 * p4.unitPrice,
          },
        ],
      },
    },
  });

  console.log('📜 Created sample Sales Challans (Draft & Confirmed).');
  console.log('✅ Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
