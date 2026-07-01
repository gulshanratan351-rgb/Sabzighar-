import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { getSettings, updateSettings } from '../controllers/settingController.js';

const router = Router();

router.get('/', getSettings);
router.put('/', protect, authorize('admin'), updateSettings);

export default router;
