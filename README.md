# Mini ERP + CRM Operations Portal

Production-grade, full-stack **Mini ERP + CRM Operations Portal** built for wholesale and distribution enterprises to streamline client management, inventory tracking, stock movements, and sales delivery challans with ACID database transaction safety.

![Tech Stack](https://img.shields.io/badge/Stack-Express_|_React_|_TypeScript_|_Prisma_|_SQLite/PostgreSQL-indigo)
![Build Status](https://img.shields.io/badge/Tests-13_Passed_100%25-success)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## 🌟 Key Highlights & Features

1. **Role-Based Access Control (RBAC)**
   - Supported Roles: `ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`.
   - JWT-based authentication with bcrypt password hashing.
   - Dynamic UI access control and strict backend middleware route guards.

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
   - Quick-switch test credential buttons on login screen for instant role testing.
   - Interactive tables, KPI cards, custom modal dialogs, and toast notifications.

7. **Automated Test Suite & Postman Collection**
   - Jest & Supertest integration suite validating Auth, CRM, Inventory, and Transaction Rollback safety.
   - Postman Collection (`postman/Mini-ERP-CRM.postman_collection.json`) with auto-saving JWT environment variables.

---

## 🏗️ Architecture & Monorepo Structure

```
mini-erp-crm/
├── backend/
│   ├── src/
│   │   ├── config/ (env, prisma client)
│   │   ├── controllers/ (auth, customer, product, stock, challan, dashboard)
│   │   ├── middleware/ (auth, rbac, error, validate)
│   │   ├── routes/ (api router index, modular routes)
│   │   ├── validators/ (zod request schemas)
│   │   ├── utils/ (challan number generator, response formatter)
│   │   ├── types/ (domain types & role definitions)
│   │   ├── app.ts (express setup & middleware)
│   │   └── server.ts (http server launcher)
│   ├── prisma/
│   │   ├── schema.prisma (SQLite local dev schema)
│   │   ├── schema.postgresql.prisma (PostgreSQL production schema)
│   │   └── seed.ts (Database seed script)
│   ├── tests/
│   │   └── api.test.ts (Supertest integration test suite)
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/ (Navbar, Sidebar, StatCard, Modal, ConfirmDialog, StatusBadge, Toast)
│   │   ├── context/ (AuthContext with role guards)
│   │   ├── layouts/ (MainLayout)
│   │   ├── pages/ (Login, Dashboard, Customers, CustomerDetail, Products, ProductDetail, Inventory, Challans, ChallanCreate, ChallanDetail, Profile, Unauthorized)
│   │   ├── services/ (axios API client & module services)
│   │   ├── types/ (domain interfaces)
│   │   ├── routes/ (AppRoutes, ProtectedRoute, RoleGuard)
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css (Dark glassmorphic styling system)
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── postman/
│   └── Mini-ERP-CRM.postman_collection.json
├── docker-compose.yml
├── README.md
└── .gitignore
```

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

> ⚡ **Quick Login Note**: The frontend login page includes quick-selection buttons to pre-fill test credentials with one click.

---

## ⚡ Quick Start Guide (Local Development)

### 1. Prerequisites
- Node.js (v18+)
- npm (v9+)

### 2. Backend Setup
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run prisma:seed
npm run dev
```
Backend API will start at `http://localhost:5000`.

### 3. Frontend Setup
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend Web App will open at `http://localhost:5173`.

---

## 🧪 Running Automated Tests

Run the backend Jest integration test suite:
```bash
cd backend
npm test
```
This runs 13 automated tests verifying authentication, CRM creation, inventory controls, role authorization, and the ACID transaction rollback logic.

---

## 🐳 Running with Docker Compose

Spin up the full multi-container stack (Frontend + Backend + PostgreSQL):
```bash
docker compose up --build
```
- **Frontend App**: `http://localhost:80`
- **Backend REST API**: `http://localhost:5000`
- **PostgreSQL DB**: `localhost:5432`

---

## 📫 Postman API Collection

1. Open Postman and import `postman/Mini-ERP-CRM.postman_collection.json`.
2. Execute **1. Authentication -> Login (Admin)**.
3. The Postman collection script automatically saves the returned JWT token to the `{{token}}` variable for subsequent requests.

---

## 🌐 Production Deployment

### Frontend (Vercel / Netlify / Render Static)
- Build command: `npm run build`
- Output directory: `dist`
- Environment Variable: `VITE_API_BASE_URL=https://your-backend-api.onrender.com/api`

### Backend (Render / Railway / Fly.io)
- Start command: `npm run start` (or `node dist/server.js`)
- Environment Variables:
  ```env
  PORT=5000
  NODE_ENV=production
  DATABASE_URL=postgresql://user:password@ep-host.neon.tech/mini_erp_crm?sslmode=require
  JWT_SECRET=super_secure_production_secret
  JWT_EXPIRES_IN=1d
  FRONTEND_URL=https://your-frontend.vercel.app
  ```

---

## 📄 License
This project is licensed under the MIT License.
