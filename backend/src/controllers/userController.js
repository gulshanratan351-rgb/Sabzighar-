import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// @route PUT /api/users/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;
  const user = await User.findById(req.user._id);
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (avatar !== undefined) user.avatar = avatar;
  await user.save();
  res.json({ success: true, user });
});

// @route PUT /api/users/change-password
export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  const ok = await user.matchPassword(oldPassword);
  if (!ok) throw new ApiError(400, 'Old password is incorrect');
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password changed' });
});

// ---- Addresses ----

// @route GET /api/users/addresses
export const getAddresses = asyncHandler(async (req, res) => {
  res.json({ success: true, addresses: req.user.addresses });
});

// @route POST /api/users/addresses
export const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const addr = req.body;
  if (addr.isDefault || user.addresses.length === 0) {
    user.addresses.forEach((a) => {
      a.isDefault = false;
    });
    addr.isDefault = true;
  }
  user.addresses.push(addr);
  await user.save();
  res.status(201).json({ success: true, addresses: user.addresses });
});

// @route PUT /api/users/addresses/:id
export const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const addr = user.addresses.id(req.params.id);
  if (!addr) throw new ApiError(404, 'Address not found');
  Object.assign(addr, req.body);
  if (req.body.isDefault) {
    user.addresses.forEach((a) => {
      a.isDefault = a._id.equals(addr._id);
    });
  }
  await user.save();
  res.json({ success: true, addresses: user.addresses });
});

// @route DELETE /api/users/addresses/:id
export const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const addr = user.addresses.id(req.params.id);
  if (!addr) throw new ApiError(404, 'Address not found');
  addr.deleteOne();
  await user.save();
  res.json({ success: true, addresses: user.addresses });
});
