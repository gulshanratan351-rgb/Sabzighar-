import mongoose from 'mongoose';
import env from '../config/env.js';
import connectDB from '../config/db.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Banner from '../models/Banner.js';
import Coupon from '../models/Coupon.js';
import User from '../models/User.js';
import DeliveryBoy from '../models/DeliveryBoy.js';
import Setting from '../models/Setting.js';
import { slugify, defaultWeightOptions, defaultPieceOptions } from '../utils/helpers.js';
import { categories, products, banners, coupons } from './data.js';

const run = async () => {
  await connectDB();
  console.log('🌱 Seeding database...');

  // Wipe collections we manage
  await Promise.all([
    Category.deleteMany({}),
    Product.deleteMany({}),
    Banner.deleteMany({}),
    Coupon.deleteMany({}),
    DeliveryBoy.deleteMany({}),
  ]);
  await User.deleteMany({ role: { $in: ['delivery'] } });
  await User.deleteMany({ email: 'customer@sabzighar.com' });

  // Settings
  await Setting.findOneAndUpdate(
    { key: 'global' },
    {
      key: 'global',
      storeName: 'SabziGhar',
      tagline: 'Tazi Sabzi, Seedhe Ghar Tak',
      deliveryCharge: env.deliveryCharge,
      freeDeliveryAbove: env.freeDeliveryAbove,
      codEnabled: true,
      upiEnabled: true,
      upiId: 'sabzighar@upi',
      isStoreOpen: true,
    },
    { upsert: true, new: true }
  );

  // Categories
  const catDocs = {};
  for (const c of categories) {
    const doc = await Category.create({ ...c, slug: slugify(c.name) });
    catDocs[c.name] = doc;
  }
  console.log(`✅ ${categories.length} categories`);

  // Products
  let count = 0;
  for (const p of products) {
    const options = p.unitType === 'weight' ? defaultWeightOptions() : defaultPieceOptions();
    await Product.create({
      name: p.name,
      slug: `${slugify(p.name)}-${Date.now().toString().slice(-5)}${count}`,
      description: p.desc || '',
      category: catDocs[p.cat]._id,
      unitType: p.unitType,
      mrp: p.mrp,
      price: p.price,
      stock: p.stock,
      images: p.images,
      options,
      isOrganic: !!p.organic,
      isFeatured: count % 3 === 0,
      lowStockThreshold: p.unitType === 'weight' ? 5000 : 20,
    });
    count += 1;
  }
  console.log(`✅ ${count} products`);

  // Banners & coupons
  await Banner.insertMany(banners);
  await Coupon.insertMany(coupons.map((c) => ({ ...c, code: c.code.toUpperCase() })));
  console.log(`✅ ${banners.length} banners, ${coupons.length} coupons`);

  // Owner admin
  let owner = await User.findOne({ email: env.ownerEmail });
  if (!owner) {
    owner = await User.create({
      name: env.ownerName,
      email: env.ownerEmail,
      password: env.ownerPassword,
      role: 'admin',
    });
  }
  console.log(`👑 Admin: ${env.ownerEmail} / ${env.ownerPassword}`);

  // Demo customer
  await User.create({
    name: 'Demo Customer',
    email: 'customer@sabzighar.com',
    phone: '9876543210',
    password: 'customer123',
    role: 'user',
    addresses: [
      {
        label: 'Home',
        fullName: 'Demo Customer',
        phone: '9876543210',
        house: '12, Green Residency',
        area: 'MG Road',
        city: 'Indore',
        state: 'MP',
        pincode: '452001',
        isDefault: true,
      },
    ],
  });
  console.log('👤 Customer: customer@sabzighar.com / customer123');

  // Demo delivery boy
  const boy = await User.create({
    name: 'Ravi Delivery',
    email: 'delivery@sabzighar.com',
    phone: '9998887776',
    password: 'delivery123',
    role: 'delivery',
  });
  await DeliveryBoy.create({
    user: boy._id,
    vehicleNumber: 'MP09-AB-1234',
    area: 'MG Road',
    pincodes: ['452001', '452002'],
  });
  console.log('🛵 Delivery: delivery@sabzighar.com / delivery123');

  console.log('🎉 Seeding complete!');
  await mongoose.connection.close();
  process.exit(0);
};

run().catch(async (err) => {
  console.error('❌ Seed failed:', err);
  await mongoose.connection.close();
  process.exit(1);
});
