import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import {
  register,
  login,
  adminLogin,
  deliveryRegister,
  deliveryLogin,
  getMe,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';

const router = Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  register
);

router.post(
  '/login',
  [body('email').isEmail().withMessage('Valid email required'), body('password').notEmpty()],
  validate,
  login
);

router.post(
  '/admin-login',
  [body('email').isEmail(), body('password').notEmpty()],
  validate,
  adminLogin
);

router.post(
  '/delivery/register',
  [
    body('name').trim().notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
  ],
  validate,
  deliveryRegister
);

router.post('/delivery/login', [body('email').isEmail(), body('password').notEmpty()], validate, deliveryLogin);

router.post('/forgot-password', [body('email').isEmail()], validate, forgotPassword);
router.post(
  '/reset-password',
  [body('email').isEmail(), body('otp').notEmpty(), body('password').isLength({ min: 6 })],
  validate,
  resetPassword
);

router.get('/me', protect, getMe);

export default router;
