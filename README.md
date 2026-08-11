# Mini ERP + CRM Operations Portal

Production-grade, full-stack **Mini ERP + CRM Operations Portal** built for wholesale and distribution enterprises to streamline client management, inventory tracking, stock movements, and sales delivery challans with ACID database transaction safety.

![Tech Stack](https://img.shields.io/badge/Stack-Express_|_React_|_TypeScript_|_Prisma_|_SQLite/PostgreSQL-indigo)
![Build Status](https://img.shields.io/badge/Tests-16_Passed_100%25-success)
![Vercel Target](https://img.shields.io/badge/Vercel_Account-srinath18-black?logo=vercel)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## 🌟 Key Highlights & Features

1. **User Registration & Authentication (JWT + bcrypt)**
   - Sign In with either **Username / Full Name** or **Email Address**.
   - Public account registration with full name, email, phone number, role selection, and matching password confirmation.
   - Automatic redirection to Sign In tab with pre-filled credentials upon account creation.
   - Roles Supported: `ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`.

2. **Customer CRM Module**
   - Manage Lead, Active, and Inactive customer accounts across Retail, Wholesale, and Distributor channels.
   - Chronological follow-up timeline tracking with scheduled follow-up dates and notes.
   - Real-time search by customer name, mobile number, business name, and email.

3. **Product Catalog & Low Stock Alerting**
   - SKU management, category filtering, unit pricing, and warehouse bay mapping.
   - Real-time **Low Stock Alerting** (`currentStock <= minimumStockAlertQuantity`) with visual warning badges.

4. **Inventory & Stock Movement Audit Logs**
   - Track `IN` (Intake/Purchase) and `OUT` (Despatch/Adjustment) movements with audit logs (recorded by, timestamp, reason).
   - Strict validation preventing negative stock levels. Returns HTTP 400 `"Insufficient stock"`.

5. **Sales Delivery Challan & ACID Transaction Safety**
   - Multi-step Challan builder generating unique sequential numbers (`CH-2026-000001`).
   - **Product Snapshotting**: Stores `productNameSnapshot`, `skuSnapshot`, and `unitPriceSnapshot` on each challan line item to preserve historical accuracy even if catalog prices change later.
   - **ACID Database Transaction on Confirmation**:
     ```
     BEGIN TRANSACTION
     1. Lock & fetch Challan and items
     2. Verify Challan status is DRAFT
     3. Check stock availability for EVERY requested product
     4. If ANY item lacks stock -> ABORT & ROLLBACK ALL CHANGES
     5. Otherwise -> Deduct stock, record OUT stock movements, update status to CONFIRMED
     COMMIT TRANSACTION
     ```

6. **Modern Dark Glassmorphic Dashboard UI**
   - Built with React 18, TypeScript, React Router, Vite, and custom CSS design system.
   - Interactive tables, KPI cards, custom modal dialogs, and toast notifications.

7. **Automated Test Suite & Postman Collection**
   - Jest & Supertest integration suite validating Auth, Registration, CRM, Inventory, and Transaction Rollback safety.
   - Postman Collection (`postman/Mini-ERP-CRM.postman_collection.json`) with auto-saving JWT environment variables.

---

## 🚀 Vercel Deployment Instructions (for https://vercel.com/srinath18)

### Option A: Deploying via Vercel CLI (Recommended Direct Command)

1. Open PowerShell and navigate to the frontend directory:
   ```powershell
   cd C:\Users\SRINATH\.gemini\antigravity\scratch\mini-erp-crm\frontend
   ```

2. Execute Vercel production deployment:
   ```powershell
   npx vercel --prod
   ```

3. Follow the interactive prompts:
   - **Log in to Vercel**: Select **Continue with GitHub** or your preferred login for account `srinath18`.
   - **Set up and deploy**: `y`
   - **Which scope do you want to deploy to?**: Select `srinath18`
   - **Link to existing project?**: `n`
   - **Project Name**: `mini-erp-crm`
   - **Directory**: `./`
   - **Build Settings**: Keep defaults (Vercel will auto-detect Vite build).

4. Vercel will build and output your production deployment link:
   `https://mini-erp-crm-srinath18.vercel.app`

---

### Option B: Deploying via GitHub Integration

1. Create a repository on GitHub under user `srinath18`:
   ```powershell
   cd C:\Users\SRINATH\.gemini\antigravity\scratch\mini-erp-crm
   git remote add origin https://github.com/srinath18/mini-erp-crm.git
   git branch -M main
   git push -u origin main
   ```

2. Open Vercel Project Creation page: [https://vercel.com/new](https://vercel.com/new) under account `srinath18`.

3. Import the `srinath18/mini-erp-crm` repository.

4. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variable**: `VITE_API_BASE_URL=https://your-backend-api.onrender.com/api`

5. Click **Deploy**.

---

## 🔐 Role Permissions Matrix

| Feature / Module | ADMIN | SALES | WAREHOUSE | ACCOUNTS |
| :--- | :---: | :---: | :---: | :---: |
| **Login & Profile View** | ✅ | ✅ | ✅ | ✅ |
| **Customer CRM (Read / Search)** | ✅ | ✅ | ✅ | ✅ |
| **Customer Create & Edit** | ✅ | ✅ | ❌ | ❌ |
| **Customer Delete** | ✅ | ❌ | ❌ | ❌ |
| **Post CRM Follow-up Notes** | ✅ | ✅ | ❌ | ❌ |
| **Product Catalog (Read / Search)** | ✅ | ✅ | ✅ | ✅ |
| **Product Create & Edit** | ✅ | ❌ | ✅ | ❌ |
| **Stock IN / OUT Movements** | ✅ | ❌ | ✅ | ❌ |
| **View Sales Challans** | ✅ | ✅ | ✅ | ✅ |
| **Create & Draft Sales Challans** | ✅ | ✅ | ❌ | ❌ |
| **Confirm / Cancel Challans** | ✅ | ✅ | ❌ | ❌ |

---

## 🔑 Default Test Credentials

The database seed script automatically provisions test accounts for each role:

| Role | Email Address | Password | Primary Focus |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `Admin@123` | Full system control |
| **Sales** | `sales@example.com` | `Sales@123` | Customers CRM & Sales Challans |
| **Warehouse** | `warehouse@example.com` | `Warehouse@123` | Product catalog & Stock movements |
| **Accounts** | `accounts@example.com` | `Accounts@123` | Financial & Challan reporting |

---

## 🧪 Running Automated Tests

Run the backend Jest integration test suite:
```bash
cd backend
npm test
```
This runs 16 automated tests verifying authentication, registration, CRM creation, inventory controls, role authorization, and the ACID transaction rollback logic.

---

## 📄 License
This project is licensed under the MIT License.
