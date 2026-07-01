import mongoose from 'mongoose';

export const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Packed',
  'Assigned',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    image: String,
    unitType: { type: String, enum: ['weight', 'piece'] },
    grams: Number,
    pieces: Number,
    quantity: Number, // packs
    label: String,
    unitPrice: Number, // price of a single pack
    lineTotal: Number, // unitPrice * quantity
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, enum: ORDER_STATUSES },
    at: { type: Date, default: Date.now },
    note: String,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNo: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],

    address: {
      fullName: String,
      phone: String,
      house: String,
      area: String,
      city: String,
      state: String,
      pincode: String,
      landmark: String,
      lat: Number,
      lng: Number,
    },

    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    couponCode: { type: String, default: '' },
    deliveryCharge: { type: Number, default: 0 },
    total: { type: Number, required: true },

    paymentMethod: { type: String, enum: ['COD', 'UPI'], default: 'COD' },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },

    status: { type: String, enum: ORDER_STATUSES, default: 'Pending' },
    statusHistory: [statusHistorySchema],

    deliveryBoy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    codCollected: { type: Boolean, default: false },
    codAmount: { type: Number, default: 0 },

    cancelReason: { type: String, default: '' },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

orderSchema.pre('validate', function genOrderNo(next) {
  if (!this.orderNo) {
    const rand = Math.floor(1000 + Math.random() * 9000);
    this.orderNo = `SG${Date.now().toString().slice(-8)}${rand}`;
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
