import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import productRoutes from './productRoutes.js';
import cartRoutes from './cartRoutes.js';
import couponRoutes from './couponRoutes.js';
import bannerRoutes from './bannerRoutes.js';
import orderRoutes from './orderRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import uploadRoutes from './uploadRoutes.js';
import settingRoutes from './settingRoutes.js';
import adminRoutes from './adminRoutes.js';
import deliveryRoutes from './deliveryRoutes.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    name: 'SabziGhar API',
    version: '1.0.0',
    status: 'running',
    docs: '/api/docs',
  });
});

router.get('/docs', (req, res) => {
  res.json({
    name: 'SabziGhar API',
    version: '1.0.0',
    baseUrl: '/api',
    auth: 'Bearer JWT in Authorization header. Roles: user | admin | delivery.',
    endpoints: {
      auth: [
        'POST /auth/register',
        'POST /auth/login',
        'POST /auth/admin-login',
        'POST /auth/delivery/register',
        'POST /auth/delivery/login',
        'POST /auth/forgot-password',
        'POST /auth/reset-password',
        'GET  /auth/me',
      ],
      users: [
        'PUT /users/profile',
        'PUT /users/change-password',
        'GET /users/addresses',
        'POST /users/addresses',
        'PUT /users/addresses/:id',
        'DELETE /users/addresses/:id',
      ],
      categories: ['GET /categories', 'GET /categories/:slug', 'POST/PUT/DELETE (admin)'],
      products: [
        'GET /products',
        'GET /products/:slug',
        'GET /products/admin/all (admin)',
        'POST/PUT/DELETE /products (admin)',
      ],
      cart: [
        'GET /cart',
        'POST /cart',
        'PUT /cart/item/:itemId',
        'DELETE /cart/item/:itemId',
        'DELETE /cart',
        'POST /cart/coupon',
        'DELETE /cart/coupon',
      ],
      coupons: ['GET /coupons', 'GET /coupons/admin (admin)', 'POST/PUT/DELETE (admin)'],
      banners: ['GET /banners', 'POST/PUT/DELETE (admin)'],
      orders: [
        'POST /orders',
        'GET /orders',
        'GET /orders/:id',
        'PUT /orders/:id/cancel',
      ],
      notifications: ['GET /notifications', 'PUT /notifications/read-all', 'PUT /notifications/:id/read'],
      upload: ['POST /upload (admin, multipart field "images")'],
      settings: ['GET /settings', 'PUT /settings (admin)'],
      admin: [
        'GET /admin/dashboard',
        'GET /admin/analytics?range=daily|weekly|monthly',
        'GET /admin/low-stock',
        'GET /admin/sales-report?from=&to=',
        'GET /admin/orders?status=&search=',
        'PUT /admin/orders/:id/status',
        'PUT /admin/orders/:id/assign',
        'GET /admin/users',
        'PUT /admin/users/:id/block',
        'GET /admin/delivery-boys',
        'POST /admin/delivery-boys',
        'PUT /admin/delivery-boys/:id',
        'DELETE /admin/delivery-boys/:id',
      ],
      delivery: [
        'GET /delivery/orders',
        'GET /delivery/history',
        'GET /delivery/stats',
        'GET /delivery/order/:id',
        'PUT /delivery/order/:id/status',
        'PUT /delivery/order/:id/cod',
      ],
    },
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/coupons', couponRoutes);
router.use('/banners', bannerRoutes);
router.use('/orders', orderRoutes);
router.use('/notifications', notificationRoutes);
router.use('/upload', uploadRoutes);
router.use('/settings', settingRoutes);
router.use('/admin', adminRoutes);
router.use('/delivery', deliveryRoutes);

export default router;
