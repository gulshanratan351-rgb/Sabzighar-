import crypto from 'crypto';
import User from '../models/User.js';
import DeliveryBoy from '../models/DeliveryBoy.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { signToken } from '../utils/token.js';
import env from '../config/env.js';

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  avatar: user.avatar,
  addresses: user.addresses,
});

// @route POST /api/auth/register  (customers)
export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw new ApiError(400, 'Email already registered');

  const user = await User.create({ name, email, phone, password, role: 'user' });
  const token = signToken({ id: user._id, role: user.role });
  res.status(201).json({ success: true, token, user: publicUser(user) });
});

// @route POST /api/auth/login  (customers + owner-admin)
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) throw new ApiError(401, 'Invalid email or password');
  if (user.isBlocked) throw new ApiError(403, 'Your account is blocked');

  const match = await user.matchPassword(password);
  if (!match) throw new ApiError(401, 'Invalid email or password');

  const token = signToken({ id: user._id, role: user.role });
  res.json({ success: true, token, user: publicUser(user) });
});

// @route POST /api/auth/admin-login  (owner Gmail ONLY)
export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (email.toLowerCase() !== env.ownerEmail) {
    throw new ApiError(403, 'This email is not authorized for admin access');
  }
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || user.role !== 'admin') throw new ApiError(401, 'Admin account not found');

  const match = await user.matchPassword(password);
  if (!match) throw new ApiError(401, 'Invalid credentials');

  const token = signToken({ id: user._id, role: user.role });
  res.json({ success: true, token, user: publicUser(user) });
});

// @route POST /api/auth/delivery/register
export const deliveryRegister = asyncHandler(async (req, res) => {
  const { name, email, phone, password, vehicleNumber, area } = req.body;
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw new ApiError(400, 'Email already registered');

  const user = await User.create({ name, email, phone, password, role: 'delivery' });
  await DeliveryBoy.create({ user: user._id, vehicleNumber, area });

  const token = signToken({ id: user._id, role: user.role });
  res.status(201).json({ success: true, token, user: publicUser(user) });
});

// @route POST /api/auth/delivery/login
export const deliveryLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || user.role !== 'delivery') throw new ApiError(401, 'Delivery account not found');
  if (user.isBlocked) throw new ApiError(403, 'Your account is blocked');

  const match = await user.matchPassword(password);
  if (!match) throw new ApiError(401, 'Invalid credentials');

  const token = signToken({ id: user._id, role: user.role });
  res.json({ success: true, token, user: publicUser(user) });
});

// @route GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: publicUser(req.user) });
});

// @route POST /api/auth/forgot-password  -> returns OTP (demo: returned in response)
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new ApiError(404, 'No account with this email');

  const otp = ('' + Math.floor(100000 + Math.random() * 900000));
  user.resetOtp = crypto.createHash('sha256').update(otp).digest('hex');
  user.resetOtpExpire = Date.now() + 10 * 60 * 1000; // 10 min
  await user.save();

  // In production you'd email/SMS the OTP. For this app we return it (demo mode).
  res.json({
    success: true,
    message: 'OTP generated. Use it to reset your password.',
    otp: env.nodeEnv === 'production' ? undefined : otp,
    devOtp: otp,
  });
});

// @route POST /api/auth/reset-password
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, password } = req.body;
  const hashed = crypto.createHash('sha256').update(otp).digest('hex');
  const user = await User.findOne({
    email: email.toLowerCase(),
    resetOtp: hashed,
    resetOtpExpire: { $gt: Date.now() },
  }).select('+resetOtp +resetOtpExpire');

  if (!user) throw new ApiError(400, 'Invalid or expired OTP');

  user.password = password;
  user.resetOtp = undefined;
  user.resetOtpExpire = undefined;
  await user.save();

  res.json({ success: true, message: 'Password reset successful. Please login.' });
});
