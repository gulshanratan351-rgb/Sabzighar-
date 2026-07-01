import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProductsAdmin,
} from '../controllers/productController.js';

const router = Router();

router.get('/', getProducts);
router.get('/admin/all', protect, authorize('admin'), getAllProductsAdmin);
router.get('/:slug', getProduct);

router.post('/', protect, authorize('admin'), upload.array('images', 6), createProduct);
router.put('/:id', protect, authorize('admin'), upload.array('images', 6), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

export default router;
