import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getPublicCoupons,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '../controllers/couponController.js';

const router = Router();

router.get('/', getPublicCoupons);
router.get('/admin', protect, authorize('admin'), getCoupons);
router.post('/', protect, authorize('admin'), createCoupon);
router.put('/:id', protect, authorize('admin'), updateCoupon);
router.delete('/:id', protect, authorize('admin'), deleteCoupon);

export default router;
