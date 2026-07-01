# 🛠️ SabziGhar — Setup Guide

Complete steps to run all four apps locally.

## 1. Prerequisites
- **Node.js 18+** and npm — https://nodejs.org
- **MongoDB** — either local install, Docker, or a free MongoDB Atlas cluster.
- **Git**.

Check versions:
```bash
node -v   # v18+ 
npm -v
```

## 2. Clone the repo
```bash
git clone <your-repo-url> sabzighar
cd sabzighar
```

## 3. MongoDB setup (pick ONE)

### Option A — Docker (fastest)
```bash
docker run -d --name sabzighar-mongo -p 27017:27017 mongo:7
```
Connection string: `mongodb://127.0.0.1:27017/sabzighar`

### Option B — Local install
Install MongoDB Community Server, start the `mongod` service. Same connection string as above.

### Option C — MongoDB Atlas (cloud, recommended for production)
1. Create a free cluster at https://www.mongodb.com/atlas.
2. Create a database user + password.
3. Network Access → allow your IP (or `0.0.0.0/0` for testing).
4. Copy the connection string, e.g.
   `mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/sabzighar`

## 4. Backend
```bash
cd backend
cp .env.example .env
```
Edit `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/sabzighar
JWT_SECRET=change-this-to-a-long-random-string
JWT_EXPIRE=30d
OWNER_EMAIL=owner@sabzighar.com       # your owner Gmail for admin login
OWNER_PASSWORD=Admin@12345            # change before production
CLIENT_URLS=http://localhost:5173,http://localhost:5174,http://localhost:5175
DELIVERY_CHARGE=25
FREE_DELIVERY_ABOVE=299
OTP_DEV_MODE=true                     # returns OTP in API response for testing
```
Install, seed, run:
```bash
npm install
npm run seed     # loads categories, products, banners, coupons + demo users
npm run dev      # nodemon, http://localhost:5000
# or: npm start  (production)
```
Verify: open http://localhost:5000/api — you should see a JSON status. API docs at http://localhost:5000/api/docs.

## 5. Admin login setup
The admin (owner) account is created automatically by `npm run seed` using `OWNER_EMAIL` / `OWNER_PASSWORD` from `.env`.
- To use **your own Gmail**, set `OWNER_EMAIL=yourname@gmail.com` and a strong `OWNER_PASSWORD` **before** running `npm run seed`.
- Only this email can log into the Admin Panel (`/auth/admin-login` verifies `role: admin`).

## 6. Frontend apps
Each frontend has a `.env` with the backend URL. Defaults point to `http://localhost:5000/api`.

```bash
# User app
cd user && cp .env.example .env && npm install && npm run dev        # http://localhost:5173

# Admin panel
cd admin && cp .env.example .env && npm install && npm run dev       # http://localhost:5174

# Delivery panel
cd delivery && cp .env.example .env && npm install && npm run dev    # http://localhost:5175
```
`.env` for each frontend:
```env
VITE_API_URL=http://localhost:5000/api
```

## 7. First run walkthrough
1. Open the **Admin panel** (5174), login with owner credentials → Dashboard.
2. Add/verify products (seed already added 16), upload photos, set price by kg/pcs.
3. Open the **User app** (5173), sign up or use `customer@sabzighar.com / customer123`, add an address, add products to cart, apply coupon `WELCOME50`, checkout (COD/UPI), place an order.
4. Back in **Admin**, open Orders → change status, assign a delivery boy.
5. Open the **Delivery panel** (5175), login `delivery@sabzighar.com / delivery123`, see the assigned order, mark Out for Delivery → Delivered, collect COD.
6. In the **User app**, open My Orders → watch the live status update.

## 8. Common issues
| Problem | Fix |
|---------|-----|
| `MongooseServerSelectionError` | MongoDB not running / wrong `MONGO_URI`. |
| CORS error in browser | Add the frontend origin to `CLIENT_URLS` in `backend/.env`, restart backend. |
| Images not showing after upload | Ensure `backend/uploads/` is writable; backend serves it at `/uploads`. |
| Admin login "Invalid credentials" | Re-run `npm run seed` after setting `OWNER_EMAIL`/`OWNER_PASSWORD`. |
| Port already in use | Change `PORT` (backend) or the `--port` in the app's `package.json` dev script. |
