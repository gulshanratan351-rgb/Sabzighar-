import Coupon from '../models/Coupon.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// @route GET /api/coupons  (public: active coupons for display)
export const getPublicCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({ isActive: true }).select(
    'code description discountType discountValue minOrder maxDiscount'
  );
  res.json({ success: true, coupons });
});

// @route GET /api/coupons/admin  (admin: all)
export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({}).sort({ createdAt: -1 });
  res.json({ success: true, coupons });
});

// @route POST /api/coupons  (admin)
export const createCoupon = asyncHandler(async (req, res) => {
  const data = { ...req.body, code: String(req.body.code).toUpperCase() };
  const coupon = await Coupon.create(data);
  res.status(201).json({ success: true, coupon });
});

// @route PUT /api/coupons/:id  (admin)
export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) throw new ApiError(404, 'Coupon not found');
  Object.assign(coupon, req.body);
  if (req.body.code) coupon.code = String(req.body.code).toUpperCase();
  await coupon.save();
  res.json({ success: true, coupon });
});

// @route DELETE /api/coupons/:id  (admin)
export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) throw new ApiError(404, 'Coupon not found');
  await coupon.deleteOne();
  res.json({ success: true, message: 'Coupon deleted' });
});
