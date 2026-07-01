# 🚀 SabziGhar — Deployment Guide

Recommended production setup:
- **Database** → MongoDB Atlas (free tier).
- **Backend** → Render (or Railway/any Node host).
- **Frontends** (user / admin / delivery) → Hostinger static hosting (or Vercel/Netlify).

---

## 1. MongoDB Atlas
1. Create a free cluster at https://www.mongodb.com/atlas.
2. Add a database user and password.
3. Network Access → add `0.0.0.0/0` (or your backend host IP).
4. Copy the connection string:
   `mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/sabzighar`

---

## 2. Backend on Render
1. Push this repo to GitHub.
2. On https://render.com → **New → Web Service** → connect the repo.
3. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
4. Add environment variables (from `backend/.env.example`):
   ```
   MONGO_URI      = <your Atlas string>
   JWT_SECRET     = <long random string>
   JWT_EXPIRE     = 30d
   OWNER_EMAIL    = youremail@gmail.com
   OWNER_PASSWORD = <strong password>
   CLIENT_URLS    = https://user.yourdomain.com,https://admin.yourdomain.com,https://delivery.yourdomain.com
   DELIVERY_CHARGE = 25
   FREE_DELIVERY_ABOVE = 299
   OTP_DEV_MODE   = false
   ```
5. Deploy. Your API will be at `https://sabzighar-api.onrender.com`.
6. **Seed once** — use Render Shell (or run locally against the Atlas URI):
   ```bash
   npm run seed
   ```

> **Uploads note:** Render's disk is ephemeral. For persistent product images, either (a) attach a Render **Persistent Disk** mounted at `backend/uploads`, or (b) switch image storage to a service like Cloudinary/S3. For a small store, a persistent disk is simplest.

---

## 3. Frontends on Hostinger (static)
Each React app builds to a static `dist/` folder that you upload to Hostinger.

For **each** app (`user`, `admin`, `delivery`):

1. Set the production API URL in its `.env` (or a `.env.production`):
   ```env
   VITE_API_URL=https://sabzighar-api.onrender.com/api
   ```
2. Build:
   ```bash
   cd user      # then repeat for admin, delivery
   npm install
   npm run build
   ```
3. Upload the contents of `dist/` to the appropriate directory in Hostinger's **File Manager** (e.g. `public_html/` for the main domain, or subdomain folders for admin/delivery).
4. **SPA routing fix** — add a `.htaccess` in each app's web root so refreshes on deep links work:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

### Suggested domains
| App | Domain |
|-----|--------|
| User | `https://sabzighar.com` (or `app.` ) |
| Admin | `https://admin.sabzighar.com` |
| Delivery | `https://delivery.sabzighar.com` |

Add all three to the backend's `CLIENT_URLS` env var (comma separated) for CORS.

---

## 4. Alternative: Vercel/Netlify for frontends
- Import the repo, set **Root Directory** to the app folder (`user`/`admin`/`delivery`).
- Build command `npm run build`, output dir `dist`.
- Add env var `VITE_API_URL`.
- SPA rewrites: Vercel auto-detects Vite; for Netlify add a `_redirects` file with `/* /index.html 200`.

---

## 5. Post-deploy checklist
- [ ] Backend `/api` returns status JSON.
- [ ] `OWNER_PASSWORD` changed from default; `OTP_DEV_MODE=false`.
- [ ] `JWT_SECRET` is a long random value.
- [ ] `CLIENT_URLS` includes every deployed frontend origin.
- [ ] Admin login works on the deployed admin panel.
- [ ] Place a test order end-to-end (user → admin → delivery).
- [ ] Product images persist after a backend restart (persistent disk / cloud storage).
