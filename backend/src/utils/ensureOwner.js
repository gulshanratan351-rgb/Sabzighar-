import User from '../models/User.js';
import Setting from '../models/Setting.js';
import env from '../config/env.js';

// Ensures the owner admin account + global settings exist on boot.
export const ensureOwnerAdmin = async () => {
  let owner = await User.findOne({ email: env.ownerEmail });
  if (!owner) {
    owner = await User.create({
      name: env.ownerName,
      email: env.ownerEmail,
      password: env.ownerPassword,
      role: 'admin',
      phone: '',
    });
    console.log(`👑 Owner admin created: ${env.ownerEmail}`);
  } else if (owner.role !== 'admin') {
    owner.role = 'admin';
    await owner.save();
  }

  const s = await Setting.findOne({ key: 'global' });
  if (!s) {
    await Setting.create({
      key: 'global',
      deliveryCharge: env.deliveryCharge,
      freeDeliveryAbove: env.freeDeliveryAbove,
    });
  }
};

export default ensureOwnerAdmin;
