import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, default: '' },
    discountType: { type: String, enum: ['percent', 'flat'], default: 'percent' },
    discountValue: { type: Number, required: true, min: 0 },
    maxDiscount: { type: Number, default: 0 }, // cap for percent coupons (0 = no cap)
    minOrder: { type: Number, default: 0 },
    usageLimit: { type: Number, default: 0 }, // 0 = unlimited
    usedCount: { type: Number, default: 0 },
    expiresAt: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

couponSchema.methods.isValid = function isValid(subtotal) {
  if (!this.isActive) return { ok: false, reason: 'Coupon inactive' };
  if (this.expiresAt && this.expiresAt < new Date()) return { ok: false, reason: 'Coupon expired' };
  if (this.usageLimit > 0 && this.usedCount >= this.usageLimit)
    return { ok: false, reason: 'Coupon usage limit reached' };
  if (subtotal < this.minOrder)
    return { ok: false, reason: `Minimum order ₹${this.minOrder} required` };
  return { ok: true };
};

couponSchema.methods.calcDiscount = function calcDiscount(subtotal) {
  let d = 0;
  if (this.discountType === 'percent') {
    d = (subtotal * this.discountValue) / 100;
    if (this.maxDiscount > 0) d = Math.min(d, this.maxDiscount);
  } else {
    d = this.discountValue;
  }
  return Math.min(Math.round(d), subtotal);
};

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
