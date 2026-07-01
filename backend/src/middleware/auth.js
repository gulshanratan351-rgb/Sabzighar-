import User from '../models/User.js';
import { verifyToken } from '../utils/token.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) token = header.split(' ')[1];

  if (!token) throw new ApiError(401, 'Not authorized, no token');

  const decoded = verifyToken(token);
  const user = await User.findById(decoded.id);
  if (!user) throw new ApiError(401, 'User not found');
  if (user.isBlocked) throw new ApiError(403, 'Your account is blocked');

  req.user = user;
  next();
});

// Role guard: authorize('admin'), authorize('admin','delivery')
export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, `Access denied for role: ${req.user?.role || 'guest'}`));
    }
    return next();
  };
