import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from '../controllers/bannerController.js';

const router = Router();

router.get('/', getBanners);
router.post('/', protect, authorize('admin'), upload.single('image'), createBanner);
router.put('/:id', protect, authorize('admin'), upload.single('image'), updateBanner);
router.delete('/:id', protect, authorize('admin'), deleteBanner);

export default router;
