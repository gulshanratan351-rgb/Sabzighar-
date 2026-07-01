import Banner from '../models/Banner.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { fileUrl } from '../utils/helpers.js';

// @route GET /api/banners  (public active)
export const getBanners = asyncHandler(async (req, res) => {
  const filter = req.query.all ? {} : { isActive: true };
  const banners = await Banner.find(filter).sort({ order: 1, createdAt: -1 });
  res.json({ success: true, banners });
});

// @route POST /api/banners  (admin)
export const createBanner = asyncHandler(async (req, res) => {
  const image = req.file ? fileUrl(req, req.file.filename) : req.body.image;
  if (!image) throw new ApiError(400, 'Banner image is required');
  const banner = await Banner.create({
    title: req.body.title,
    subtitle: req.body.subtitle,
    link: req.body.link,
    order: req.body.order,
    image,
  });
  res.status(201).json({ success: true, banner });
});

// @route PUT /api/banners/:id  (admin)
export const updateBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) throw new ApiError(404, 'Banner not found');
  const { title, subtitle, link, order, isActive } = req.body;
  if (title !== undefined) banner.title = title;
  if (subtitle !== undefined) banner.subtitle = subtitle;
  if (link !== undefined) banner.link = link;
  if (order !== undefined) banner.order = order;
  if (isActive !== undefined) banner.isActive = isActive;
  if (req.file) banner.image = fileUrl(req, req.file.filename);
  else if (req.body.image) banner.image = req.body.image;
  await banner.save();
  res.json({ success: true, banner });
});

// @route DELETE /api/banners/:id  (admin)
export const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) throw new ApiError(404, 'Banner not found');
  await banner.deleteOne();
  res.json({ success: true, message: 'Banner deleted' });
});
