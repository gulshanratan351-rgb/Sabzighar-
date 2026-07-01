import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import { uploadImages } from '../controllers/uploadController.js';

const router = Router();

router.post('/', protect, authorize('admin'), upload.array('images', 6), uploadImages);

export default router;
