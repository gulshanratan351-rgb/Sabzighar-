import Category from '../models/Category.js';
import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { slugify, fileUrl } from '../utils/helpers.js';

// @route GET /api/categories
export const getCategories = asyncHandler(async (req, res) => {
  const filter = req.query.all ? {} : { isActive: true };
  const categories = await Category.find(filter).sort({ order: 1, name: 1 });
  res.json({ success: true, categories });
});

// @route GET /api/categories/:slug
export const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) throw new ApiError(404, 'Category not found');
  res.json({ success: true, category });
});

// @route POST /api/categories  (admin)
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, icon, order } = req.body;
  const category = await Category.create({
    name,
    slug: slugify(name),
    description,
    icon,
    order,
    image: req.file ? fileUrl(req, req.file.filename) : req.body.image || '',
  });
  res.status(201).json({ success: true, category });
});

// @route PUT /api/categories/:id  (admin)
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, 'Category not found');
  const { name, description, icon, order, isActive } = req.body;
  if (name) {
    category.name = name;
    category.slug = slugify(name);
  }
  if (description !== undefined) category.description = description;
  if (icon !== undefined) category.icon = icon;
  if (order !== undefined) category.order = order;
  if (isActive !== undefined) category.isActive = isActive;
  if (req.file) category.image = fileUrl(req, req.file.filename);
  else if (req.body.image !== undefined) category.image = req.body.image;
  await category.save();
  res.json({ success: true, category });
});

// @route DELETE /api/categories/:id  (admin)
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, 'Category not found');
  const count = await Product.countDocuments({ category: category._id });
  if (count > 0) throw new ApiError(400, `Cannot delete: ${count} products use this category`);
  await category.deleteOne();
  res.json({ success: true, message: 'Category deleted' });
});
