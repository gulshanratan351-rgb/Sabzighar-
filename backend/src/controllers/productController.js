import Product from '../models/Product.js';
import Category from '../models/Category.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  slugify,
  fileUrl,
  defaultWeightOptions,
  defaultPieceOptions,
} from '../utils/helpers.js';

const parseOptions = (body) => {
  if (body.options) {
    try {
      return typeof body.options === 'string' ? JSON.parse(body.options) : body.options;
    } catch {
      return null;
    }
  }
  return null;
};

// @route GET /api/products
// query: search, category(slug), sort, offers, organic, page, limit, inStock
export const getProducts = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    sort = 'new',
    offers,
    organic,
    featured,
    inStock,
    page = 1,
    limit = 50,
  } = req.query;

  const filter = { isActive: true };

  if (search) filter.name = { $regex: search, $options: 'i' };
  if (organic === 'true') filter.isOrganic = true;
  if (featured === 'true') filter.isFeatured = true;
  if (inStock === 'true') filter.stock = { $gt: 0 };

  if (category && category !== 'offers') {
    const cat = await Category.findOne({ slug: category });
    if (cat) filter.category = cat._id;
    else return res.json({ success: true, products: [], total: 0 });
  }

  let query = Product.find(filter).populate('category', 'name slug');

  // offers = products with discount
  if (offers === 'true' || category === 'offers') {
    query = query.where('mrp').gt(0);
  }

  const sortMap = {
    new: { createdAt: -1 },
    priceLow: { price: 1 },
    priceHigh: { price: -1 },
    popular: { soldCount: -1 },
  };
  query = query.sort(sortMap[sort] || sortMap.new);

  const perPage = Math.min(Number(limit), 100);
  const skip = (Number(page) - 1) * perPage;
  const [products, total] = await Promise.all([
    query.skip(skip).limit(perPage),
    Product.countDocuments(filter),
  ]);

  let result = products;
  if (offers === 'true' || category === 'offers') {
    result = products.filter((p) => p.discount > 0);
  }

  res.json({ success: true, products: result, total, page: Number(page) });
});

// @route GET /api/products/:slug
export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug }).populate('category', 'name slug');
  if (!product) throw new ApiError(404, 'Product not found');
  const related = await Product.find({
    category: product.category._id,
    _id: { $ne: product._id },
    isActive: true,
  })
    .limit(6)
    .populate('category', 'name slug');
  res.json({ success: true, product, related });
});

// @route POST /api/products  (admin)
export const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    category,
    unitType = 'weight',
    mrp,
    price,
    stock,
    lowStockThreshold,
    isOrganic,
    isFeatured,
    tags,
  } = req.body;

  const cat = await Category.findById(category);
  if (!cat) throw new ApiError(400, 'Invalid category');

  const images = [];
  if (req.files && req.files.length) {
    req.files.forEach((f) => images.push(fileUrl(req, f.filename)));
  }
  if (req.body.images) {
    const extra = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    extra.forEach((u) => u && images.push(u));
  }

  let options = parseOptions(req.body);
  if (!options || !options.length) {
    options = unitType === 'weight' ? defaultWeightOptions() : defaultPieceOptions();
  }

  const product = await Product.create({
    name,
    slug: `${slugify(name)}-${Date.now().toString().slice(-5)}`,
    description,
    category,
    unitType,
    mrp: Number(mrp),
    price: Number(price),
    stock: Number(stock || 0),
    lowStockThreshold: lowStockThreshold ? Number(lowStockThreshold) : undefined,
    images,
    options,
    isOrganic: isOrganic === 'true' || isOrganic === true,
    isFeatured: isFeatured === 'true' || isFeatured === true,
    tags: tags ? (Array.isArray(tags) ? tags : String(tags).split(',').map((t) => t.trim())) : [],
  });

  res.status(201).json({ success: true, product });
});

// @route PUT /api/products/:id  (admin)  — admin can change price anytime
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');

  const fields = [
    'name',
    'description',
    'category',
    'unitType',
    'mrp',
    'price',
    'stock',
    'lowStockThreshold',
  ];
  fields.forEach((f) => {
    if (req.body[f] !== undefined && req.body[f] !== '') {
      product[f] = ['mrp', 'price', 'stock', 'lowStockThreshold'].includes(f)
        ? Number(req.body[f])
        : req.body[f];
    }
  });
  if (req.body.name) product.slug = `${slugify(req.body.name)}-${String(product._id).slice(-5)}`;

  if (req.body.isOrganic !== undefined)
    product.isOrganic = req.body.isOrganic === 'true' || req.body.isOrganic === true;
  if (req.body.isFeatured !== undefined)
    product.isFeatured = req.body.isFeatured === 'true' || req.body.isFeatured === true;
  if (req.body.isActive !== undefined)
    product.isActive = req.body.isActive === 'true' || req.body.isActive === true;

  const opts = parseOptions(req.body);
  if (opts && opts.length) product.options = opts;

  if (req.body.tags !== undefined) {
    product.tags = Array.isArray(req.body.tags)
      ? req.body.tags
      : String(req.body.tags).split(',').map((t) => t.trim()).filter(Boolean);
  }

  // Images: keep existing (from body.images) + newly uploaded
  const images = [];
  if (req.body.images) {
    const keep = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    keep.forEach((u) => u && images.push(u));
  }
  if (req.files && req.files.length) {
    req.files.forEach((f) => images.push(fileUrl(req, f.filename)));
  }
  if (images.length) product.images = images;

  await product.save();
  res.json({ success: true, product });
});

// @route DELETE /api/products/:id  (admin)
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');
  await product.deleteOne();
  res.json({ success: true, message: 'Product deleted' });
});

// @route GET /api/products/admin/all  (admin) — includes inactive
export const getAllProductsAdmin = asyncHandler(async (req, res) => {
  const products = await Product.find({}).populate('category', 'name slug').sort({ createdAt: -1 });
  res.json({ success: true, products });
});
