import Order, { ORDER_STATUSES } from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import Payment from '../models/Payment.js';
import Setting from '../models/Setting.js';
import Notification from '../models/Notification.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { packPrice, packStockUnits, computeTotals } from '../utils/pricing.js';

// @route POST /api/orders  { addressId | address, paymentMethod, upiId }
export const placeOrder = asyncHandler(async (req, res) => {
  const { addressId, address: rawAddress, paymentMethod = 'COD', upiId } = req.body;

  const settings = await Setting.findOne({ key: 'global' });
  if (settings && !settings.isStoreOpen) throw new ApiError(400, 'Store is currently closed');
  if (paymentMethod === 'COD' && settings && !settings.codEnabled)
    throw new ApiError(400, 'COD is currently disabled');
  if (paymentMethod === 'UPI' && settings && !settings.upiEnabled)
    throw new ApiError(400, 'UPI is currently disabled');

  // Resolve address
  let address = rawAddress;
  if (addressId) {
    const a = req.user.addresses.id(addressId);
    if (!a) throw new ApiError(400, 'Address not found');
    address = a.toObject();
  }
  if (!address || !address.phone || !address.pincode)
    throw new ApiError(400, 'Valid delivery address required');

  // Service pincode check
  if (settings?.servicePincodes?.length && !settings.servicePincodes.includes(address.pincode)) {
    throw new ApiError(400, `We do not deliver to pincode ${address.pincode} yet`);
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product').populate('coupon');
  if (!cart || cart.items.length === 0) throw new ApiError(400, 'Cart is empty');

  // Build order items + validate stock
  const items = [];
  for (const it of cart.items) {
    const p = it.product;
    if (!p || !p.isActive) throw new ApiError(400, 'A product in your cart is unavailable');
    const unitsNeeded = packStockUnits(it) * it.quantity;
    if (p.stock < unitsNeeded) throw new ApiError(400, `${p.name} is out of stock`);
    const unitPrice = packPrice(p, it);
    items.push({
      product: p._id,
      name: p.name,
      image: p.images?.[0] || '',
      unitType: it.unitType,
      grams: it.grams,
      pieces: it.pieces,
      quantity: it.quantity,
      label: it.label,
      unitPrice,
      lineTotal: unitPrice * it.quantity,
      _stockUnits: unitsNeeded,
      _productRef: p,
    });
  }

  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);

  // Coupon
  let discount = 0;
  let couponCode = '';
  if (cart.coupon) {
    const valid = cart.coupon.isValid(subtotal);
    if (valid.ok) {
      discount = cart.coupon.calcDiscount(subtotal);
      couponCode = cart.coupon.code;
    }
  }

  const totals = computeTotals(items, { discount, settings });

  // Create order
  const order = await Order.create({
    user: req.user._id,
    items: items.map(({ _stockUnits, _productRef, ...rest }) => rest),
    address,
    subtotal: totals.subtotal,
    discount: totals.discount,
    couponCode,
    deliveryCharge: totals.deliveryCharge,
    total: totals.total,
    paymentMethod,
    paymentStatus: paymentMethod === 'UPI' ? 'Paid' : 'Pending',
    codAmount: paymentMethod === 'COD' ? totals.total : 0,
    status: 'Pending',
    statusHistory: [{ status: 'Pending', at: new Date(), note: 'Order placed' }],
  });

  // Reduce stock + soldCount
  for (const it of items) {
    const p = it._productRef;
    p.stock = Math.max(p.stock - it._stockUnits, 0);
    p.soldCount += it.quantity;
    await p.save();
  }

  // Payment record
  await Payment.create({
    order: order._id,
    user: req.user._id,
    method: paymentMethod,
    amount: totals.total,
    status: paymentMethod === 'UPI' ? 'Paid' : 'Pending',
    upiId: paymentMethod === 'UPI' ? upiId || '' : '',
    transactionId: paymentMethod === 'UPI' ? `TXN${Date.now()}` : '',
  });

  // Coupon usage
  if (couponCode) await Coupon.updateOne({ code: couponCode }, { $inc: { usedCount: 1 } });

  // Clear cart
  cart.items = [];
  cart.coupon = null;
  await cart.save();

  // Notification
  await Notification.create({
    user: req.user._id,
    title: 'Order placed successfully',
    message: `Your order ${order.orderNo} for ₹${order.total} has been placed.`,
    type: 'order',
    link: `/orders/${order._id}`,
  });

  res.status(201).json({ success: true, order });
});

// @route GET /api/orders  (my orders)
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, orders });
});

// @route GET /api/orders/:id
export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('deliveryBoy', 'name phone')
    .populate('user', 'name phone email');
  if (!order) throw new ApiError(404, 'Order not found');
  // Only owner, admin or assigned delivery boy
  const isOwner = order.user._id.equals(req.user._id);
  const isAdmin = req.user.role === 'admin';
  const isDelivery = order.deliveryBoy && order.deliveryBoy._id.equals(req.user._id);
  if (!isOwner && !isAdmin && !isDelivery) throw new ApiError(403, 'Access denied');
  res.json({ success: true, order });
});

// @route PUT /api/orders/:id/cancel  (user)
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');
  if (!order.user.equals(req.user._id)) throw new ApiError(403, 'Access denied');

  const cancellable = ['Pending', 'Confirmed', 'Packed'];
  if (!cancellable.includes(order.status))
    throw new ApiError(400, `Cannot cancel order in "${order.status}" stage`);

  order.status = 'Cancelled';
  order.cancelReason = req.body.reason || 'Cancelled by user';
  order.statusHistory.push({ status: 'Cancelled', at: new Date(), note: order.cancelReason });
  await order.save();

  // Restore stock
  for (const it of order.items) {
    const p = await Product.findById(it.product);
    if (p) {
      const units = it.unitType === 'weight' ? it.grams : it.pieces;
      p.stock += units * it.quantity;
      p.soldCount = Math.max(p.soldCount - it.quantity, 0);
      await p.save();
    }
  }

  await Notification.create({
    user: order.user,
    title: 'Order cancelled',
    message: `Your order ${order.orderNo} has been cancelled.`,
    type: 'order',
    link: `/orders/${order._id}`,
  });

  res.json({ success: true, order });
});

export { ORDER_STATUSES };
