import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getDashboard,
  getAnalytics,
  getLowStock,
  getSalesReport,
  getAllOrders,
  updateOrderStatus,
  assignDeliveryBoy,
  getUsers,
  toggleBlockUser,
  getDeliveryBoys,
  createDeliveryBoy,
  updateDeliveryBoy,
  deleteDeliveryBoy,
} from '../controllers/adminController.js';

const router = Router();

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/analytics', getAnalytics);
router.get('/low-stock', getLowStock);
router.get('/sales-report', getSalesReport);

router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.put('/orders/:id/assign', assignDeliveryBoy);

router.get('/users', getUsers);
router.put('/users/:id/block', toggleBlockUser);

router.get('/delivery-boys', getDeliveryBoys);
router.post('/delivery-boys', createDeliveryBoy);
router.put('/delivery-boys/:id', updateDeliveryBoy);
router.delete('/delivery-boys/:id', deleteDeliveryBoy);

export default router;
