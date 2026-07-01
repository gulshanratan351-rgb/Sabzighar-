import Order from '../models/Order.js';
import DeliveryBoy from '../models/DeliveryBoy.js';
import Notification from '../models/Notification.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// Allowed status transitions a delivery boy can perform.
const DELIVERY_STATUSES = ['Assigned', 'Out for Delivery', 'Delivered'];

// @route GET /api/delivery/orders  (assigned, active)
export const getAssignedOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    deliveryBoy: req.user._id,
    status: { $in: ['Assigned', 'Out for Delivery', 'Packed', 'Confirmed'] },
  })
    .sort({ createdAt: -1 })
    .populate('user', 'name phone');
  res.json({ success: true, orders });
});

// @route GET /api/delivery/history
export const getDeliveryHistory = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    deliveryBoy: req.user._id,
    status: { $in: ['Delivered', 'Cancelled'] },
  })
    .sort({ deliveredAt: -1, updatedAt: -1 })
    .populate('user', 'name phone');
  res.json({ success: true, orders });
});

// @route GET /api/delivery/order/:id
export const getDeliveryOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, deliveryBoy: req.user._id }).populate(
    'user',
    'name phone'
  );
  if (!order) throw new ApiError(404, 'Order not found or not assigned to you');
  res.json({ success: true, order });
});

// @route PUT /api/delivery/order/:id/status  { status }
export const updateDeliveryStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!DELIVERY_STATUSES.includes(status)) throw new ApiError(400, 'Invalid delivery status');

  const order = await Order.findOne({ _id: req.params.id, deliveryBoy: req.user._id });
  if (!order) throw new ApiError(404, 'Order not found or not assigned to you');

  order.status = status;
  order.statusHistory.push({ status, at: new Date(), note: `Updated by delivery partner` });

  if (status === 'Delivered') {
    order.deliveredAt = new Date();
    if (order.paymentMethod === 'COD') {
      order.codCollected = true;
      order.paymentStatus = 'Paid';
    }
    // Update delivery boy stats
    const profile = await DeliveryBoy.findOne({ user: req.user._id });
    if (profile) {
      profile.totalDeliveries += 1;
      if (order.paymentMethod === 'COD') profile.codCollected += order.total;
      await profile.save();
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

// @route PUT /api/delivery/order/:id/cod  { collected: true }
export const markCodCollected = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, deliveryBoy: req.user._id });
  if (!order) throw new ApiError(404, 'Order not found or not assigned to you');
  if (order.paymentMethod !== 'COD') throw new ApiError(400, 'This is not a COD order');
  order.codCollected = true;
  order.paymentStatus = 'Paid';
  await order.save();
  res.json({ success: true, order });
});

// @route GET /api/delivery/stats
export const getDeliveryStats = asyncHandler(async (req, res) => {
  const profile = await DeliveryBoy.findOne({ user: req.user._id });
  const [assigned, delivered] = await Promise.all([
    Order.countDocuments({
      deliveryBoy: req.user._id,
      status: { $in: ['Assigned', 'Out for Delivery'] },
    }),
    Order.countDocuments({ deliveryBoy: req.user._id, status: 'Delivered' }),
  ]);
  res.json({
    success: true,
    stats: {
      assigned,
      delivered,
      totalDeliveries: profile?.totalDeliveries || 0,
      codCollected: profile?.codCollected || 0,
    },
  });
});
