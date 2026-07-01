# SabziGhar API Reference

Base URL: `http://localhost:5000/api` (live JSON version available at `GET /api/docs`).

**Auth:** send `Authorization: Bearer <token>`. Roles: `user`, `admin`, `delivery`.
All responses are JSON with a `success` boolean. Errors: `{ success: false, message }`.

---

## Auth — `/auth`
| Method | Path | Access | Body |
|--------|------|--------|------|
| POST | `/auth/register` | public | `{ name, email, phone?, password }` |
| POST | `/auth/login` | public | `{ email, password }` |
| POST | `/auth/admin-login` | public | `{ email, password }` (owner only) |
| POST | `/auth/delivery/register` | public | `{ name, email, phone, password, vehicleNumber?, area? }` |
| POST | `/auth/delivery/login` | public | `{ email, password }` |
| POST | `/auth/forgot-password` | public | `{ email }` → returns `devOtp` when `OTP_DEV_MODE=true` |
| POST | `/auth/reset-password` | public | `{ email, otp, password }` |
| GET | `/auth/me` | any | — |

## Users — `/users` (auth)
`PUT /profile` · `PUT /change-password` · `GET /addresses` · `POST /addresses` · `PUT /addresses/:id` · `DELETE /addresses/:id`

## Categories — `/categories`
`GET /` (`?all=1` for inactive, admin) · `GET /:slug` · `POST /` · `PUT /:id` · `DELETE /:id` (admin; image via multipart `image` or `image` URL in body).

## Products — `/products`
- `GET /` — query: `search, category(slug), sort(new|priceLow|priceHigh|popular), offers, organic, featured, inStock, page, limit`.
- `GET /:slug` — product + related.
- `GET /admin/all` — all incl. inactive (admin).
- `POST /` · `PUT /:id` · `DELETE /:id` (admin). Images via multipart `images[]` or `images` URL array in body. Fields: `name, description, category, unitType(weight|piece), mrp, price, stock, lowStockThreshold, options[], isOrganic, isFeatured, isActive`.

## Cart — `/cart` (auth)
`GET /` · `POST /` `{ productId, grams?, pieces?, quantity, label }` · `PUT /item/:itemId` `{ quantity }` · `DELETE /item/:itemId` · `DELETE /` · `POST /coupon` `{ code }` · `DELETE /coupon`

## Coupons — `/coupons`
`GET /` (public active) · `GET /admin` (admin) · `POST /` · `PUT /:id` · `DELETE /:id` (admin).

## Banners — `/banners`
`GET /` (`?all=1` admin) · `POST /` · `PUT /:id` · `DELETE /:id` (admin).

## Orders — `/orders` (auth)
`POST /` `{ addressId, paymentMethod(COD|UPI), upiId? }` · `GET /` · `GET /:id` · `PUT /:id/cancel` `{ reason }`

## Notifications — `/notifications` (auth)
`GET /` · `PUT /read-all` · `PUT /:id/read`

## Upload — `/upload` (admin)
`POST /` multipart, field `images` (up to 6) → `{ urls: [...] }`

## Settings — `/settings`
`GET /` (public) · `PUT /` (admin): `storeName, tagline, supportPhone, supportEmail, deliveryCharge, freeDeliveryAbove, servicePincodes[], upiId, codEnabled, upiEnabled, isStoreOpen`.

## Admin — `/admin` (admin)
`GET /dashboard` · `GET /analytics?range=daily|weekly|monthly` · `GET /low-stock` · `GET /sales-report?from=&to=` · `GET /orders?status=&search=` · `PUT /orders/:id/status` `{ status }` · `PUT /orders/:id/assign` `{ deliveryBoyId }` · `GET /users` · `PUT /users/:id/block` `{ isBlocked }` · `GET /delivery-boys` · `POST /delivery-boys` · `PUT /delivery-boys/:id` · `DELETE /delivery-boys/:id`

## Delivery — `/delivery` (delivery)
`GET /orders` · `GET /history` · `GET /stats` · `GET /order/:id` · `PUT /order/:id/status` `{ status }` · `PUT /order/:id/cod` `{ collected }`
