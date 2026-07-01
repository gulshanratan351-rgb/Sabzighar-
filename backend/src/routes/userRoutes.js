import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import {
  updateProfile,
  changePassword,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} from '../controllers/userController.js';

const router = Router();

router.use(protect);

router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.get('/addresses', getAddresses);
router.post('/addresses', addAddress);
router.put('/addresses/:id', updateAddress);
router.delete('/addresses/:id', deleteAddress);

export default router;
