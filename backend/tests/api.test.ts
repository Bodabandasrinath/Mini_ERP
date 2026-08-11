import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/prisma';
import bcrypt from 'bcryptjs';

describe('Mini ERP + CRM API Test Suite', () => {
  let adminToken: string;
  let salesToken: string;

  let testCustomerId: string;
  let testProductId1: string;
  let testProductId2: string;

  beforeAll(async () => {
    // Clean DB
    await prisma.challanItem.deleteMany();
    await prisma.challan.deleteMany();
    await prisma.stockMovement.deleteMany();
    await prisma.customerFollowup.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();

    // Create test admin and sales users
    const salt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash('Admin@123', salt);
    const salesPass = await bcrypt.hash('Sales@123', salt);

    await prisma.user.create({
      data: {
        name: 'Test Admin',
        email: 'admin@example.com',
        passwordHash: adminPass,
        role: 'ADMIN',
      },
    });

    await prisma.user.create({
      data: {
        name: 'Test Sales',
        email: 'sales@example.com',
        passwordHash: salesPass,
        role: 'SALES',
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('1. Authentication APIs', () => {
    it('should successfully log in Admin user and return JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@example.com', password: 'Admin@123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.role).toBe('ADMIN');

      adminToken = res.body.data.token;
    });

    it('should successfully log in Sales user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'sales@example.com', password: 'Sales@123' });

      expect(res.status).toBe(200);
      salesToken = res.body.data.token;
    });

    it('should reject invalid password with 401 Unauthorized', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@example.com', password: 'WrongPassword123' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Invalid email or password/i);
    });

    it('should fetch user profile for authenticated session via /api/auth/me', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('admin@example.com');
    });
  });

  describe('2. Customer CRM APIs', () => {
    it('should create a new customer', async () => {
      const res = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${salesToken}`)
        .send({
          customerName: 'Test Buyer',
          mobileNumber: '+919999900000',
          email: 'buyer@testcorp.com',
          businessName: 'TestCorp Enterprises',
          customerType: 'WHOLESALE',
          address: 'Building 5, Business Park, Tech City',
          status: 'ACTIVE',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();

      testCustomerId = res.body.data.id;
    });

    it('should list customers with pagination', async () => {
      const res = await request(app)
        .get('/api/customers?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toBeDefined();
    });
  });

  describe('3. Product & Inventory Stock APIs', () => {
    it('should create new test products', async () => {
      const p1 = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          productName: 'Test Heavy Motor A',
          sku: 'SKU-TEST-MTR-A',
          category: 'Motors',
          unitPrice: 1500,
          currentStock: 50,
          minimumStockAlertQuantity: 10,
          warehouseLocation: 'Bay T-01',
        });

      expect(p1.status).toBe(201);
      testProductId1 = p1.body.data.id;

      const p2 = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          productName: 'Test Control Valve B',
          sku: 'SKU-TEST-VLV-B',
          category: 'Valves',
          unitPrice: 400,
          currentStock: 2, // Low stock on purpose for transaction test!
          minimumStockAlertQuantity: 5,
          warehouseLocation: 'Bay T-02',
        });

      expect(p2.status).toBe(201);
      testProductId2 = p2.body.data.id;
    });

    it('should perform Stock IN movement', async () => {
      const res = await request(app)
        .post('/api/stock-movements')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          productId: testProductId1,
          quantityChanged: 10,
          movementType: 'IN',
          reason: 'Test Restock',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.product.currentStock).toBe(60);
    });

    it('should reject Stock OUT movement exceeding available stock with 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/stock-movements')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          productId: testProductId2,
          quantityChanged: 999, // Exceeds currentStock of 2!
          movementType: 'OUT',
          reason: 'Invalid Large Outbound',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Insufficient stock/i);
    });
  });

  describe('4. Sales Challan & ACID Database Transaction Tests', () => {
    it('should create a DRAFT sales challan with snapshot data', async () => {
      const res = await request(app)
        .post('/api/challans')
        .set('Authorization', `Bearer ${salesToken}`)
        .send({
          customerId: testCustomerId,
          items: [
            { productId: testProductId1, quantity: 5 },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.data.challanNumber).toMatch(/^CH-\d{4}-\d{6}$/);
      expect(res.body.data.status).toBe('DRAFT');
      expect(res.body.data.items[0].productNameSnapshot).toBe('Test Heavy Motor A');
    });

    it('CRITICAL TEST: Challan Confirmation Transaction Rollback when ONE item has insufficient stock', async () => {
      // Product 1 has stock 60
      // Product 2 has stock 2
      // We request 10 of Product 1 and 10 of Product 2.
      const draftRes = await request(app)
        .post('/api/challans')
        .set('Authorization', `Bearer ${salesToken}`)
        .send({
          customerId: testCustomerId,
          items: [
            { productId: testProductId1, quantity: 10 },
            { productId: testProductId2, quantity: 10 }, // 10 > 2 (Insufficient!)
          ],
        });

      const challanId = draftRes.body.data.id;

      // Attempt to confirm
      const confirmRes = await request(app)
        .post(`/api/challans/${challanId}/confirm`)
        .set('Authorization', `Bearer ${salesToken}`);

      expect(confirmRes.status).toBe(400);
      expect(confirmRes.body.success).toBe(false);
      expect(confirmRes.body.message).toMatch(/Insufficient stock/i);

      // Verify Rollback: Product 1 stock MUST still be 60 (NOT reduced by 10)!
      const checkProd1 = await prisma.product.findUnique({ where: { id: testProductId1 } });
      expect(checkProd1?.currentStock).toBe(60);

      // Verify Challan status MUST still be DRAFT (NOT confirmed)!
      const checkChallan = await prisma.challan.findUnique({ where: { id: challanId } });
      expect(checkChallan?.status).toBe('DRAFT');
    });

    it('should successfully confirm Challan when all items have sufficient stock', async () => {
      // Create valid challan with 5 of Product 1
      const draftRes = await request(app)
        .post('/api/challans')
        .set('Authorization', `Bearer ${salesToken}`)
        .send({
          customerId: testCustomerId,
          items: [{ productId: testProductId1, quantity: 5 }],
        });

      const challanId = draftRes.body.data.id;

      const confirmRes = await request(app)
        .post(`/api/challans/${challanId}/confirm`)
        .set('Authorization', `Bearer ${salesToken}`);

      expect(confirmRes.status).toBe(200);
      expect(confirmRes.body.data.status).toBe('CONFIRMED');

      // Verify stock reduced from 60 to 55
      const checkProd1 = await prisma.product.findUnique({ where: { id: testProductId1 } });
      expect(checkProd1?.currentStock).toBe(55);
    });
  });

  describe('5. Role Authorization Guards', () => {
    it('should reject Sales role trying to delete a customer with 403 Forbidden', async () => {
      const res = await request(app)
        .delete(`/api/customers/${testCustomerId}`)
        .set('Authorization', `Bearer ${salesToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Access denied/i);
    });
  });
});
