# ✅ SabziGhar — Testing Checklist

End-to-end QA checklist. Run the backend + all three frontends (see [SETUP.md](SETUP.md)) and work through each section.

## Backend / API
- [ ] `GET /api` returns status JSON.
- [ ] `POST /api/auth/register` creates a user and returns a token.
- [ ] `POST /api/auth/login` returns a token for valid creds; rejects bad creds.
- [ ] `POST /api/auth/admin-login` works only for the owner email.
- [ ] `POST /api/auth/delivery/login` works for delivery role.
- [ ] Protected routes reject requests without a valid token (401).
- [ ] Role guard: a user token cannot access `/api/admin/*` (403).

## User App
### Auth & onboarding
- [ ] Splash → Welcome → Signup/Login flow works.
- [ ] Signup creates account and redirects to location/address.
- [ ] Forgot password issues an OTP (dev mode shows it) and resets password.
- [ ] Logout clears session.

### Browsing
- [ ] Home shows banners (auto-rotating), categories, featured & popular products.
- [ ] Search returns matching products (debounced).
- [ ] Category pages list products; sort chips work (new/price/popular).
- [ ] Product detail shows image gallery, MRP, selling price, discount %, rating.

### Weight / unit system
- [ ] Weight product shows 100g / 250g / 500g / 1kg + Custom options.
- [ ] Custom grams input updates the pack price correctly.
- [ ] Piece product shows piece options.
- [ ] Pack price = per-kg price × grams ÷ 1000 (weight) or per-pc × pieces.

### Cart & checkout
- [ ] Add to cart (quick add from card and from detail page).
- [ ] Quantity stepper updates line total and bill.
- [ ] Coupon apply validates min order and shows discount; remove coupon works.
- [ ] Bill: item total, discount, delivery charge (free above threshold), grand total all correct.
- [ ] Out-of-stock product cannot be added.
- [ ] Checkout requires an address; can add one inline.
- [ ] COD order places successfully.
- [ ] UPI order requires a UPI ID and places successfully.

### Orders
- [ ] Order Success screen shows; "Track Order" opens detail.
- [ ] My Orders lists all orders with status pills.
- [ ] Order detail shows live timeline; auto-refreshes on status change.
- [ ] Cancel works while Pending/Confirmed/Packed; blocked afterward.
- [ ] Stock is reduced after placing an order; restored after cancel.

### Misc
- [ ] Profile shows user info and menu links.
- [ ] Addresses: add / set default / delete.
- [ ] Notifications list; mark read / read-all.
- [ ] Help page shows contact + FAQ accordion.

## Admin Panel
- [ ] Owner-only login; non-owner rejected.
- [ ] Dashboard KPIs render (sales, revenue, orders, users, etc.).
- [ ] Low-stock alert table appears when stock ≤ threshold.
- [ ] Products: create with photo upload, edit price/MRP/stock, toggle active, delete.
- [ ] Price can be set per **kg** or per **piece** via unit type.
- [ ] Categories: create/edit/delete with icon & image.
- [ ] Banners: create/edit/delete with image, link, active toggle.
- [ ] Coupons: create percent & flat coupons; min order, max discount, usage limit, expiry.
- [ ] Orders: filter by status, search by order no, view details.
- [ ] Change order status from dropdown (reflects in user app).
- [ ] Assign delivery boy (reflects in delivery panel).
- [ ] Delivery boys: create (with login), edit, block/unblock, delete.
- [ ] Users: list, search, block/unblock.
- [ ] Analytics: daily/weekly/monthly sales chart + top products.
- [ ] Sales report: date range, summary, CSV export.
- [ ] Settings: delivery charge, free-delivery threshold, COD/UPI toggles, pincodes, support info — saved and reflected in user checkout.

## Delivery Panel
- [ ] Login / signup as delivery partner.
- [ ] Assigned orders list (auto-refreshes); stats show.
- [ ] Order detail: customer name, phone, address.
- [ ] Call button opens dialer (`tel:`); Maps button opens navigation.
- [ ] Mark **Out for Delivery** → status updates.
- [ ] Mark **Delivered** → moves to history; COD auto-marked paid.
- [ ] "Mark COD Collected" works for COD orders.
- [ ] Delivery history lists completed orders.
- [ ] Profile shows totals (deliveries, COD collected).

## Cross-app integration (golden path)
1. [ ] User places a COD order.
2. [ ] Admin sees it, sets Confirmed → Packed, assigns a delivery boy.
3. [ ] Delivery partner sees the assigned order, marks Out for Delivery → Delivered, collects COD.
4. [ ] User's My Orders shows the live status reaching Delivered.
5. [ ] Admin dashboard sales/revenue reflect the delivered order.
6. [ ] Product stock decreased by the ordered amount.

## Responsive / mobile
- [ ] User & delivery apps are usable at 360–480px width (mobile-first).
- [ ] Admin panel sidebar collapses to a hamburger on small screens.
