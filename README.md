# 🥬 SabziGhar — Vegetable & Fruit Delivery App

**Tazi Sabzi, Seedhe Ghar Tak** — a full-stack, production-ready grocery delivery platform (Blinkit/Zepto style) built with the MERN stack.

This is a **monorepo** with four independent applications:

| App | Folder | Stack | Default Port | Description |
|-----|--------|-------|--------------|-------------|
| **Backend API** | [`backend/`](backend) | Node.js + Express + MongoDB | `5000` | REST API, JWT auth, image upload, seed data |
| **User App** | [`user/`](user) | React + Vite | `5173` | Customer shopping app (mobile-first) |
| **Admin Panel** | [`admin/`](admin) | React + Vite | `5174` | Owner dashboard & management |
| **Delivery Panel** | [`delivery/`](delivery) | React + Vite | `5175` | Delivery partner app (mobile-first) |

---

## ✨ Features

### 👤 User App (26 features)
Splash & welcome screens · Login / Signup / Forgot password (OTP) · Location & address management · Home with banners & categories · Search · Categories (Vegetables, Fruits, Dairy, Organic, Offers) · Product list & detail · MRP / selling price / discount · **Gram / KG / PCS unit selection** with custom weight · Quantity selector · Cart · Coupon apply · Checkout · **COD & UPI** payment · Order placement · My Orders · **Live order status** (auto-refresh) · Order cancel · Profile · Help/Support with FAQ · Notifications.

### 🛠️ Admin Panel (20 features)
Secure owner-only login · Dashboard with KPIs · Product CRUD with **real photo upload** · Price by gram/kg/pcs · MRP / discount / stock · Category management · Banner management · Coupon management · Order management · Change order status · Assign delivery boy · Delivery boy management · User management (block/unblock) · Delivery area/pincode management · Sales report (CSV export) · Daily/weekly/monthly analytics · Low-stock alerts · COD/UPI payment control · Store settings.

### 🛵 Delivery Panel
Delivery boy login/signup · Assigned orders (auto-refresh) · Order details · Customer address + **Call** button + Maps navigation · Status updates (Out for Delivery → Delivered) · COD amount collection · Delivery history & stats.

### ⚙️ Backend
REST API · JWT authentication · **Role-based access** (user / admin / delivery) · Mongoose models (User, Product, Category, Order, Cart, Coupon, Banner, DeliveryBoy, Notification, Setting) · Image upload (Multer) · Central error handling · Input validation (express-validator) · bcrypt password hashing · Environment variables · CORS · Seed data · API docs at `/api/docs`.

### 📦 Product Weight System
- Weight products priced **per KG**; orderable in **100g / 250g / 500g / 1kg / custom grams**.
- Piece products priced **per piece**.
- Stock tracked in **grams** (weight) or **pieces** and **auto-reduced on order**, restored on cancellation.
- Stock `0` → product shows **Out of Stock**.

### 🔄 Order Status Flow
`Pending → Confirmed → Packed → Assigned → Out for Delivery → Delivered` (+ `Cancelled`)

---

## 🚀 Quick Start

> Requires **Node.js 18+** and **MongoDB** (local or Atlas). See [docs/SETUP.md](docs/SETUP.md) for detailed steps.

```bash
# 1. Backend
cd backend
cp .env.example .env          # edit values as needed
npm install
npm run seed                  # loads demo categories, products, users
npm run dev                   # http://localhost:5000

# 2. User app (new terminal)
cd user && cp .env.example .env && npm install && npm run dev      # http://localhost:5173

# 3. Admin panel (new terminal)
cd admin && cp .env.example .env && npm install && npm run dev     # http://localhost:5174

# 4. Delivery panel (new terminal)
cd delivery && cp .env.example .env && npm install && npm run dev  # http://localhost:5175
```

### 🔑 Demo Accounts (created by `npm run seed`)
| Role | Email | Password | Login at |
|------|-------|----------|----------|
| Admin (owner) | `owner@sabzighar.com` | `Admin@12345` | Admin panel |
| Customer | `customer@sabzighar.com` | `customer123` | User app |
| Delivery | `delivery@sabzighar.com` | `delivery123` | Delivery panel |

> ⚠️ Change `OWNER_EMAIL` / `OWNER_PASSWORD` in `backend/.env` before going live.

---

## 📚 Documentation
- **[Setup Guide](docs/SETUP.md)** — install, MongoDB, admin login, env vars.
- **[Deployment Guide](docs/DEPLOYMENT.md)** — Render (backend) + Hostinger (frontends) + MongoDB Atlas.
- **[Testing Checklist](docs/TESTING.md)** — full end-to-end QA checklist.
- **[API Reference](backend/API.md)** — all endpoints.

## 🗂️ Folder Structure
```
sabzighar/
├── backend/        # Express + MongoDB REST API
│   ├── src/
│   │   ├── config/         # db, env
│   │   ├── controllers/    # route handlers
│   │   ├── middleware/     # auth, error, upload, validate
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Express routers
│   │   ├── seed/           # seed script
│   │   ├── utils/          # helpers, pricing, ApiError
│   │   ├── app.js          # express app
│   │   └── server.js       # entrypoint
│   ├── uploads/            # uploaded images
│   └── .env.example
├── user/           # Customer React + Vite app
├── admin/          # Admin React + Vite app
├── delivery/       # Delivery React + Vite app
└── docs/           # setup / deployment / testing guides
```

## 🧰 Tech Stack
React 18, Vite 5, React Router 6, Axios, react-hot-toast, react-icons · Node 18, Express 4, Mongoose 8, JWT, bcryptjs, Multer, express-validator, CORS.

## 📝 License
MIT — free to use and modify.
