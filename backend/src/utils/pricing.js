import env from '../config/env.js';

/**
 * Price of a single pack of a product for a given option.
 * Weight products: price is per KG -> price * grams / 1000
 * Piece products: price is per piece -> price * pieces
 */
export const packPrice = (product, { unitType, grams = 0, pieces = 0 }) => {
  if (unitType === 'weight') {
    return Math.round((product.price * grams) / 1000);
  }
  return Math.round(product.price * pieces);
};

// Stock consumed by one pack (grams for weight, pieces for piece)
export const packStockUnits = ({ unitType, grams = 0, pieces = 0 }) =>
  unitType === 'weight' ? grams : pieces;

/**
 * Compute totals for a list of resolved items.
 * items: [{ lineTotal }]
 */
export const computeTotals = (items, { discount = 0, settings } = {}) => {
  const subtotal = items.reduce((sum, it) => sum + (it.lineTotal || 0), 0);
  const freeAbove = settings?.freeDeliveryAbove ?? env.freeDeliveryAbove;
  const baseDelivery = settings?.deliveryCharge ?? env.deliveryCharge;
  const afterDiscount = Math.max(subtotal - discount, 0);
  const deliveryCharge = subtotal >= freeAbove ? 0 : baseDelivery;
  const total = Math.max(afterDiscount + deliveryCharge, 0);
  return { subtotal, discount, deliveryCharge, total };
};
