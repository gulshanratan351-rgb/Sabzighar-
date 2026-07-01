# SabziGhar — E2E Test Plan (order lifecycle across all 3 panels)

Servers (already running): backend `:5000`, user `:5173`, admin `:5174`, delivery `:5175`.
Accounts (seeded): customer `customer@sabzighar.com / customer123`, admin `owner@sabzighar.com / Admin@12345`, delivery `delivery@sabzighar.com / delivery123`.

Grounding: user routes `user/src/App.jsx`; add-to-cart + weight pricing `user/src/pages/ProductDetail.jsx:44-66`; checkout/place order `user/src/pages/Checkout.jsx:42-57` (`POST /orders`); stock decrement `backend/src/controllers/orderController.js:47,100-102` (grams for weight); admin status/assign `admin/src/pages/Orders.jsx:34-44` (`PUT /admin/orders/:id/status`, `/assign`); delivery status + COD `delivery/src/pages/OrderDetail.jsx:33-47` (`PUT /delivery/order/:id/status`, `/cod`); cancel restores stock `orderController.js:162-178`.

## Primary flow — one order, end to end

### T1: Customer places a weight order (stock + totals correct)
1. User app `:5173` → login as customer.
2. Open a **weight** product (e.g. Tomato) detail page. **Record its "In stock" state and note admin baseline stock (step T2 pre-check).**
3. Select weight **500 g**, quantity **1 pack**, click **Add to Cart**.
   - Pass: sticky total shows `packPrice` = `round(price*500/1000)` for the pack; cart badge increments to 1.
4. Go to Cart. Verify subtotal = pack price, delivery charge shown (₹25 if subtotal < 299, else FREE), total = subtotal − discount + delivery.
   - Pass: arithmetic matches exactly (e.g. subtotal ₹20 + delivery ₹25 = total ₹45). Fail: total ignores delivery or miscomputes.
5. Checkout → select address (seeded) → payment **COD** → Place Order.
   - Pass: redirects to `/order-success/:id`; order number shown. Fail: error toast / stays on page.

### T2: Stock auto-reduced after order (adversarial core)
Pre-check (before T1 step 5): in admin Products, note the chosen product's stock value `S` (grams).
After T1 completes:
1. Admin app `:5174` → Products → same product.
   - Pass: stock is now `S − 500` (exactly 500 g less for a 1×500 g pack). Fail: unchanged or wrong delta.

### T3: Admin sees order, advances status, assigns delivery boy
1. Admin → Orders. Newest order appears with status **Pending**, correct total (= T1 total), COD.
2. Change status dropdown → **Confirmed** → **Packed**.
   - Pass: toast "Marked …"; pill color/status updates and persists on reload.
3. Assign delivery boy dropdown → select the seeded delivery partner.
   - Pass: toast "Assigned"; order shows assigned rider.

### T4: Delivery partner completes order + COD
1. Delivery app `:5175` → login as delivery partner.
2. Orders list → the assigned order is visible with customer address + total.
3. Open it → click **Picked Up / Out for Delivery**.
   - Pass: status pill → "Out for Delivery".
4. Click **Mark COD Collected**.
   - Pass: shows "✅ COD Collected — ₹<total>".
5. Click **Mark Delivered**.
   - Pass: status → **Delivered**; delivered state UI shown.

### T5: Customer sees live status = Delivered
1. User app → Orders → open the same order.
   - Pass: status shows **Delivered** (proves user↔delivery share one order record). Fail: still Pending.

## Adversarial notes
- T2 is the discriminating test: a broken stock system would leave stock unchanged or subtract 1 instead of 500 g. Recording the exact before/after delta catches this.
- T1.4 totals: a broken calculator would drop delivery charge or discount — exact arithmetic assertion catches it.
- T3→T4→T5 prove the SAME order flows across three separate apps/roles via one backend; a broken wiring would show the order in only one app or fail to propagate status.
