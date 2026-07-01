import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getAssignedOrders,
  getDeliveryHistory,
  getDeliveryOrder,
  updateDeliveryStatus,
  markCodCollected,
  getDeliveryStats,
} from '../controllers/deliveryController.js';

const router = Router();

router.use(protect, authorize('delivery'));

router.get('/orders', getAssignedOrders);
router.get('/history', getDeliveryHistory);
router.get('/stats', getDeliveryStats);
router.get('/order/:id', getDeliveryOrder);
router.put('/order/:id/status', updateDeliveryStatus);
router.put('/order/:id/cod', markCodCollected);

export default router;
