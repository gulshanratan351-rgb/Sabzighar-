import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import Setting from '../models/Setting.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { packPrice, packStockUnits, computeTotals } from '../utils/pricing.js';

// Build a rich cart response with current prices, stock validation and totals.
const buildCartResponse = async (cart) => {
  await cart.populate('items.product');
  await cart.populate('coupon');

  const items = [];
  for (const item of cart.items) {
    const p = item.product;
    if (!p || !p.isActive) continue; // product removed/disabled
    const unitPrice = packPrice(p, {
      unitType: item.unitType,
      grams: item.grams,
      pieces: item.pieces,
    });
    const stockNeeded = packStockUnits(item) * item.quantity;
    items.push({
      _id: item._id,
      product: {
        _id: p._id,
        name: p.name,
        slug: p.slug,
        image: p.images?.[0] || '',
        unitType: p.unitType,
        stock: p.stock,
        price: p.price,
        mrp: p.mrp,
      },
      unitType: item.unitType,
      grams: item.grams,
      pieces: item.pieces,
      quantity: item.quantity,
      label: item.label,
      unitPrice,
      lineTotal: unitPrice * item.quantity,
      inStock: p.stock >= stockNeeded,
    });
  }

  const settings = await Setting.findOne({ key: 'global' });

  let discount = 0;
  let couponCode = '';
  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
  if (cart.coupon) {
    const valid = cart.coupon.isValid(subtotal);
    if (valid.ok) {
      discount = cart.coupon.calcDiscount(subtotal);
      couponCode = cart.coupon.code;
    }
  }

  const totals = computeTotals(items, { discount, settings });
  return {
    _id: cart._id,
    items,
    couponCode,
    ...totals,
  };
};

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
};

// @route GET /api/cart
export const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  res.json({ success: true, cart: await buildCartResponse(cart) });
});

// @route POST /api/cart  { productId, unitType, grams, pieces, quantity, label }
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, grams = 0, pieces = 0, quantity = 1, label } = req.body;
  const product = await Product.findById(productId);
  if (!product || !product.isActive) throw new ApiError(404, 'Product not available');
  if (product.stock <= 0) throw new ApiError(400, 'Product is out of stock');

  const unitType = product.unitType;
  const g = unitType === 'weight' ? Number(grams) : 0;
  const pc = unitType === 'piece' ? Number(pieces) : 0;
  if (unitType === 'weight' && g <= 0) throw new ApiError(400, 'Select a valid weight');
  if (unitType === 'piece' && pc <= 0) throw new ApiError(400, 'Select a valid quantity');

  const cart = await getOrCreateCart(req.user._id);

  // Merge same option lines
  const existing = cart.items.find(
    (i) =>
      i.product.equals(product._id) &&
      i.unitType === unitType &&
      i.grams === g &&
      i.pieces === pc
  );

  const needUnits = packStockUnits({ unitType, grams: g, pieces: pc });
  const currentQty = existing ? existing.quantity : 0;
  const totalUnits = needUnits * (currentQty + Number(quantity));
  if (totalUnits > product.stock) throw new ApiError(400, 'Not enough stock available');

  const unitPrice = packPrice(product, { unitType, grams: g, pieces: pc });

  if (existing) {
    existing.quantity += Number(quantity);
    existing.unitPrice = unitPrice;
  } else {
    cart.items.push({
      product: product._id,
      unitType,
      grams: g,
      pieces: pc,
      quantity: Number(quantity),
      label: label || (unitType === 'weight' ? `${g} g` : `${pc} pc`),
      unitPrice,
    });
  }
  await cart.save();
  res.status(201).json({ success: true, cart: await buildCartResponse(cart) });
});

// @route PUT /api/cart/item/:itemId  { quantity }
export const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.id(req.params.itemId);
  if (!item) throw new ApiError(404, 'Cart item not found');

  if (Number(quantity) <= 0) {
    item.deleteOne();
  } else {
    const product = await Product.findById(item.product);
    const needUnits = packStockUnits(item) * Number(quantity);
    if (product && needUnits > product.stock) throw new ApiError(400, 'Not enough stock available');
    item.quantity = Number(quantity);
  }
  await cart.save();
  res.json({ success: true, cart: await buildCartResponse(cart) });
});

// @route DELETE /api/cart/item/:itemId
export const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.id(req.params.itemId);
  if (!item) throw new ApiError(404, 'Cart item not found');
  item.deleteOne();
  await cart.save();
  res.json({ success: true, cart: await buildCartResponse(cart) });
});

// @route DELETE /api/cart
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  cart.coupon = null;
  await cart.save();
  res.json({ success: true, cart: await buildCartResponse(cart) });
});

// @route POST /api/cart/coupon  { code }
export const applyCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const cart = await getOrCreateCart(req.user._id);
  await cart.populate('items.product');

  const subtotal = cart.items.reduce((s, i) => {
    const p = i.product;
    if (!p) return s;
    return s + packPrice(p, i) * i.quantity;
  }, 0);

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) throw new ApiError(404, 'Invalid coupon code');
  const valid = coupon.isValid(subtotal);
  if (!valid.ok) throw new ApiError(400, valid.reason);

  cart.coupon = coupon._id;
  await cart.save();
  res.json({ success: true, cart: await buildCartResponse(cart) });
});

// @route DELETE /api/cart/coupon
export const removeCoupon = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.coupon = null;
  await cart.save();
  res.json({ success: true, cart: await buildCartResponse(cart) });
});

export { buildCartResponse };
