import mongoose from 'mongoose';

/**
 * Delivery boys are stored as User documents with role='delivery',
 * but we keep an extra profile document with delivery-specific data.
 */
const deliveryBoySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    vehicleNumber: { type: String, default: '' },
    idProof: { type: String, default: '' },
    area: { type: String, default: '' },
    pincodes: [String],
    isAvailable: { type: Boolean, default: true },
    totalDeliveries: { type: Number, default: 0 },
    codCollected: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const DeliveryBoy = mongoose.model('DeliveryBoy', deliveryBoySchema);
export default DeliveryBoy;
