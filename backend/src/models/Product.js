import mongoose from 'mongoose';

/**
 * Weight/unit system.
 * unitType:
 *   - 'weight'  -> price is per 1000g (per KG). Customer buys in grams/kg.
 *   - 'piece'   -> price is per 1 piece (PCS).
 *
 * For weight products we expose preset weight options (100g, 250g, 500g, 1kg, custom).
 * pricePerKg is the base; each option price is derived = pricePerKg * grams / 1000.
 */
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: '' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    images: [{ type: String }],

    unitType: { type: String, enum: ['weight', 'piece'], default: 'weight' },

    // MRP & selling price.
    // For weight products these are "per KG". For piece products these are "per piece".
    mrp: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 }, // selling price

    // Stock. For weight products stock is in grams. For piece products stock is in pieces.
    stock: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 1000 }, // grams or pieces

    // Preset options a customer can pick. Auto-generated for weight products if empty.
    // { label: '500g', grams: 500 }  OR  { label: '1 pc', pieces: 1 }
    options: [
      {
        label: String,
        grams: Number,
        pieces: Number,
      },
    ],

    isOrganic: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    tags: [String],
    rating: { type: Number, default: 4.3 },
    soldCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// discount % (virtual)
productSchema.virtual('discount').get(function discount() {
  if (!this.mrp || this.mrp <= 0) return 0;
  return Math.round(((this.mrp - this.price) / this.mrp) * 100);
});

productSchema.virtual('inStock').get(function inStock() {
  return this.stock > 0;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

const Product = mongoose.model('Product', productSchema);
export default Product;
