import mongoose from 'mongoose';

// Single-document store for global app settings controlled from Admin panel.
const settingSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'global', unique: true },
    storeName: { type: String, default: 'SabziGhar' },
    tagline: { type: String, default: 'Tazi Sabzi, Seedhe Ghar Tak' },
    supportPhone: { type: String, default: '+91 90000 00000' },
    supportEmail: { type: String, default: 'support@sabzighar.com' },
    deliveryCharge: { type: Number, default: 25 },
    freeDeliveryAbove: { type: Number, default: 299 },
    codEnabled: { type: Boolean, default: true },
    upiEnabled: { type: Boolean, default: true },
    upiId: { type: String, default: 'sabzighar@upi' },
    servicePincodes: [String],
    isStoreOpen: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Setting = mongoose.model('Setting', settingSchema);
export default Setting;
