import Order, { ORDER_STATUSES } from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import DeliveryBoy from '../models/DeliveryBoy.js';
import Notification from '../models/Notification.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// ---------------- Dashboard ----------------

// @route GET /api/admin/dashboard
export const getDashboard = asyncHandler(async (req, res) => {
  const [
    totalOrders,
    pendingOrders,
    deliveredOrders,
    totalUsers,
    totalProducts,
    totalDeliveryBoys,
    revenueAgg,
    lowStock,
  ] = await Promise.all([
    Order.countDocuments({}),
    Order.countDocuments({ status: { $in: ['Pending', 'Confirmed', 'Packed', 'Assigned', 'Out for Delivery'] } }),
    Order.countDocuments({ status: 'Delivered' }),
    User.countDocuments({ role: 'user' }),
    Product.countDocuments({}),
    User.countDocuments({ role: 'delivery' }),
    Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Product.find({ $expr: { $lte: ['$stock', '$lowStockThreshold'] } })
      .select('name stock lowStockThreshold unitType')
      .limit(20),
  ]);

  const revenue = revenueAgg[0]?.total || 0;

  // Today's sales
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const todayAgg = await Order.aggregate([
    { $match: { createdAt: { $gte: startOfDay }, status: { $ne: 'Cancelled' } } },
    { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
  ]);

  const recentOrders = await Order.find({})
    .sort({ createdAt: -1 })
    .limit(8)
    .populate('user', 'name');

  res.json({
    success: true,
    stats: {
      totalOrders,
      pendingOrders,
      deliveredOrders,
      totalUsers,
      totalProducts,
      totalDeliveryBoys,
      revenue,
      todaySales: todayAgg[0]?.total || 0,
      todayOrders: todayAgg[0]?.count || 0,
      lowStockCount: lowStock.length,
    },
    lowStock,
    recentOrders,
  });
});

// @route GET /api/admin/analytics?range=daily|weekly|monthly
export const getAnalytics = asyncHandler(async (req, res) => {
  const range = req.query.range || 'daily';
  const now = new Date();
  let since = new Date();
  let groupFmt = '%Y-%m-%d';

  if (range === 'daily') {
    since.setDate(now.getDate() - 13); // last 14 days
    groupFmt = '%Y-%m-%d';
  } else if (range === 'weekly') {
    since.setDate(now.getDate() - 7 * 11); // last 12 weeks
    groupFmt = '%Y-%U';
  } else {
    since.setMonth(now.getMonth() - 11); // last 12 months
    groupFmt = '%Y-%m';
  }
  since.setHours(0, 0, 0, 0);

  const data = await Order.aggregate([
    { $match: { createdAt: { $gte: since }, status: { $ne: 'Cancelled' } } },
    {
      $group: {
        _id: { $dateToString: { format: groupFmt, date: '$createdAt' } },
        sales: { $sum: '$total' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Top selling products
  const topProducts = await Product.find({})
    .sort({ soldCount: -1 })
    .limit(8)
    .select('name soldCount price images');

  res.json({ success: true, range, data, topProducts });
});

// @route GET /api/admin/low-stock
export const getLowStock = asyncHandler(async (req, res) => {
  const products = await Product.find({ $expr: { $lte: ['$stock', '$lowStockThreshold'] } })
    .populate('category', 'name')
    .sort({ stock: 1 });
  res.json({ success: true, products });
});

// @route GET /api/admin/sales-report?from=&to=
export const getSalesReport = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const match = { status: { $ne: 'Cancelled' } };
  if (from || to) {
    match.createdAt = {};
    if (from) match.createdAt.$gte = new Date(from);
    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      match.createdAt.$lte = end;
    }
  }
  const orders = await Order.find(match).sort({ createdAt: -1 }).populate('user', 'name');
  const summary = orders.reduce(
    (acc, o) => {
      acc.totalSales += o.total;
      acc.totalDiscount += o.discount;
      acc.count += 1;
      acc[o.paymentMethod] = (acc[o.paymentMethod] || 0) + o.total;
      return acc;
    },
    { totalSales: 0, totalDiscount: 0, count: 0, COD: 0, UPI: 0 }
  );
  res.json({ success: true, orders, summary });
});

// ---------------- Order management ----------------

// @route GET /api/admin/orders?status=&search=
export const getAllOrders = asyncHandler(async (req, res) => {
  const { status, search } = req.query;
  const filter = {};
  if (status && status !== 'all') filter.status = status;
  if (search) filter.orderNo = { $regex: search, $options: 'i' };
  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .populate('user', 'name phone')
    .populate('deliveryBoy', 'name phone');
  res.json({ success: true, orders });
});

// @route PUT /api/admin/orders/:id/status  { status }
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  if (!ORDER_STATUSES.includes(status)) throw new ApiError(400, 'Invalid status');
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');

  order.status = status;
  order.statusHistory.push({ status, at: new Date(), note: note || '' });
  if (status === 'Delivered') {
    order.deliveredAt = new Date();
    if (order.paymentMethod === 'COD') {
      order.paymentStatus = 'Paid';
      order.codCollected = true;
    }
  }
  await order.save();

  await Notification.create({
    user: order.user,
    title: `Order ${status}`,
    message: `Your order ${order.orderNo} is now "${status}".`,
    type: 'order',
    link: `/orders/${order._id}`,
  });

  res.json({ success: true, order });
});

// @route PUT /api/admin/orders/:id/assign  { deliveryBoyId }
export const assignDeliveryBoy = asyncHandler(async (req, res) => {
  const { deliveryBoyId } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');
  const boy = await User.findOne({ _id: deliveryBoyId, role: 'delivery' });
  if (!boy) throw new ApiError(400, 'Invalid delivery boy');

  order.deliveryBoy = boy._id;
  if (['Pending', 'Confirmed', 'Packed'].includes(order.status)) {
    order.status = 'Assigned';
  }
  order.statusHistory.push({ status: 'Assigned', at: new Date(), note: `Assigned to ${boy.name}` });
  await order.save();

  await Notification.create({
    user: boy._id,
    title: 'New delivery assigned',
    message: `Order ${order.orderNo} has been assigned to you.`,
    type: 'order',
    link: `/orders/${order._id}`,
  });

  res.json({ success: true, order });
});

// ---------------- User management ----------------

// @route GET /api/admin/users
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });
  res.json({ success: true, users });
});

// @route PUT /api/admin/users/:id/block  { isBlocked }
export const toggleBlockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  if (user.role === 'admin') throw new ApiError(400, 'Cannot block an admin');
  user.isBlocked = req.body.isBlocked ?? !user.isBlocked;
  await user.save();
  res.json({ success: true, user });
});

// ---------------- Delivery boy management ----------------

// @route GET /api/admin/delivery-boys
export const getDeliveryBoys = asyncHandler(async (req, res) => {
  const boys = await User.find({ role: 'delivery' }).sort({ createdAt: -1 }).lean();
  const profiles = await DeliveryBoy.find({ user: { $in: boys.map((b) => b._id) } }).lean();
  const map = Object.fromEntries(profiles.map((p) => [String(p.user), p]));
  const result = boys.map((b) => ({ ...b, profile: map[String(b._id)] || null }));
  res.json({ success: true, deliveryBoys: result });
});

// @route POST /api/admin/delivery-boys  (admin creates one)
export const createDeliveryBoy = asyncHandler(async (req, res) => {
  const { name, email, phone, password, vehicleNumber, area, pincodes } = req.body;
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw new ApiError(400, 'Email already registered');
  const user = await User.create({ name, email, phone, password, role: 'delivery' });
  const profile = await DeliveryBoy.create({
    user: user._id,
    vehicleNumber,
    area,
    pincodes: pincodes
      ? Array.isArray(pincodes)
        ? pincodes
        : String(pincodes).split(',').map((p) => p.trim())
      : [],
  });
  res.status(201).json({ success: true, deliveryBoy: { ...user.toObject(), profile } });
});

// @route PUT /api/admin/delivery-boys/:id
export const updateDeliveryBoy = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, role: 'delivery' });
  if (!user) throw new ApiError(404, 'Delivery boy not found');
  const { name, phone, isBlocked, vehicleNumber, area, pincodes, isAvailable } = req.body;
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (isBlocked !== undefined) user.isBlocked = isBlocked;
  await user.save();

  let profile = await DeliveryBoy.findOne({ user: user._id });
  if (!profile) profile = await DeliveryBoy.create({ user: user._id });
  if (vehicleNumber !== undefined) profile.vehicleNumber = vehicleNumber;
  if (area !== undefined) profile.area = area;
  if (isAvailable !== undefined) profile.isAvailable = isAvailable;
  if (pincodes !== undefined) {
    profile.pincodes = Array.isArray(pincodes)
      ? pincodes
      : String(pincodes).split(',').map((p) => p.trim());
  }
  await profile.save();
  res.json({ success: true, deliveryBoy: { ...user.toObject(), profile } });
});

// @route DELETE /api/admin/delivery-boys/:id
export const deleteDeliveryBoy = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, role: 'delivery' });
  if (!user) throw new ApiError(404, 'Delivery boy not found');
  await DeliveryBoy.deleteOne({ user: user._id });
  await user.deleteOne();
  res.json({ success: true, message: 'Delivery boy removed' });
});
