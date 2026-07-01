import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { fileUrl } from '../utils/helpers.js';

// @route POST /api/upload  (admin) — single or multiple images
export const uploadImages = asyncHandler(async (req, res) => {
  const files = req.files || (req.file ? [req.file] : []);
  if (!files.length) throw new ApiError(400, 'No image uploaded');
  const urls = files.map((f) => fileUrl(req, f.filename));
  res.status(201).json({ success: true, urls, url: urls[0] });
});
