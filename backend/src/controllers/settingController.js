import Setting from '../models/Setting.js';
import asyncHandler from '../utils/asyncHandler.js';

const getGlobal = async () => {
  let s = await Setting.findOne({ key: 'global' });
  if (!s) s = await Setting.create({ key: 'global' });
  return s;
};

// @route GET /api/settings  (public — store config used by apps)
export const getSettings = asyncHandler(async (req, res) => {
  const s = await getGlobal();
  res.json({ success: true, settings: s });
});

// @route PUT /api/settings  (admin)
export const updateSettings = asyncHandler(async (req, res) => {
  const s = await getGlobal();
  const fields = [
    'storeName',
    'tagline',
    'supportPhone',
    'supportEmail',
    'deliveryCharge',
    'freeDeliveryAbove',
    'codEnabled',
    'upiEnabled',
    'upiId',
    'servicePincodes',
    'isStoreOpen',
  ];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) s[f] = req.body[f];
  });
  await s.save();
  res.json({ success: true, settings: s });
});
