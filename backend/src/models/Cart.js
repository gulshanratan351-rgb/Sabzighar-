import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    // Chosen unit for this line
    unitType: { type: String, enum: ['weight', 'piece'], required: true },
    grams: { type: Number, default: 0 }, // for weight products
    pieces: { type: Number, default: 0 }, // for piece products
    quantity: { type: Number, default: 1, min: 1 }, // number of packs of the chosen option
    label: { type: String, default: '' }, // e.g. "500g" or "2 pc"
    // price snapshot for this single pack at add-time (recomputed on read for safety)
    unitPrice: { type: Number, default: 0 },
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [cartItemSchema],
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', default: null },
  },
  { timestamps: true }
);

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
